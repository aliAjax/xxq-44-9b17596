export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const OPERATION_ACTIONS = {
  ADD: 'add',
  SAVE_DRAFT: 'save_draft',
  SUBMIT_REVIEW: 'submit_review',
  REVIEW_PASS: 'review_pass',
  REVIEW_REJECT: 'review_reject',
  FIRST_REVIEW_PASS: 'first_review_pass',
  FIRST_REVIEW_REJECT: 'first_review_reject',
  FINAL_REVIEW_PASS: 'final_review_pass',
  FINAL_REVIEW_REJECT: 'final_review_reject',
  DELETE: 'delete',
  RESTORE: 'restore',
  BATCH_IMPORT: 'batch_import',
  RESTORE_VERSION: 'restore_version',
  CLAIM_TASK: 'claim_task',
  RELEASE_TASK: 'release_task',
  FORCE_RELEASE_TASK: 'force_release_task',
}

export const VERSION_TYPES = {
  SAVE_DRAFT: 'save_draft',
  SUBMIT_REVIEW: 'submit_review',
  REVIEW_PASS: 'review_pass',
  REVIEW_REJECT: 'review_reject',
  FIRST_REVIEW_PASS: 'first_review_pass',
  FIRST_REVIEW_REJECT: 'first_review_reject',
  FINAL_REVIEW_PASS: 'final_review_pass',
  FINAL_REVIEW_REJECT: 'final_review_reject',
  INITIAL: 'initial',
  RESTORE: 'restore',
}

export const getVersionTypeText = (type) => {
  const typeMap = {
    [VERSION_TYPES.SAVE_DRAFT]: '保存草稿',
    [VERSION_TYPES.SUBMIT_REVIEW]: '提交审核',
    [VERSION_TYPES.REVIEW_PASS]: '审核通过',
    [VERSION_TYPES.REVIEW_REJECT]: '审核退回',
    [VERSION_TYPES.FIRST_REVIEW_PASS]: '初审通过',
    [VERSION_TYPES.FIRST_REVIEW_REJECT]: '初审退回',
    [VERSION_TYPES.FINAL_REVIEW_PASS]: '终审通过',
    [VERSION_TYPES.FINAL_REVIEW_REJECT]: '终审退回',
    [VERSION_TYPES.INITIAL]: '初始版本',
    [VERSION_TYPES.RESTORE]: '恢复版本',
  }
  return typeMap[type] || type
}

export const getVersionTypeColor = (type) => {
  const colorMap = {
    [VERSION_TYPES.SAVE_DRAFT]: 'bg-gray-100 text-gray-700',
    [VERSION_TYPES.SUBMIT_REVIEW]: 'bg-orange-100 text-orange-700',
    [VERSION_TYPES.REVIEW_PASS]: 'bg-green-100 text-green-700',
    [VERSION_TYPES.REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [VERSION_TYPES.FIRST_REVIEW_PASS]: 'bg-blue-100 text-blue-700',
    [VERSION_TYPES.FIRST_REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [VERSION_TYPES.FINAL_REVIEW_PASS]: 'bg-green-100 text-green-700',
    [VERSION_TYPES.FINAL_REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [VERSION_TYPES.INITIAL]: 'bg-purple-100 text-purple-700',
    [VERSION_TYPES.RESTORE]: 'bg-emerald-100 text-emerald-700',
  }
  return colorMap[type] || 'bg-gray-100 text-gray-700'
}

export const getActionText = (action) => {
  const actionMap = {
    [OPERATION_ACTIONS.ADD]: '新增信息',
    [OPERATION_ACTIONS.SAVE_DRAFT]: '保存草稿',
    [OPERATION_ACTIONS.SUBMIT_REVIEW]: '提交审核',
    [OPERATION_ACTIONS.REVIEW_PASS]: '审核通过',
    [OPERATION_ACTIONS.REVIEW_REJECT]: '审核退回',
    [OPERATION_ACTIONS.FIRST_REVIEW_PASS]: '初审通过',
    [OPERATION_ACTIONS.FIRST_REVIEW_REJECT]: '初审退回',
    [OPERATION_ACTIONS.FINAL_REVIEW_PASS]: '终审通过',
    [OPERATION_ACTIONS.FINAL_REVIEW_REJECT]: '终审退回',
    [OPERATION_ACTIONS.DELETE]: '删除',
    [OPERATION_ACTIONS.RESTORE]: '恢复',
    [OPERATION_ACTIONS.BATCH_IMPORT]: '批量导入',
    [OPERATION_ACTIONS.RESTORE_VERSION]: '恢复版本',
    [OPERATION_ACTIONS.CLAIM_TASK]: '认领任务',
    [OPERATION_ACTIONS.RELEASE_TASK]: '释放任务',
    [OPERATION_ACTIONS.FORCE_RELEASE_TASK]: '强制释放任务',
  }
  return actionMap[action] || action
}

export const getActionColor = (action) => {
  const colorMap = {
    [OPERATION_ACTIONS.ADD]: 'bg-blue-100 text-blue-700',
    [OPERATION_ACTIONS.SAVE_DRAFT]: 'bg-gray-100 text-gray-700',
    [OPERATION_ACTIONS.SUBMIT_REVIEW]: 'bg-orange-100 text-orange-700',
    [OPERATION_ACTIONS.REVIEW_PASS]: 'bg-green-100 text-green-700',
    [OPERATION_ACTIONS.REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [OPERATION_ACTIONS.FIRST_REVIEW_PASS]: 'bg-blue-100 text-blue-700',
    [OPERATION_ACTIONS.FIRST_REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [OPERATION_ACTIONS.FINAL_REVIEW_PASS]: 'bg-green-100 text-green-700',
    [OPERATION_ACTIONS.FINAL_REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [OPERATION_ACTIONS.DELETE]: 'bg-red-100 text-red-700',
    [OPERATION_ACTIONS.RESTORE]: 'bg-emerald-100 text-emerald-700',
    [OPERATION_ACTIONS.BATCH_IMPORT]: 'bg-purple-100 text-purple-700',
    [OPERATION_ACTIONS.RESTORE_VERSION]: 'bg-emerald-100 text-emerald-700',
    [OPERATION_ACTIONS.CLAIM_TASK]: 'bg-cyan-100 text-cyan-700',
    [OPERATION_ACTIONS.RELEASE_TASK]: 'bg-amber-100 text-amber-700',
    [OPERATION_ACTIONS.FORCE_RELEASE_TASK]: 'bg-rose-100 text-rose-700',
  }
  return colorMap[action] || 'bg-gray-100 text-gray-700'
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

export const getStatusText = (status, reviewStage = '') => {
  if (status === 'pending' && reviewStage === 'first_pending') {
    return '待初审'
  }
  if (status === 'first_reviewed') {
    return '待复审'
  }
  const statusMap = {
    draft: '草稿',
    pending: '待审核',
    first_reviewed: '待复审',
    published: '已发布',
    rejected: '已退回',
  }
  return statusMap[status] || status
}

export const getStatusColor = (status, reviewStage = '') => {
  if (status === 'first_reviewed') {
    return 'bg-blue-100 text-blue-700'
  }
  if (status === 'pending' && reviewStage === 'first_pending') {
    return 'bg-orange-100 text-orange-700'
  }
  const colorMap = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-orange-100 text-orange-700',
    first_reviewed: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-700'
}

export const getReviewStageText = (stage) => {
  const stageMap = {
    single: '一级审核',
    first: '初审',
    final: '终审',
  }
  return stageMap[stage] || stage
}

export const getReviewStageColor = (stage) => {
  const colorMap = {
    single: 'bg-gray-100 text-gray-700',
    first: 'bg-blue-100 text-blue-700',
    final: 'bg-purple-100 text-purple-700',
  }
  return colorMap[stage] || 'bg-gray-100 text-gray-700'
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
    reviewer: '初审人员',
    senior_reviewer: '复核人员',
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

export const isArticleClaimed = (article) => {
  return !!(article && article.claimantId && article.claimedAt)
}

export const isArticleClaimedByUser = (article, userId) => {
  if (!article || !userId) return false
  return article.claimantId === userId
}

export const canUserOperateArticle = (article, userId, _userRole) => {
  if (!article || !userId) return false
  if (!isArticleClaimed(article)) return false
  return article.claimantId === userId
}

export const canUserClaimArticle = (article, userId, _userRole, isArticlePendingForUser) => {
  if (!article || !userId) return false
  if (isArticleClaimed(article)) return false
  if (typeof isArticlePendingForUser === 'function') {
    return isArticlePendingForUser(article)
  }
  return true
}
