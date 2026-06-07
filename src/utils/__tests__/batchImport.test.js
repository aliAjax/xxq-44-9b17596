import { describe, it, expect } from 'vitest'
import {
  parseCSV,
  mapCSVRowToObject,
  validateRow,
  validateAllRows,
  parseAndValidateCSV,
  generateTemplateCSV,
  CSV_HEADERS,
  CSV_FIELD_MAP,
} from '../batchImport'

const mockCategories = [
  { id: '1', name: '政策法规', code: 'policy', status: 'active', sort: 1 },
  { id: '2', name: '通知公告', code: 'notice', status: 'active', sort: 2 },
  { id: '3', name: '规划计划', code: 'plan', status: 'active', sort: 3 },
]

const mockDepartments = [
  { id: '1', name: '办公室', status: 'active', sort: 1 },
  { id: '2', name: '政策法规科', status: 'active', sort: 2 },
  { id: '3', name: '综合业务科', status: 'active', sort: 3 },
]

const mockReviewFlowConfigs = [
  {
    id: '1',
    categoryCode: 'policy',
    categoryName: '政策法规',
    requireTwoLevel: false,
    validationRules: {
      requireAttachment: false,
      minContentLength: 0,
      requirePublishDate: false,
      forbidDuplicateTitle: true,
    },
  },
  {
    id: '2',
    categoryCode: 'notice',
    categoryName: '通知公告',
    requireTwoLevel: false,
    validationRules: {
      requireAttachment: true,
      minContentLength: 50,
      requirePublishDate: true,
      forbidDuplicateTitle: false,
    },
  },
]

const existingTitles = new Set([
  '关于开展2024年度政务公开培训的通知',
  '已存在的政策文件',
])

describe('CSV_HEADERS and CSV_FIELD_MAP', () => {
  it('should have correct headers in Chinese', () => {
    expect(CSV_HEADERS).toEqual([
      '标题',
      '类别',
      '发布科室',
      '发布日期',
      '正文',
      '附件名称',
      '附件链接',
    ])
  })

  it('should have correct field mapping', () => {
    expect(CSV_FIELD_MAP).toEqual([
      'title',
      'categoryCode',
      'department',
      'publishDate',
      'content',
      'attachmentName',
      'attachmentUrl',
    ])
  })

  it('headers and field map should have same length', () => {
    expect(CSV_HEADERS.length).toBe(CSV_FIELD_MAP.length)
  })
})

describe('parseCSV', () => {
  it('should parse simple CSV with header and one row', () => {
    const csv = '标题,类别,发布科室\n测试标题,notice,办公室'
    const result = parseCSV(csv)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual(['标题', '类别', '发布科室'])
    expect(result[1]).toEqual(['测试标题', 'notice', '办公室'])
  })

  it('should handle empty input', () => {
    expect(parseCSV('')).toEqual([])
  })

  it('should handle Windows line endings (\\r\\n)', () => {
    const csv = '标题,类别\r\n测试标题,notice'
    const result = parseCSV(csv)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual(['标题', '类别'])
  })

  it('should handle quoted fields with commas', () => {
    const csv = '标题,正文\n"测试,标题","正文,内容"'
    const result = parseCSV(csv)
    expect(result.length).toBe(2)
    expect(result[1][0]).toBe('测试,标题')
    expect(result[1][1]).toBe('正文,内容')
  })

  it('should handle quoted fields with newlines', () => {
    const csv = '标题,正文\n测试标题,"第一行\n第二行\n第三行"'
    const result = parseCSV(csv)
    expect(result.length).toBe(2)
    expect(result[1][1]).toBe('第一行\n第二行\n第三行')
  })

  it('should handle escaped double quotes inside quoted fields', () => {
    const csv = '标题\n"他说""你好"""'
    const result = parseCSV(csv)
    expect(result.length).toBe(2)
    expect(result[1][0]).toBe('他说"你好"')
  })

  it('should skip empty lines', () => {
    const csv = '标题,类别\n\n测试标题,notice\n\n'
    const result = parseCSV(csv)
    expect(result.length).toBe(2)
  })

  it('should handle fields with only whitespace', () => {
    const csv = '标题,类别\n  ,notice'
    const result = parseCSV(csv)
    expect(result[1][0]).toBe('  ')
  })
})

describe('mapCSVRowToObject', () => {
  it('should map CSV row array to object with correct fields', () => {
    const row = ['测试标题', 'notice', '办公室', '2024-06-01', '正文内容', '附件.pdf', 'https://example.com']
    const result = mapCSVRowToObject(row, 1)
    expect(result).toEqual({
      rowIndex: 1,
      title: '测试标题',
      categoryCode: 'notice',
      department: '办公室',
      publishDate: '2024-06-01',
      content: '正文内容',
      attachmentName: '附件.pdf',
      attachmentUrl: 'https://example.com',
      errors: [],
      warnings: [],
      isValid: false,
    })
  })

  it('should handle missing fields by defaulting to empty string', () => {
    const row = ['测试标题']
    const result = mapCSVRowToObject(row, 1)
    expect(result.title).toBe('测试标题')
    expect(result.categoryCode).toBe('')
    expect(result.department).toBe('')
    expect(result.publishDate).toBe('')
    expect(result.content).toBe('')
    expect(result.attachmentName).toBe('')
    expect(result.attachmentUrl).toBe('')
  })
})

describe('validateRow', () => {
  const baseRow = {
    rowIndex: 1,
    title: '测试标题',
    categoryCode: 'notice',
    department: '办公室',
    publishDate: '2024-06-01',
    content: '这是正文内容，长度应该足够了吧。再多写一些内容，确保字数足够。',
    attachmentName: '附件.pdf',
    attachmentUrl: 'https://example.com/attachment.pdf',
    errors: [],
    warnings: [],
    isValid: false,
  }

  it('should pass validation for valid data', () => {
    const result = validateRow(
      { ...baseRow },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('should report error when title is empty', () => {
    const result = validateRow(
      { ...baseRow, title: '' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('标题不能为空')
  })

  it('should report error when title is whitespace only', () => {
    const result = validateRow(
      { ...baseRow, title: '   ' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('标题不能为空')
  })

  it('should report error when content is empty', () => {
    const result = validateRow(
      { ...baseRow, content: '' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('正文不能为空')
  })

  it('should report error when category is empty', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: '' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('类别不能为空')
  })

  it('should report error when category code is invalid', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: 'invalid_code' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('类别代码"invalid_code"无效')
  })

  it('should report error when department is empty', () => {
    const result = validateRow(
      { ...baseRow, department: '' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('发布科室不能为空')
  })

  it('should report error when department does not exist', () => {
    const result = validateRow(
      { ...baseRow, department: '不存在的科室' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('发布科室"不存在的科室"不存在')
  })

  it('should report error when publish date format is invalid', () => {
    const result = validateRow(
      { ...baseRow, publishDate: 'invalid-date' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('发布日期"invalid-date"格式无效')
  })

  it('should allow empty publish date when category does not require it', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: 'policy', publishDate: '' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(true)
  })

  it('should warn when category requires attachment but none provided', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: 'notice', attachmentName: '', attachmentUrl: '' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(true)
    expect(result.warnings).toContain('该分类要求必须上传附件')
  })

  it('should pass attachment check when attachment name is provided', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: 'notice', attachmentName: 'test.pdf', attachmentUrl: '' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.warnings).not.toContain('该分类要求必须上传附件')
  })

  it('should pass attachment check when attachment url is provided', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: 'notice', attachmentName: '', attachmentUrl: 'https://example.com' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.warnings).not.toContain('该分类要求必须上传附件')
  })

  it('should warn when content length is below minimum required', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: 'notice', content: '短内容' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.warnings.some((w) => w.includes('正文内容字数不足'))).toBe(true)
  })

  it('should warn when category requires publish date but empty', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: 'notice', publishDate: '' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.warnings).toContain('该分类要求发布日期为必填项')
  })

  it('should warn when title duplicates existing article (general)', () => {
    const result = validateRow(
      { ...baseRow, title: '关于开展2024年度政务公开培训的通知' },
      mockCategories,
      mockDepartments,
      existingTitles,
      null,
      mockReviewFlowConfigs
    )
    expect(result.warnings.some((w) => w.includes('标题与现有文章重复'))).toBe(true)
  })

  it('should warn with category-specific message when forbidDuplicateTitle is true', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: 'policy', title: '关于开展2024年度政务公开培训的通知' },
      mockCategories,
      mockDepartments,
      existingTitles,
      null,
      mockReviewFlowConfigs
    )
    expect(result.warnings).toContain('该分类禁止重复标题，当前标题与现有文章重复')
  })

  it('should detect duplicate titles within allRows', () => {
    const allRows = [
      { ...baseRow, rowIndex: 1, title: '重复标题' },
      { ...baseRow, rowIndex: 2, title: '重复标题' },
    ]
    const result = validateRow(
      allRows[0],
      mockCategories,
      mockDepartments,
      new Set(),
      allRows,
      mockReviewFlowConfigs
    )
    expect(result.warnings).toContain('导入数据内存在重复标题')
  })

  it('should detect category-specific duplicate titles within allRows', () => {
    const allRows = [
      { ...baseRow, rowIndex: 1, categoryCode: 'policy', title: '重复标题' },
      { ...baseRow, rowIndex: 2, categoryCode: 'policy', title: '重复标题' },
    ]
    const result = validateRow(
      allRows[0],
      mockCategories,
      mockDepartments,
      new Set(),
      allRows,
      mockReviewFlowConfigs
    )
    expect(result.warnings).toContain('该分类禁止重复标题，导入数据内存在重复标题')
  })

  it('should trim whitespace when checking category code', () => {
    const result = validateRow(
      { ...baseRow, categoryCode: ' notice ' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(true)
  })

  it('should trim whitespace when checking department', () => {
    const result = validateRow(
      { ...baseRow, department: ' 办公室 ' },
      mockCategories,
      mockDepartments,
      new Set(),
      null,
      mockReviewFlowConfigs
    )
    expect(result.isValid).toBe(true)
  })
})

describe('validateAllRows', () => {
  it('should validate all rows and return array of validated rows', () => {
    const rows = [
      {
        rowIndex: 1,
        title: '有效标题1',
        categoryCode: 'notice',
        department: '办公室',
        publishDate: '2024-06-01',
        content: '足够长的正文内容，确保字数满足要求。继续添加更多内容。',
        attachmentName: '附件.pdf',
        attachmentUrl: 'https://example.com',
        errors: [],
        warnings: [],
        isValid: false,
      },
      {
        rowIndex: 2,
        title: '',
        categoryCode: 'notice',
        department: '办公室',
        publishDate: '2024-06-01',
        content: '正文内容',
        attachmentName: '',
        attachmentUrl: '',
        errors: [],
        warnings: [],
        isValid: false,
      },
    ]

    const result = validateAllRows(
      rows,
      mockCategories,
      mockDepartments,
      new Set(),
      mockReviewFlowConfigs
    )

    expect(result.length).toBe(2)
    expect(result[0].isValid).toBe(true)
    expect(result[1].isValid).toBe(false)
    expect(result[1].errors).toContain('标题不能为空')
  })
})

describe('parseAndValidateCSV', () => {
  const validCSV = `标题,类别,发布科室,发布日期,正文,附件名称,附件链接
测试标题,notice,办公室,2024-06-01,这是一段足够长的测试正文内容，用来验证字数是否满足最低要求。继续写一点内容确保超过50字。,测试附件.pdf,https://example.com/test.pdf`

  it('should return success: false when CSV has less than 2 rows', () => {
    const result = parseAndValidateCSV(
      '标题,类别,发布科室',
      mockCategories,
      mockDepartments,
      new Set(),
      mockReviewFlowConfigs
    )
    expect(result.success).toBe(false)
    expect(result.error).toBe('CSV文件格式不正确，至少需要表头和一行数据')
    expect(result.rows).toEqual([])
  })

  it('should successfully parse and validate valid CSV', () => {
    const result = parseAndValidateCSV(
      validCSV,
      mockCategories,
      mockDepartments,
      new Set(),
      mockReviewFlowConfigs
    )
    expect(result.success).toBe(true)
    expect(result.rows.length).toBe(1)
    expect(result.rows[0].isValid).toBe(true)
    expect(result.rows[0].title).toBe('测试标题')
    expect(result.rows[0].rowIndex).toBe(1)
  })

  it('should handle CSV with multiple data rows', () => {
    const csv = `标题,类别,发布科室,发布日期,正文,附件名称,附件链接
标题1,notice,办公室,2024-06-01,足够长的正文内容，字数要满足最低要求。再加点内容确保通过检查。,附件1.pdf,https://example.com/1.pdf
标题2,policy,政策法规科,2024-06-02,政策类正文内容，不需要那么长。,,
标题3,plan,综合业务科,,计划类正文内容，随便写点什么。,附件3.pdf,`
    const result = parseAndValidateCSV(
      csv,
      mockCategories,
      mockDepartments,
      new Set(),
      mockReviewFlowConfigs
    )
    expect(result.success).toBe(true)
    expect(result.rows.length).toBe(3)
    expect(result.rows[0].rowIndex).toBe(1)
    expect(result.rows[1].rowIndex).toBe(2)
    expect(result.rows[2].rowIndex).toBe(3)
  })
})

describe('generateTemplateCSV', () => {
  it('should generate CSV with correct header and sample data', () => {
    const result = generateTemplateCSV(mockCategories, mockDepartments)
    const lines = result.replace(/\r\n/g, '\n').split('\n')

    expect(lines[0]).toBe('标题,类别,发布科室,发布日期,正文,附件名称,附件链接')
    expect(lines.length).toBeGreaterThan(1)
    expect(result).toContain('关于开展2024年度政务公开培训的通知')
    expect(result).toContain('培训通知.pdf')
    expect(result).toContain('https://example.com/training.pdf')
  })

  it('should use first category code and first department name', () => {
    const result = generateTemplateCSV(mockCategories, mockDepartments)
    expect(result).toContain(mockCategories[0].code)
    expect(result).toContain(mockDepartments[0].name)
  })

  it('should use defaults when categories or departments are empty', () => {
    const result = generateTemplateCSV([], [])
    expect(result).toContain('notice')
    expect(result).toContain('办公室')
  })

  it('should include multi-line content in quotes', () => {
    const result = generateTemplateCSV(mockCategories, mockDepartments)
    expect(result).toContain('"各科室、各下属单位：')
    expect(result).toContain('一、培训时间')
  })
})
