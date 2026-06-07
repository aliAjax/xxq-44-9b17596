import { getValidationRules, getContentTextLength } from './helpers'

export const CSV_HEADERS = [
  '标题',
  '类别',
  '发布科室',
  '发布日期',
  '正文',
  '附件名称',
  '附件链接',
]

export const CSV_FIELD_MAP = [
  'title',
  'categoryCode',
  'department',
  'publishDate',
  'content',
  'attachmentName',
  'attachmentUrl',
]

export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  if (lines.length === 0) return []

  const result = []
  let currentRow = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '' && !inQuotes) continue

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      const nextChar = line[j + 1]

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"'
          j++
        } else if (char === '"') {
          inQuotes = false
        } else {
          currentField += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          currentRow.push(currentField)
          currentField = ''
        } else {
          currentField += char
        }
      }
    }

    if (inQuotes) {
      currentField += '\n'
    } else {
      currentRow.push(currentField)
      result.push(currentRow)
      currentRow = []
      currentField = ''
    }
  }

  if (currentRow.length > 0) {
    currentRow.push(currentField)
    result.push(currentRow)
  }

  return result
}

export function mapCSVRowToObject(row, rowIndex) {
  return {
    rowIndex,
    title: row[0] || '',
    categoryCode: row[1] || '',
    department: row[2] || '',
    publishDate: row[3] || '',
    content: row[4] || '',
    attachmentName: row[5] || '',
    attachmentUrl: row[6] || '',
    errors: [],
    warnings: [],
    isValid: false,
  }
}

export function validateRow(rowData, categories, departments, existingTitles, allRows, reviewFlowConfigs) {
  const errors = []
  const warnings = []

  const { title, categoryCode, department, publishDate, content, attachmentName, attachmentUrl } = rowData

  if (!title || !title.trim()) {
    errors.push('标题不能为空')
  }

  if (!content || !content.trim()) {
    errors.push('正文不能为空')
  }

  let category = null
  if (categoryCode && categoryCode.trim()) {
    category = categories.find((c) => c.code === categoryCode.trim())
    if (!category) {
      errors.push(`类别代码"${categoryCode}"无效`)
    }
  } else {
    errors.push('类别不能为空')
  }

  if (department && department.trim()) {
    const dept = departments.find((d) => d.name === department.trim())
    if (!dept) {
      errors.push(`发布科室"${department}"不存在`)
    }
  } else {
    errors.push('发布科室不能为空')
  }

  if (publishDate && publishDate.trim()) {
    const date = new Date(publishDate.trim())
    if (isNaN(date.getTime())) {
      errors.push(`发布日期"${publishDate}"格式无效`)
    }
  }

  if (category && reviewFlowConfigs) {
    const config = reviewFlowConfigs.find((c) => c.categoryCode === category.code)
    const rules = getValidationRules(config)

    if (rules.requireAttachment) {
      const hasAttachment =
        (attachmentName && attachmentName.trim()) || (attachmentUrl && attachmentUrl.trim())
      if (!hasAttachment) {
        warnings.push(`该分类要求必须上传附件`)
      }
    }

    if (rules.minContentLength > 0) {
      const contentLength = getContentTextLength(content)
      if (content && contentLength > 0 && contentLength < rules.minContentLength) {
        warnings.push(`正文内容字数不足 ${rules.minContentLength} 字（当前 ${contentLength} 字）`)
      }
    }

    if (rules.requirePublishDate && !publishDate) {
      warnings.push('该分类要求发布日期为必填项')
    }

    if (rules.forbidDuplicateTitle && title && title.trim()) {
      const trimmedTitle = title.trim()
      if (existingTitles.has(trimmedTitle)) {
        warnings.push('该分类禁止重复标题，当前标题与现有文章重复')
      }
      if (allRows) {
        const sameTitleCount = allRows.filter(
          (r) => r.title && r.title.trim() === trimmedTitle
        ).length
        if (sameTitleCount > 1) {
          if (!warnings.includes('该分类禁止重复标题，导入数据内存在重复标题')) {
            warnings.push('该分类禁止重复标题，导入数据内存在重复标题')
          }
        }
      }
    }
  }

  if (title && title.trim() && existingTitles.has(title.trim())) {
    if (!warnings.some((w) => w.includes('标题与现有文章重复') || w.includes('禁止重复标题'))) {
      warnings.push('标题与现有文章重复')
    }
  }

  if (title && title.trim() && allRows) {
    const sameTitleCount = allRows.filter(
      (r) => r.title && r.title.trim() === title.trim()
    ).length
    if (sameTitleCount > 1) {
      if (!warnings.some((w) => w.includes('导入数据内存在重复标题'))) {
        warnings.push('导入数据内存在重复标题')
      }
    }
  }

  return {
    ...rowData,
    errors,
    warnings,
    isValid: errors.length === 0,
  }
}

export function validateAllRows(rows, categories, departments, existingTitles, reviewFlowConfigs) {
  return rows.map((row) =>
    validateRow(row, categories, departments, existingTitles, rows, reviewFlowConfigs)
  )
}

export function parseAndValidateCSV(text, categories, departments, existingTitles, reviewFlowConfigs) {
  const rows = parseCSV(text)
  if (rows.length < 2) {
    return {
      success: false,
      error: 'CSV文件格式不正确，至少需要表头和一行数据',
      rows: [],
    }
  }

  const dataRows = rows.slice(1)
  const initialRows = dataRows.map((row, index) => mapCSVRowToObject(row, index + 1))
  const validatedRows = validateAllRows(
    initialRows,
    categories,
    departments,
    existingTitles,
    reviewFlowConfigs
  )

  return {
    success: true,
    rows: validatedRows,
  }
}

export function generateTemplateCSV(categories, departments) {
  const sampleCat = categories[0]
  const sampleDept = departments[0]
  const catCode = sampleCat ? sampleCat.code : 'notice'
  const deptName = sampleDept ? sampleDept.name : '办公室'
  return `标题,类别,发布科室,发布日期,正文,附件名称,附件链接
关于开展2024年度政务公开培训的通知,${catCode},${deptName},2024-06-01,"各科室、各下属单位：
为进一步提升政务公开工作水平，现就开展2024年度政务公开培训通知如下：
一、培训时间
二、培训地点
三、培训内容",培训通知.pdf,https://example.com/training.pdf
`
}
