import { stripHtml, truncateText } from './helpers'

export const FRONTEND_FILTERS = ['keyword', 'category', 'department', 'startDate', 'endDate', 'hasAttachment']
export const ADMIN_FILTERS = [...FRONTEND_FILTERS, 'status', 'deleted']

export const DEFAULT_FILTERS = {
  keyword: '',
  category: '',
  department: '',
  startDate: '',
  endDate: '',
  hasAttachment: '',
  status: '',
  deleted: '',
}

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const hasAttachment = (article) => {
  return !!(article.attachmentName && article.attachmentName.trim())
}

export const matchKeywordInText = (text, keyword) => {
  if (!keyword || !text) return false
  return text.toLowerCase().includes(keyword.toLowerCase())
}

export const matchKeywordInHtml = (html, keyword) => {
  if (!keyword || !html) return false
  const text = stripHtml(html)
  return text.toLowerCase().includes(keyword.toLowerCase())
}

export const filterArticles = (articles, filters, options = {}) => {
  const { isAdmin = false, sortBy = 'publishDate', sortOrder = 'desc', dateField = 'publishDate', statuses = null } = options

  let result = [...articles]

  if (!isAdmin) {
    result = result.filter((a) => a.status === 'published' && !a.deleted)
  }

  if (filters.deleted !== undefined && filters.deleted !== '') {
    if (filters.deleted === 'yes') {
      result = result.filter((a) => a.deleted)
    } else if (filters.deleted === 'no') {
      result = result.filter((a) => !a.deleted)
    }
  } else if (!isAdmin) {
    result = result.filter((a) => !a.deleted)
  }

  if (statuses && Array.isArray(statuses)) {
    result = result.filter((a) => statuses.includes(a.status))
  } else if (filters.status) {
    result = result.filter((a) => a.status === filters.status)
  }

  if (filters.category) {
    result = result.filter((a) => a.category === filters.category)
  }

  if (filters.department) {
    result = result.filter((a) => a.department === filters.department)
  }

  const getDateValue = (article) => {
    if (dateField === 'publishDate') return article.publishDate
    if (dateField === 'createdAt') return article.createdAt
    if (dateField === 'updatedAt') return article.updatedAt
    return article[dateField] || ''
  }

  if (filters.startDate) {
    result = result.filter((a) => {
      const dateVal = getDateValue(a)
      return dateVal && dateVal >= filters.startDate
    })
  }

  if (filters.endDate) {
    result = result.filter((a) => {
      const dateVal = getDateValue(a)
      return dateVal && dateVal <= filters.endDate
    })
  }

  if (filters.hasAttachment !== undefined && filters.hasAttachment !== '') {
    if (filters.hasAttachment === 'yes') {
      result = result.filter((a) => hasAttachment(a))
    } else if (filters.hasAttachment === 'no') {
      result = result.filter((a) => !hasAttachment(a))
    }
  }

  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    result = result.filter(
      (a) =>
        matchKeywordInText(a.title, kw) ||
        matchKeywordInHtml(a.content, kw)
    )
  }

  result.sort((a, b) => {
    let dateA, dateB
    if (sortBy === 'publishDate') {
      dateA = a.publishDate ? new Date(a.publishDate) : new Date(0)
      dateB = b.publishDate ? new Date(b.publishDate) : new Date(0)
    } else if (sortBy === 'createdAt') {
      dateA = new Date(a.createdAt || 0)
      dateB = new Date(b.createdAt || 0)
    } else if (sortBy === 'updatedAt') {
      dateA = new Date(a.updatedAt || 0)
      dateB = new Date(b.updatedAt || 0)
    } else {
      dateA = new Date(a.publishDate || 0)
      dateB = new Date(b.publishDate || 0)
    }
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  return result
}

export const paginateArticles = (articles, currentPage, pageSize) => {
  const totalPages = Math.ceil(articles.length / pageSize)
  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  const paginated = articles.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  )
  return {
    total: articles.length,
    totalPages,
    currentPage: safePage,
    pageSize,
    items: paginated,
  }
}

export const escapeHtml = (text) => {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export const splitByKeyword = (text, keyword) => {
  if (!keyword || !text) return [{ text: text || '', isMatch: false }]

  const lowerText = text.toLowerCase()
  const lowerKw = keyword.toLowerCase()
  const kwLength = keyword.length
  const segments = []
  let lastIndex = 0

  while (true) {
    const index = lowerText.indexOf(lowerKw, lastIndex)
    if (index === -1) {
      if (lastIndex < text.length) {
        segments.push({ text: text.slice(lastIndex), isMatch: false })
      }
      break
    }
    if (index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, index), isMatch: false })
    }
    segments.push({ text: text.slice(index, index + kwLength), isMatch: true })
    lastIndex = index + kwLength
  }

  return segments
}

export const highlightText = (text, keyword) => {
  if (!keyword || !text) return escapeHtml(text)

  const safeText = escapeHtml(text)
  const escapedKw = escapeRegExp(escapeHtml(keyword))
  const regex = new RegExp(`(${escapedKw})`, 'gi')

  return safeText.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>')
}

export const highlightHtmlContent = (html, keyword) => {
  if (!keyword || !html) return html

  const text = stripHtml(html)
  if (!text.toLowerCase().includes(keyword.toLowerCase())) {
    return html
  }

  const escaped = escapeRegExp(keyword)
  const regex = new RegExp(`(${escaped})`, 'gi')

  let result = ''
  let inTag = false
  let currentSegment = ''

  for (let i = 0; i < html.length; i++) {
    const char = html[i]

    if (char === '<') {
      if (!inTag && currentSegment) {
        result += currentSegment.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>')
        currentSegment = ''
      }
      inTag = true
      result += char
    } else if (char === '>') {
      inTag = false
      result += char
    } else if (inTag) {
      result += char
    } else {
      currentSegment += char
    }
  }

  if (currentSegment) {
    result += currentSegment.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>')
  }

  return result
}

export const getHighlightedSnippet = (html, keyword, maxLength = 120) => {
  if (!keyword || !html) return truncateText(stripHtml(html), maxLength)

  const text = stripHtml(html)
  const lowerText = text.toLowerCase()
  const lowerKw = keyword.toLowerCase()
  const index = lowerText.indexOf(lowerKw)

  if (index === -1) {
    return truncateText(text, maxLength)
  }

  const kwLength = keyword.length
  const halfLength = Math.floor((maxLength - kwLength) / 2)
  let start = Math.max(0, index - halfLength)
  let end = Math.min(text.length, index + kwLength + halfLength)

  if (start === 0) {
    end = Math.min(text.length, maxLength)
  } else if (end === text.length) {
    start = Math.max(0, text.length - maxLength)
  }

  let snippet = text.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  const escaped = escapeRegExp(keyword)
  const regex = new RegExp(`(${escaped})`, 'gi')

  return snippet.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>')
}

export const getActiveFilterCount = (filters, isAdmin = false) => {
  const keys = isAdmin ? ADMIN_FILTERS : FRONTEND_FILTERS
  let count = 0
  keys.forEach((key) => {
    if (filters[key] && filters[key] !== '') {
      count++
    }
  })
  return count
}

export const resetFilters = (isAdmin = false) => {
  const filters = { ...DEFAULT_FILTERS }
  if (!isAdmin) {
    delete filters.status
    delete filters.deleted
  }
  return filters
}
