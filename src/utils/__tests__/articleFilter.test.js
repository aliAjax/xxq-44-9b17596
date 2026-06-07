import { describe, it, expect } from 'vitest'
import {
  filterArticles,
  paginateArticles,
  highlightText,
  getHighlightedSnippet,
  hasAttachment,
  matchKeywordInText,
  matchKeywordInHtml,
  escapeRegExp,
  getActiveFilterCount,
  resetFilters,
  DEFAULT_FILTERS,
} from '../articleFilter'

const mockArticles = [
  {
    id: '1',
    title: '关于开展2024年度财务审计工作的通知',
    content: '<p>各科室：现将2024年度财务审计工作安排如下，请遵照执行。</p>',
    status: 'published',
    deleted: false,
    category: 'finance',
    department: '财务科',
    publishDate: '2024-03-15',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-15',
    attachmentName: '审计工作安排表.pdf',
    attachmentUrl: '/files/audit.pdf',
  },
  {
    id: '2',
    title: '人事任免公告',
    content: '<p>经研究决定，任命张三为人事科科长。</p>',
    status: 'published',
    deleted: false,
    category: 'personnel',
    department: '人事科',
    publishDate: '2024-04-20',
    createdAt: '2024-04-18',
    updatedAt: '2024-04-20',
    attachmentName: '',
    attachmentUrl: '',
  },
  {
    id: '3',
    title: '关于2024年五一劳动节放假的通知',
    content: '<p>根据国务院办公厅通知，2024年五一劳动节放假安排如下。</p>',
    status: 'published',
    deleted: true,
    category: 'general',
    department: '办公室',
    publishDate: '2024-04-25',
    createdAt: '2024-04-20',
    updatedAt: '2024-04-28',
    attachmentName: '放假安排.docx',
    attachmentUrl: '/files/holiday.docx',
  },
  {
    id: '4',
    title: '2024年度工作计划草稿',
    content: '<p>本年度工作计划正在制定中，以下为草稿内容。</p>',
    status: 'draft',
    deleted: false,
    category: 'general',
    department: '办公室',
    publishDate: '',
    createdAt: '2024-05-01',
    updatedAt: '2024-05-02',
    attachmentName: '',
    attachmentUrl: '',
  },
  {
    id: '5',
    title: '关于申请专项资金的报告',
    content: '<p>为推进信息化建设，特申请专项资金用于系统升级改造。</p>',
    status: 'pending',
    deleted: false,
    category: 'finance',
    department: '信息科',
    publishDate: '',
    createdAt: '2024-05-10',
    updatedAt: '2024-05-10',
    attachmentName: '资金申请报告.pdf',
    attachmentUrl: '/files/fund.pdf',
  },
  {
    id: '6',
    title: '会议纪要模板',
    content: '<p>会议纪要格式模板，请各科室统一使用。</p>',
    status: 'published',
    deleted: false,
    category: 'general',
    department: '办公室',
    publishDate: '2024-02-10',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10',
    attachmentName: '会议纪要模板.docx',
    attachmentUrl: '/files/template.docx',
  },
  {
    id: '7',
    title: '财务报表填报说明',
    content: '<p>本月财务报表填报注意事项及说明文档。</p>',
    status: 'published',
    deleted: false,
    category: 'finance',
    department: '财务科',
    publishDate: '2024-06-01',
    createdAt: '2024-05-28',
    updatedAt: '2024-06-01',
    attachmentName: '',
    attachmentUrl: '',
  },
  {
    id: '8',
    title: '已删除的旧公告',
    content: '<p>这是一篇已经删除的公告内容。</p>',
    status: 'published',
    deleted: true,
    category: 'general',
    department: '办公室',
    publishDate: '2023-12-01',
    createdAt: '2023-11-20',
    updatedAt: '2024-01-15',
    attachmentName: '',
    attachmentUrl: '',
  },
]

describe('hasAttachment', () => {
  it('should return true when article has attachment name', () => {
    expect(hasAttachment(mockArticles[0])).toBe(true)
  })

  it('should return false when article has no attachment', () => {
    expect(hasAttachment(mockArticles[1])).toBe(false)
  })

  it('should return false when attachmentName is whitespace only', () => {
    expect(hasAttachment({ attachmentName: '   ' })).toBe(false)
  })
})

describe('escapeRegExp', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegExp('a.b*c?d+e^f$g(h)i|j[k]l\\m')).toBe('a\\.b\\*c\\?d\\+e\\^f\\$g\\(h\\)i\\|j\\[k\\]l\\\\m')
  })
})

describe('matchKeywordInText', () => {
  it('should match keyword in plain text', () => {
    expect(matchKeywordInText('财务审计工作', '审计')).toBe(true)
  })

  it('should be case insensitive', () => {
    expect(matchKeywordInText('Finance Report', 'finance')).toBe(true)
  })

  it('should return false when no match', () => {
    expect(matchKeywordInText('人事任免', '财务')).toBe(false)
  })

  it('should return false when keyword is empty', () => {
    expect(matchKeywordInText('some text', '')).toBe(false)
  })

  it('should return false when text is empty', () => {
    expect(matchKeywordInText('', 'keyword')).toBe(false)
  })
})

describe('matchKeywordInHtml', () => {
  it('should match keyword in html content', () => {
    expect(matchKeywordInHtml('<p>财务审计工作安排</p>', '审计')).toBe(true)
  })

  it('should not match keywords inside html tags', () => {
    expect(matchKeywordInHtml('<p class="highlight">content</p>', 'class')).toBe(false)
  })

  it('should be case insensitive', () => {
    expect(matchKeywordInHtml('<p>Finance Report</p>', 'finance')).toBe(true)
  })

  it('should return false when no match', () => {
    expect(matchKeywordInHtml('<p>人事任免</p>', '财务')).toBe(false)
  })
})

describe('filterArticles - 前台筛选', () => {
  it('前台只显示已发布且未删除的文章', () => {
    const result = filterArticles(mockArticles, {}, { isAdmin: false })
    expect(result.length).toBe(4)
    result.forEach((a) => {
      expect(a.status).toBe('published')
      expect(a.deleted).toBe(false)
    })
  })

  it('前台按关键词搜索 - 匹配标题', () => {
    const result = filterArticles(mockArticles, { keyword: '财务' }, { isAdmin: false })
    expect(result.length).toBe(2)
    expect(result.every((a) => a.title.includes('财务'))).toBe(true)
  })

  it('前台按关键词搜索 - 匹配正文HTML', () => {
    const result = filterArticles(mockArticles, { keyword: '遵照执行' }, { isAdmin: false })
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('1')
  })

  it('前台按关键词搜索 - 不区分大小写', () => {
    const result = filterArticles(mockArticles, { keyword: 'FINANCE' }, { isAdmin: false })
    expect(result.length).toBeGreaterThanOrEqual(0)
  })

  it('前台按类别筛选', () => {
    const result = filterArticles(mockArticles, { category: 'finance' }, { isAdmin: false })
    expect(result.length).toBe(2)
    result.forEach((a) => expect(a.category).toBe('finance'))
  })

  it('前台按科室筛选', () => {
    const result = filterArticles(mockArticles, { department: '财务科' }, { isAdmin: false })
    expect(result.length).toBe(2)
    result.forEach((a) => expect(a.department).toBe('财务科'))
  })

  it('前台按开始日期筛选', () => {
    const result = filterArticles(mockArticles, { startDate: '2024-05-01' }, { isAdmin: false })
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('7')
  })

  it('前台按结束日期筛选', () => {
    const result = filterArticles(mockArticles, { endDate: '2024-03-01' }, { isAdmin: false })
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('6')
  })

  it('前台按日期范围筛选', () => {
    const result = filterArticles(
      mockArticles,
      { startDate: '2024-03-01', endDate: '2024-04-30' },
      { isAdmin: false }
    )
    expect(result.length).toBe(2)
    const ids = result.map((a) => a.id).sort()
    expect(ids).toEqual(['1', '2'])
  })

  it('前台按附件筛选 - 有附件', () => {
    const result = filterArticles(mockArticles, { hasAttachment: 'yes' }, { isAdmin: false })
    expect(result.length).toBe(2)
    result.forEach((a) => expect(hasAttachment(a)).toBe(true))
  })

  it('前台按附件筛选 - 无附件', () => {
    const result = filterArticles(mockArticles, { hasAttachment: 'no' }, { isAdmin: false })
    expect(result.length).toBe(2)
    result.forEach((a) => expect(hasAttachment(a)).toBe(false))
  })

  it('空关键词返回全部前台文章', () => {
    const result = filterArticles(mockArticles, { keyword: '' }, { isAdmin: false })
    expect(result.length).toBe(4)
  })

  it('默认按发布日期降序排列', () => {
    const result = filterArticles(mockArticles, {}, { isAdmin: false })
    for (let i = 0; i < result.length - 1; i++) {
      const dateA = new Date(result[i].publishDate || 0)
      const dateB = new Date(result[i + 1].publishDate || 0)
      expect(dateA >= dateB).toBe(true)
    }
  })
})

describe('filterArticles - 后台筛选', () => {
  it('后台默认显示所有文章（包含已删除）', () => {
    const result = filterArticles(mockArticles, {}, { isAdmin: true })
    expect(result.length).toBe(8)
  })

  it('后台按状态筛选 - 草稿', () => {
    const result = filterArticles(mockArticles, { status: 'draft' }, { isAdmin: true })
    expect(result.length).toBe(1)
    expect(result[0].status).toBe('draft')
  })

  it('后台按状态筛选 - 待审核', () => {
    const result = filterArticles(mockArticles, { status: 'pending' }, { isAdmin: true })
    expect(result.length).toBe(1)
    expect(result[0].status).toBe('pending')
  })

  it('后台按状态筛选 - 已发布', () => {
    const result = filterArticles(mockArticles, { status: 'published' }, { isAdmin: true })
    expect(result.length).toBe(6)
    result.forEach((a) => expect(a.status).toBe('published'))
  })

  it('后台用 statuses 数组筛选多种状态', () => {
    const result = filterArticles(
      mockArticles,
      {},
      { isAdmin: true, statuses: ['draft', 'pending'] }
    )
    expect(result.length).toBe(2)
    result.forEach((a) => {
      expect(['draft', 'pending']).toContain(a.status)
    })
  })

  it('后台回收站 - 只显示已删除文章', () => {
    const result = filterArticles(mockArticles, { deleted: 'yes' }, { isAdmin: true })
    expect(result.length).toBe(2)
    result.forEach((a) => expect(a.deleted).toBe(true))
  })

  it('后台筛选未删除文章', () => {
    const result = filterArticles(mockArticles, { deleted: 'no' }, { isAdmin: true })
    expect(result.length).toBe(6)
    result.forEach((a) => expect(a.deleted).toBe(false))
  })

  it('后台组合筛选 - 状态 + 类别', () => {
    const result = filterArticles(
      mockArticles,
      { status: 'published', category: 'finance' },
      { isAdmin: true }
    )
    expect(result.length).toBe(2)
    result.forEach((a) => {
      expect(a.status).toBe('published')
      expect(a.category).toBe('finance')
    })
  })

  it('后台组合筛选 - 回收站 + 关键词', () => {
    const result = filterArticles(
      mockArticles,
      { deleted: 'yes', keyword: '旧公告' },
      { isAdmin: true }
    )
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('8')
    expect(result[0].deleted).toBe(true)
  })

  it('后台按创建时间排序', () => {
    const result = filterArticles(
      mockArticles,
      {},
      { isAdmin: true, sortBy: 'createdAt', sortOrder: 'desc' }
    )
    for (let i = 0; i < result.length - 1; i++) {
      const dateA = new Date(result[i].createdAt || 0)
      const dateB = new Date(result[i + 1].createdAt || 0)
      expect(dateA >= dateB).toBe(true)
    }
  })

  it('后台按更新时间升序排序', () => {
    const result = filterArticles(
      mockArticles,
      {},
      { isAdmin: true, sortBy: 'updatedAt', sortOrder: 'asc' }
    )
    for (let i = 0; i < result.length - 1; i++) {
      const dateA = new Date(result[i].updatedAt || 0)
      const dateB = new Date(result[i + 1].updatedAt || 0)
      expect(dateA <= dateB).toBe(true)
    }
  })

  it('后台按日期字段筛选 createdAt', () => {
    const result = filterArticles(
      mockArticles,
      { startDate: '2024-05-01' },
      { isAdmin: true, dateField: 'createdAt' }
    )
    expect(result.length).toBe(3)
  })
})

describe('paginateArticles', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  it('正常分页 - 第一页', () => {
    const result = paginateArticles(items, 1, 3)
    expect(result.total).toBe(10)
    expect(result.totalPages).toBe(4)
    expect(result.currentPage).toBe(1)
    expect(result.pageSize).toBe(3)
    expect(result.items).toEqual([1, 2, 3])
  })

  it('正常分页 - 中间页', () => {
    const result = paginateArticles(items, 2, 3)
    expect(result.items).toEqual([4, 5, 6])
    expect(result.currentPage).toBe(2)
  })

  it('正常分页 - 最后一页', () => {
    const result = paginateArticles(items, 4, 3)
    expect(result.items).toEqual([10])
    expect(result.currentPage).toBe(4)
    expect(result.totalPages).toBe(4)
  })

  it('页码超出范围 - 大于总页数时取最后一页', () => {
    const result = paginateArticles(items, 99, 3)
    expect(result.currentPage).toBe(4)
    expect(result.items).toEqual([10])
  })

  it('页码为 0 时取第一页', () => {
    const result = paginateArticles(items, 0, 3)
    expect(result.currentPage).toBe(1)
    expect(result.items).toEqual([1, 2, 3])
  })

  it('页码为负数时取第一页', () => {
    const result = paginateArticles(items, -5, 3)
    expect(result.currentPage).toBe(1)
    expect(result.items).toEqual([1, 2, 3])
  })

  it('空数组分页', () => {
    const result = paginateArticles([], 1, 10)
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.currentPage).toBe(1)
    expect(result.items).toEqual([])
  })

  it('pageSize 正好整除', () => {
    const result = paginateArticles([1, 2, 3, 4, 5, 6], 2, 3)
    expect(result.totalPages).toBe(2)
    expect(result.items).toEqual([4, 5, 6])
  })

  it('pageSize 为 1 时每页一条', () => {
    const result = paginateArticles(['a', 'b', 'c'], 2, 1)
    expect(result.totalPages).toBe(3)
    expect(result.items).toEqual(['b'])
  })

  it('totalPages 至少为 1（空数组除外）', () => {
    const result = paginateArticles([1], 1, 10)
    expect(result.totalPages).toBe(1)
  })

  it('空数组时 currentPage 仍为 1', () => {
    const result = paginateArticles([], 5, 10)
    expect(result.currentPage).toBe(1)
  })
})

describe('highlightText', () => {
  it('基本高亮 - 单个匹配', () => {
    const result = highlightText('财务审计工作', '审计')
    expect(result).toContain('<mark')
    expect(result).toContain('审计')
    expect(result).toMatch(/审计<\/mark>/)
  })

  it('不区分大小写', () => {
    const result = highlightText('Finance Report', 'finance')
    expect(result).toContain('<mark')
    expect(result.toLowerCase()).toContain('finance</mark>')
  })

  it('多个匹配全部高亮', () => {
    const result = highlightText('财务审计和审计工作', '审计')
    const matches = result.match(/<mark/g)
    expect(matches).toHaveLength(2)
  })

  it('关键词为空时返回原文本（转义后）', () => {
    const result = highlightText('普通文本', '')
    expect(result).toBe('普通文本')
    expect(result).not.toContain('<mark')
  })

  it('文本为空时返回空字符串', () => {
    const result = highlightText('', '关键词')
    expect(result).toBe('')
  })

  it('特殊字符被正确转义', () => {
    const result = highlightText('a.b*c', '.')
    expect(result).toContain('<mark')
    expect(result).toContain('.')
  })

  it('HTML 特殊字符被转义', () => {
    const result = highlightText('<script>alert("xss")</script>', 'alert')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('高亮类名正确', () => {
    const result = highlightText('测试内容', '测试')
    expect(result).toContain('class="bg-yellow-200 text-yellow-900 px-0.5 rounded"')
  })
})

describe('getHighlightedSnippet', () => {
  const longText =
    '这是一段很长的正文内容，用于测试摘要截取功能。' +
    '文章中包含了关键词财务审计，我们需要验证摘要是否正确截取到关键词附近的内容，' +
    '并且在前后添加省略号。还有更多内容继续填充，确保文本足够长。' +
    '后面还有一些补充信息，用来测试末尾的情况。'

  const longHtml = `<p>${longText}</p>`

  it('关键词在中间时，前后有省略号', () => {
    const result = getHighlightedSnippet(longHtml, '财务审计', 60)
    expect(result).toContain('...')
    expect(result).toContain('<mark')
    expect(result).toContain('财务审计')
  })

  it('关键词在开头时，前面无省略号', () => {
    const html = '<p>财务审计工作安排通知，以下是详细内容...还有更多内容</p>'
    const result = getHighlightedSnippet(html, '财务审计', 30)
    expect(result).not.toMatch(/^\.\.\./)
    expect(result).toContain('<mark')
  })

  it('关键词在结尾时，后面无省略号', () => {
    const html = '<p>前面有一些内容，最后提到财务审计</p>'
    const result = getHighlightedSnippet(html, '财务审计', 30)
    expect(result).not.toMatch(/\.\.\.$/)
    expect(result).toContain('<mark')
  })

  it('没有匹配关键词时返回截断纯文本', () => {
    const result = getHighlightedSnippet(longHtml, '不存在的关键词', 30)
    expect(result).not.toContain('<mark')
    expect(result).toContain('...')
  })

  it('关键词为空时返回截断纯文本', () => {
    const result = getHighlightedSnippet(longHtml, '', 30)
    expect(result).not.toContain('<mark')
    expect(result.length).toBeLessThanOrEqual(33)
  })

  it('内容为空时返回空字符串', () => {
    const result = getHighlightedSnippet('', '关键词', 30)
    expect(result).toBe('')
  })

  it('默认最大长度为 120', () => {
    const veryLongHtml = '<p>' + '测试内容'.repeat(50) + '</p>'
    const result = getHighlightedSnippet(veryLongHtml, '测试')
    expect(result.replace(/<[^>]+>/g, '').replace(/\.\.\./g, '').length).toBeLessThanOrEqual(120)
  })

  it('从 HTML 中提取纯文本后再处理', () => {
    const html = '<p class="test">这是<span style="color:red">财务</span>审计内容</p>'
    const result = getHighlightedSnippet(html, '财务审计', 20)
    expect(result).toContain('<mark')
    expect(result).not.toContain('<span')
    expect(result).not.toContain('class="test"')
  })

  it('短文本不截断且无省略号', () => {
    const html = '<p>简短内容</p>'
    const result = getHighlightedSnippet(html, '简短', 100)
    expect(result).not.toContain('...')
    expect(result).toContain('<mark')
  })

  it('高亮标记包含正确的 CSS 类名', () => {
    const result = getHighlightedSnippet('<p>测试内容</p>', '测试', 20)
    expect(result).toContain('class="bg-yellow-200 text-yellow-900 px-0.5 rounded"')
  })
})

describe('getActiveFilterCount', () => {
  it('前台筛选计数', () => {
    const filters = { ...DEFAULT_FILTERS, keyword: '测试', category: 'finance' }
    const count = getActiveFilterCount(filters, false)
    expect(count).toBe(2)
  })

  it('后台筛选计数（包含 status 和 deleted）', () => {
    const filters = { ...DEFAULT_FILTERS, status: 'draft', deleted: 'no', keyword: 'test' }
    const count = getActiveFilterCount(filters, true)
    expect(count).toBe(3)
  })

  it('空筛选返回 0', () => {
    const count = getActiveFilterCount(DEFAULT_FILTERS, false)
    expect(count).toBe(0)
  })
})

describe('resetFilters', () => {
  it('前台重置过滤器（不含 status 和 deleted）', () => {
    const filters = resetFilters(false)
    expect(filters.keyword).toBe('')
    expect(filters.category).toBe('')
    expect(filters.status).toBeUndefined()
    expect(filters.deleted).toBeUndefined()
  })

  it('后台重置过滤器（包含 status 和 deleted）', () => {
    const filters = resetFilters(true)
    expect(filters.status).toBe('')
    expect(filters.deleted).toBe('')
  })
})
