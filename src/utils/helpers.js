export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    pending: '待审核',
    published: '已发布',
    rejected: '已退回',
  }
  return statusMap[status] || status
}

export const getStatusColor = (status) => {
  const colorMap = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-orange-100 text-orange-700',
    published: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-700'
}

export const stripHtml = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const getRoleText = (role) => {
  const roleMap = {
    editor: '工作人员',
    reviewer: '审核人员',
  }
  return roleMap[role] || role
}

export const getPublishedArticles = (articles) => {
  return articles.filter((a) => a.status === 'published' && !a.deleted)
}

export const countByCategory = (articles, categories) => {
  const published = getPublishedArticles(articles)
  return categories.map((cat) => ({
    ...cat,
    count: published.filter((a) => a.category === cat.code).length,
  }))
}

export const groupByMonth = (articles) => {
  const published = getPublishedArticles(articles)
  const groups = {}

  published.forEach((article) => {
    if (!article.publishDate) return
    const date = new Date(article.publishDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${month}`

    if (!groups[key]) {
      groups[key] = {
        year,
        month,
        label: `${year}年${month}月`,
        articles: [],
      }
    }
    groups[key].articles.push(article)
  })

  const result = Object.values(groups).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  result.forEach((group) => {
    group.articles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
  })

  return result
}

export const getMonthLabel = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}年${month}月`
}

export const groupByDate = (articles) => {
  const groups = {}
  const validArticles = articles.filter((a) => !a.deleted)

  validArticles.forEach((article) => {
    if (!article.publishDate) return
    const dateStr = formatDate(article.publishDate)
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    groups[dateStr].push(article)
  })

  return groups
}

export const getPendingWithoutDate = (articles) => {
  return articles.filter((a) => !a.deleted && a.status === 'pending' && !a.publishDate)
}

export const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const days = []

  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    days.push({
      date: formatDate(date),
      day,
      isCurrentMonth: false,
    })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    days.push({
      date: formatDate(date),
      day: i,
      isCurrentMonth: true,
    })
  }

  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date: formatDate(date),
      day: i,
      isCurrentMonth: false,
    })
  }

  return days
}

export const getStatusCountByDate = (articles, dateStr) => {
  const dayArticles = articles.filter(
    (a) => !a.deleted && a.publishDate && formatDate(a.publishDate) === dateStr
  )
  return {
    total: dayArticles.length,
    published: dayArticles.filter((a) => a.status === 'published').length,
    pending: dayArticles.filter((a) => a.status === 'pending').length,
    rejected: dayArticles.filter((a) => a.status === 'rejected').length,
    draft: dayArticles.filter((a) => a.status === 'draft').length,
    articles: dayArticles,
  }
}
