export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const OPERATION_ACTIONS = {
  ADD: 'add',
  SAVE_DRAFT: 'save_draft',
  SUBMIT_REVIEW: 'submit_review',
  RESUBMIT_REVIEW: 'resubmit_review',
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
  SCHEDULE_PUBLISH_DATE: 'schedule_publish_date',
  SAVE_IMPORT_DRAFT: 'save_import_draft',
  LOAD_IMPORT_DRAFT: 'load_import_draft',
  DELETE_IMPORT_DRAFT: 'delete_import_draft',
  PARTIAL_BATCH_IMPORT: 'partial_batch_import',
  ADD_CATEGORY: 'add_category',
  UPDATE_CATEGORY: 'update_category',
  DISABLE_CATEGORY: 'disable_category',
  ENABLE_CATEGORY: 'enable_category',
  ADD_DEPARTMENT: 'add_department',
  UPDATE_DEPARTMENT: 'update_department',
  DISABLE_DEPARTMENT: 'disable_department',
  ENABLE_DEPARTMENT: 'enable_department',
  ROLLBACK_REQUEST: 'rollback_request',
  ROLLBACK_APPROVE: 'rollback_approve',
  ROLLBACK_REJECT: 'rollback_reject',
}

export const ROLLBACK_STATUS = {
  PENDING: 'rollback_pending',
  APPROVED: 'rollback_approved',
  REJECTED: 'rollback_rejected',
}

export const VERSION_TYPES = {
  SAVE_DRAFT: 'save_draft',
  SUBMIT_REVIEW: 'submit_review',
  RESUBMIT_REVIEW: 'resubmit_review',
  REVIEW_PASS: 'review_pass',
  REVIEW_REJECT: 'review_reject',
  FIRST_REVIEW_PASS: 'first_review_pass',
  FIRST_REVIEW_REJECT: 'first_review_reject',
  FINAL_REVIEW_PASS: 'final_review_pass',
  FINAL_REVIEW_REJECT: 'final_review_reject',
  INITIAL: 'initial',
  RESTORE: 'restore',
  SCHEDULE_PUBLISH_DATE: 'schedule_publish_date',
}

export const getVersionTypeText = (type) => {
  const typeMap = {
    [VERSION_TYPES.SAVE_DRAFT]: '保存草稿',
    [VERSION_TYPES.SUBMIT_REVIEW]: '提交审核',
    [VERSION_TYPES.RESUBMIT_REVIEW]: '整改重提',
    [VERSION_TYPES.REVIEW_PASS]: '审核通过',
    [VERSION_TYPES.REVIEW_REJECT]: '审核退回',
    [VERSION_TYPES.FIRST_REVIEW_PASS]: '初审通过',
    [VERSION_TYPES.FIRST_REVIEW_REJECT]: '初审退回',
    [VERSION_TYPES.FINAL_REVIEW_PASS]: '终审通过',
    [VERSION_TYPES.FINAL_REVIEW_REJECT]: '终审退回',
    [VERSION_TYPES.INITIAL]: '初始版本',
    [VERSION_TYPES.RESTORE]: '恢复版本',
    [VERSION_TYPES.SCHEDULE_PUBLISH_DATE]: '调整发布日期',
  }
  return typeMap[type] || type
}

export const getVersionTypeColor = (type) => {
  const colorMap = {
    [VERSION_TYPES.SAVE_DRAFT]: 'bg-gray-100 text-gray-700',
    [VERSION_TYPES.SUBMIT_REVIEW]: 'bg-orange-100 text-orange-700',
    [VERSION_TYPES.RESUBMIT_REVIEW]: 'bg-amber-100 text-amber-700',
    [VERSION_TYPES.REVIEW_PASS]: 'bg-green-100 text-green-700',
    [VERSION_TYPES.REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [VERSION_TYPES.FIRST_REVIEW_PASS]: 'bg-blue-100 text-blue-700',
    [VERSION_TYPES.FIRST_REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [VERSION_TYPES.FINAL_REVIEW_PASS]: 'bg-green-100 text-green-700',
    [VERSION_TYPES.FINAL_REVIEW_REJECT]: 'bg-red-100 text-red-700',
    [VERSION_TYPES.INITIAL]: 'bg-purple-100 text-purple-700',
    [VERSION_TYPES.RESTORE]: 'bg-emerald-100 text-emerald-700',
    [VERSION_TYPES.SCHEDULE_PUBLISH_DATE]: 'bg-amber-100 text-amber-700',
  }
  return colorMap[type] || 'bg-gray-100 text-gray-700'
}

export const getActionText = (action) => {
  const actionMap = {
    [OPERATION_ACTIONS.ADD]: '新增信息',
    [OPERATION_ACTIONS.SAVE_DRAFT]: '保存草稿',
    [OPERATION_ACTIONS.SUBMIT_REVIEW]: '提交审核',
    [OPERATION_ACTIONS.RESUBMIT_REVIEW]: '整改重提',
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
    [OPERATION_ACTIONS.SCHEDULE_PUBLISH_DATE]: '调整发布日期',
    [OPERATION_ACTIONS.SAVE_IMPORT_DRAFT]: '保存导入草稿',
    [OPERATION_ACTIONS.LOAD_IMPORT_DRAFT]: '加载导入草稿',
    [OPERATION_ACTIONS.DELETE_IMPORT_DRAFT]: '删除导入草稿',
    [OPERATION_ACTIONS.PARTIAL_BATCH_IMPORT]: '批量部分导入',
    [OPERATION_ACTIONS.ADD_CATEGORY]: '新增公开类别',
    [OPERATION_ACTIONS.UPDATE_CATEGORY]: '编辑公开类别',
    [OPERATION_ACTIONS.DISABLE_CATEGORY]: '停用公开类别',
    [OPERATION_ACTIONS.ENABLE_CATEGORY]: '启用公开类别',
    [OPERATION_ACTIONS.ADD_DEPARTMENT]: '新增科室',
    [OPERATION_ACTIONS.UPDATE_DEPARTMENT]: '编辑科室',
    [OPERATION_ACTIONS.DISABLE_DEPARTMENT]: '停用科室',
    [OPERATION_ACTIONS.ENABLE_DEPARTMENT]: '启用科室',
    [OPERATION_ACTIONS.ROLLBACK_REQUEST]: '申请回滚',
    [OPERATION_ACTIONS.ROLLBACK_APPROVE]: '回滚通过',
    [OPERATION_ACTIONS.ROLLBACK_REJECT]: '回滚驳回',
  }
  return actionMap[action] || action
}

export const getActionColor = (action) => {
  const colorMap = {
    [OPERATION_ACTIONS.ADD]: 'bg-blue-100 text-blue-700',
    [OPERATION_ACTIONS.SAVE_DRAFT]: 'bg-gray-100 text-gray-700',
    [OPERATION_ACTIONS.SUBMIT_REVIEW]: 'bg-orange-100 text-orange-700',
    [OPERATION_ACTIONS.RESUBMIT_REVIEW]: 'bg-amber-100 text-amber-700',
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
    [OPERATION_ACTIONS.SCHEDULE_PUBLISH_DATE]: 'bg-amber-100 text-amber-700',
    [OPERATION_ACTIONS.SAVE_IMPORT_DRAFT]: 'bg-indigo-100 text-indigo-700',
    [OPERATION_ACTIONS.LOAD_IMPORT_DRAFT]: 'bg-sky-100 text-sky-700',
    [OPERATION_ACTIONS.DELETE_IMPORT_DRAFT]: 'bg-rose-100 text-rose-700',
    [OPERATION_ACTIONS.PARTIAL_BATCH_IMPORT]: 'bg-violet-100 text-violet-700',
    [OPERATION_ACTIONS.ADD_CATEGORY]: 'bg-blue-100 text-blue-700',
    [OPERATION_ACTIONS.UPDATE_CATEGORY]: 'bg-indigo-100 text-indigo-700',
    [OPERATION_ACTIONS.DISABLE_CATEGORY]: 'bg-gray-100 text-gray-700',
    [OPERATION_ACTIONS.ENABLE_CATEGORY]: 'bg-green-100 text-green-700',
    [OPERATION_ACTIONS.ADD_DEPARTMENT]: 'bg-blue-100 text-blue-700',
    [OPERATION_ACTIONS.UPDATE_DEPARTMENT]: 'bg-indigo-100 text-indigo-700',
    [OPERATION_ACTIONS.DISABLE_DEPARTMENT]: 'bg-gray-100 text-gray-700',
    [OPERATION_ACTIONS.ENABLE_DEPARTMENT]: 'bg-green-100 text-green-700',
    [OPERATION_ACTIONS.ROLLBACK_REQUEST]: 'bg-orange-100 text-orange-700',
    [OPERATION_ACTIONS.ROLLBACK_APPROVE]: 'bg-emerald-100 text-emerald-700',
    [OPERATION_ACTIONS.ROLLBACK_REJECT]: 'bg-red-100 text-red-700',
  }
  return colorMap[action] || 'bg-gray-100 text-gray-700'
}

export const getRollbackStatusText = (status) => {
  const statusMap = {
    [ROLLBACK_STATUS.PENDING]: '待审核',
    [ROLLBACK_STATUS.APPROVED]: '已通过',
    [ROLLBACK_STATUS.REJECTED]: '已驳回',
  }
  return statusMap[status] || status
}

export const getRollbackStatusColor = (status) => {
  const colorMap = {
    [ROLLBACK_STATUS.PENDING]: 'bg-orange-100 text-orange-700',
    [ROLLBACK_STATUS.APPROVED]: 'bg-green-100 text-green-700',
    [ROLLBACK_STATUS.REJECTED]: 'bg-red-100 text-red-700',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-700'
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
  return articles.filter((a) => !a.deleted && a.status !== 'rejected' && !a.publishDate && a.status !== 'published')
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
    (a) => !a.deleted && a.status !== 'rejected' && a.publishDate && formatDate(a.publishDate) === dateStr
  )
  return {
    total: dayArticles.length,
    published: dayArticles.filter((a) => a.status === 'published').length,
    pending: dayArticles.filter((a) => a.status === 'pending').length,
    rejected: dayArticles.filter((a) => a.status === 'rejected').length,
    draft: dayArticles.filter((a) => a.status === 'draft').length,
    first_reviewed: dayArticles.filter((a) => a.status === 'first_reviewed').length,
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

export const TIMEOUT_STATUS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  OVERDUE: 'overdue',
}

export const REVIEW_STAGE_TYPE = {
  SINGLE: 'single',
  FIRST: 'first',
  FINAL: 'final',
}

export const DEFAULT_TIMEOUT_CONFIG = {
  singleReviewHours: 24,
  firstReviewHours: 24,
  finalReviewHours: 24,
  warningHours: 4,
}

export const getTimeoutConfig = (reviewFlowConfig) => {
  if (!reviewFlowConfig || !reviewFlowConfig.timeoutConfig) {
    return { ...DEFAULT_TIMEOUT_CONFIG }
  }
  return {
    ...DEFAULT_TIMEOUT_CONFIG,
    ...reviewFlowConfig.timeoutConfig,
  }
}

export const getTimeoutStatusText = (status) => {
  const statusMap = {
    [TIMEOUT_STATUS.NORMAL]: '正常',
    [TIMEOUT_STATUS.WARNING]: '即将超时',
    [TIMEOUT_STATUS.OVERDUE]: '已超时',
  }
  return statusMap[status] || status
}

export const getTimeoutStatusColor = (status) => {
  const colorMap = {
    [TIMEOUT_STATUS.NORMAL]: 'bg-green-100 text-green-700',
    [TIMEOUT_STATUS.WARNING]: 'bg-amber-100 text-amber-700',
    [TIMEOUT_STATUS.OVERDUE]: 'bg-red-100 text-red-700',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-700'
}

const parseDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return null
  const date = new Date(dateTimeStr)
  if (isNaN(date.getTime())) return null
  return date
}

export const calculateTimeoutInfo = (article, reviewFlowConfig, now = new Date()) => {
  if (!article) {
    return { status: TIMEOUT_STATUS.NORMAL, remainingHours: 0, totalHours: 0, deadline: null, startTime: null }
  }

  const timeoutConfig = getTimeoutConfig(reviewFlowConfig)
  const status = article.status
  const reviewStage = article.reviewStage || ''
  const needTwoLevel = reviewFlowConfig ? reviewFlowConfig.requireTwoLevel : false

  let stageType = ''
  let startTime = null
  let totalHours = 0

  if (status === 'pending') {
    if (needTwoLevel && reviewStage === 'first_pending') {
      stageType = REVIEW_STAGE_TYPE.FIRST
      totalHours = timeoutConfig.firstReviewHours
    } else {
      stageType = REVIEW_STAGE_TYPE.SINGLE
      totalHours = timeoutConfig.singleReviewHours
    }
    if (article.firstReviewStartTime) {
      startTime = parseDateTime(article.firstReviewStartTime)
    }
    if (!startTime && article.submittedAt) {
      startTime = parseDateTime(article.submittedAt)
    }
    if (!startTime && article.createdAt) {
      startTime = parseDateTime(article.createdAt)
    }
  } else if (status === 'first_reviewed') {
    stageType = REVIEW_STAGE_TYPE.FINAL
    totalHours = timeoutConfig.finalReviewHours
    if (article.finalReviewStartTime) {
      startTime = parseDateTime(article.finalReviewStartTime)
    }
    if (!startTime && article.firstReviewedAt) {
      startTime = parseDateTime(article.firstReviewedAt)
    }
  }

  if (!startTime || totalHours <= 0) {
    return {
      status: TIMEOUT_STATUS.NORMAL,
      remainingHours: 0,
      totalHours,
      deadline: null,
      startTime: startTime ? startTime.toISOString() : null,
      stageType,
    }
  }

  const deadline = new Date(startTime.getTime() + totalHours * 60 * 60 * 1000)
  const diffMs = deadline.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  let timeoutStatus = TIMEOUT_STATUS.NORMAL
  if (diffMs <= 0) {
    timeoutStatus = TIMEOUT_STATUS.OVERDUE
  } else if (diffHours <= timeoutConfig.warningHours) {
    timeoutStatus = TIMEOUT_STATUS.WARNING
  }

  return {
    status: timeoutStatus,
    remainingHours: Math.max(0, diffHours),
    totalHours,
    deadline: deadline.toISOString(),
    startTime: startTime.toISOString(),
    stageType,
  }
}

export const formatRemainingTime = (remainingHours) => {
  if (remainingHours <= 0) return '已超时'
  if (remainingHours < 1) {
    const minutes = Math.ceil(remainingHours * 60)
    return `剩余 ${minutes} 分钟`
  }
  if (remainingHours < 24) {
    const hours = Math.floor(remainingHours)
    const minutes = Math.round((remainingHours - hours) * 60)
    if (minutes === 0) {
      return `剩余 ${hours} 小时`
    }
    return `剩余 ${hours}小时${minutes}分`
  }
  const days = Math.floor(remainingHours / 24)
  const hours = Math.round(remainingHours - days * 24)
  if (hours === 0) {
    return `剩余 ${days} 天`
  }
  return `剩余 ${days}天${hours}小时`
}

export const isArticleOverdue = (article, reviewFlowConfig) => {
  const info = calculateTimeoutInfo(article, reviewFlowConfig)
  return info.status === TIMEOUT_STATUS.OVERDUE
}

export const isArticleWarning = (article, reviewFlowConfig) => {
  const info = calculateTimeoutInfo(article, reviewFlowConfig)
  return info.status === TIMEOUT_STATUS.WARNING
}

export const DEFAULT_VALIDATION_RULES = {
  requireAttachment: false,
  minContentLength: 0,
  requirePublishDate: false,
  forbidDuplicateTitle: false,
}

export const getValidationRules = (reviewFlowConfig) => {
  if (!reviewFlowConfig || !reviewFlowConfig.validationRules) {
    return { ...DEFAULT_VALIDATION_RULES }
  }
  return {
    ...DEFAULT_VALIDATION_RULES,
    ...reviewFlowConfig.validationRules,
  }
}

export const getContentTextLength = (htmlContent) => {
  if (!htmlContent) return 0
  const text = stripHtml(htmlContent)
  return text.trim().length
}

export const getActiveCategories = (categories) => {
  if (!categories || !Array.isArray(categories)) return []
  return categories
    .filter((c) => c.status === 'active')
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

export const getActiveDepartments = (departments) => {
  if (!departments || !Array.isArray(departments)) return []
  return departments
    .filter((d) => d.status === 'active')
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

export const getCategoryName = (categories, categoryCode) => {
  if (!categories || !categoryCode) return ''
  const category = categories.find((c) => c.code === categoryCode)
  return category ? category.name : ''
}

export const getDepartmentName = (departments, departmentId) => {
  if (!departments || !departmentId) return ''
  const dept = departments.find((d) => d.id === departmentId || d.name === departmentId)
  return dept ? dept.name : ''
}

export const validateArticle = (articleData, rules, allArticles = [], currentArticleId = null) => {
  const errors = []
  const warnings = []

  const { title, category, department, content, publishDate, attachmentName, attachmentUrl } = articleData

  if (!title || !title.trim()) {
    errors.push('标题不能为空')
  }

  if (!category) {
    errors.push('请选择公开类别')
  }

  if (!department) {
    errors.push('请选择发布科室')
  }

  if (!content || !stripHtml(content).trim()) {
    errors.push('正文内容不能为空')
  }

  if (rules.requireAttachment) {
    const hasAttachment = (attachmentName && attachmentName.trim()) || (attachmentUrl && attachmentUrl.trim())
    if (!hasAttachment) {
      errors.push('该分类必须上传附件')
    }
  }

  if (rules.minContentLength > 0) {
    const contentLength = getContentTextLength(content)
    if (content && contentLength > 0 && contentLength < rules.minContentLength) {
      errors.push(`正文内容字数不能少于 ${rules.minContentLength} 字（当前 ${contentLength} 字）`)
    }
  }

  if (rules.requirePublishDate && !publishDate) {
    errors.push('该分类发布日期为必填项')
  }

  if (rules.forbidDuplicateTitle && title && title.trim()) {
    const trimmedTitle = title.trim()
    const isDuplicate = allArticles.some((a) => {
      if (currentArticleId && a.id === currentArticleId) return false
      if (a.deleted) return false
      return a.title && a.title.trim() === trimmedTitle
    })
    if (isDuplicate) {
      errors.push('该分类禁止重复标题，当前标题已存在')
    }
  }

  if (!rules.forbidDuplicateTitle && title && title.trim()) {
    const trimmedTitle = title.trim()
    const isDuplicate = allArticles.some((a) => {
      if (currentArticleId && a.id === currentArticleId) return false
      if (a.deleted) return false
      return a.title && a.title.trim() === trimmedTitle
    })
    if (isDuplicate) {
      warnings.push('标题与现有文章重复')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export const formatDurationHours = (hours) => {
  if (!hours || hours <= 0) return '-'
  if (hours < 1) {
    const minutes = Math.ceil(hours * 60)
    return `${minutes}分钟`
  }
  if (hours < 24) {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分`
  }
  const days = Math.floor(hours / 24)
  const h = Math.round(hours - days * 24)
  if (h === 0) return `${days}天`
  return `${days}天${h}小时`
}

export const calculateArticleReviewDurations = (article) => {
  if (!article) return { firstReviewHours: 0, finalReviewHours: 0, totalReviewHours: 0, hasTwoLevel: false }

  const needTwoLevel = article.firstReviewerId && article.finalReviewerId
  let firstReviewHours = 0
  let finalReviewHours = 0
  let totalReviewHours = 0

  const getHoursDiff = (startStr, endStr) => {
    if (!startStr || !endStr) return 0
    const start = new Date(startStr)
    const end = new Date(endStr)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    const diffMs = end.getTime() - start.getTime()
    return Math.max(0, diffMs / (1000 * 60 * 60))
  }

  if (needTwoLevel) {
    const firstStart = article.firstReviewStartTime || article.submittedAt || article.createdAt
    firstReviewHours = getHoursDiff(firstStart, article.firstReviewedAt)

    const finalStart = article.finalReviewStartTime || article.firstReviewedAt
    finalReviewHours = getHoursDiff(finalStart, article.finalReviewedAt)

    totalReviewHours = firstReviewHours + finalReviewHours
  } else {
    const start = article.submittedAt || article.createdAt
    totalReviewHours = getHoursDiff(start, article.reviewedAt)
  }

  return {
    firstReviewHours,
    finalReviewHours,
    totalReviewHours,
    hasTwoLevel: needTwoLevel,
  }
}

export const calculateDepartmentStats = (articles, departments, filters = {}) => {
  const { category = '', department = '', status = '', startDate = '', endDate = '' } = filters

  let filteredArticles = articles.filter((a) => !a.deleted)

  if (category) {
    filteredArticles = filteredArticles.filter((a) => a.category === category)
  }
  if (department) {
    filteredArticles = filteredArticles.filter(
      (a) => a.departmentId === department || a.department === department
    )
  }
  if (status) {
    filteredArticles = filteredArticles.filter((a) => a.status === status)
  }

  const inDateRange = (article) => {
    if (!startDate && !endDate) return true
    const dateStr = article.publishDate || article.updatedAt || article.createdAt
    if (!dateStr) return false
    if (startDate && dateStr < startDate) return false
    if (endDate && dateStr > endDate) return false
    return true
  }

  if (startDate || endDate) {
    filteredArticles = filteredArticles.filter(inDateRange)
  }

  const stats = departments.map((dept) => {
    const deptArticles = filteredArticles.filter(
      (a) => a.departmentId === dept.id || a.department === dept.name
    )

    const publishedCount = deptArticles.filter((a) => a.status === 'published').length
    const pendingCount = deptArticles.filter(
      (a) => a.status === 'pending' || a.status === 'first_reviewed'
    ).length
    const rejectedCount = deptArticles.filter((a) => a.status === 'rejected').length
    const draftCount = deptArticles.filter((a) => a.status === 'draft').length
    const totalCount = deptArticles.length

    const submittedCount = publishedCount + rejectedCount
    const rejectRate = submittedCount > 0 ? rejectedCount / submittedCount : 0

    let totalReviewHours = 0
    let totalFirstReviewHours = 0
    let totalFinalReviewHours = 0
    let reviewedCount = 0
    let twoLevelReviewedCount = 0

    deptArticles.forEach((article) => {
      if (article.status === 'published' || article.status === 'rejected') {
        const durations = calculateArticleReviewDurations(article)
        if (durations.totalReviewHours > 0) {
          totalReviewHours += durations.totalReviewHours
          reviewedCount++
        }
        if (durations.hasTwoLevel) {
          totalFirstReviewHours += durations.firstReviewHours
          totalFinalReviewHours += durations.finalReviewHours
          twoLevelReviewedCount++
        }
      }
    })

    const avgReviewHours = reviewedCount > 0 ? totalReviewHours / reviewedCount : 0
    const avgFirstReviewHours = twoLevelReviewedCount > 0 ? totalFirstReviewHours / twoLevelReviewedCount : 0
    const avgFinalReviewHours = twoLevelReviewedCount > 0 ? totalFinalReviewHours / twoLevelReviewedCount : 0

    const lastUpdated = deptArticles.reduce((latest, article) => {
      if (!latest) return article.updatedAt
      return new Date(article.updatedAt) > new Date(latest) ? article.updatedAt : latest
    }, '')

    return {
      ...dept,
      totalCount,
      publishedCount,
      pendingCount,
      rejectedCount,
      draftCount,
      rejectRate,
      avgReviewHours,
      avgFirstReviewHours,
      avgFinalReviewHours,
      reviewedCount,
      twoLevelReviewedCount,
      lastUpdated,
    }
  })

  return stats
}

export const calculateOverallStats = (departmentStats) => {
  if (!departmentStats || departmentStats.length === 0) {
    return {
      totalCount: 0,
      publishedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      draftCount: 0,
      rejectRate: 0,
      avgReviewHours: 0,
      avgFirstReviewHours: 0,
      avgFinalReviewHours: 0,
      activeDepartmentCount: 0,
    }
  }

  let totalCount = 0
  let publishedCount = 0
  let pendingCount = 0
  let rejectedCount = 0
  let draftCount = 0
  let totalReviewHours = 0
  let totalReviewedCount = 0
  let totalFirstReviewHours = 0
  let totalFinalReviewHours = 0
  let totalTwoLevelReviewedCount = 0
  let activeDepartmentCount = 0

  departmentStats.forEach((dept) => {
    totalCount += dept.totalCount
    publishedCount += dept.publishedCount
    pendingCount += dept.pendingCount
    rejectedCount += dept.rejectedCount
    draftCount += dept.draftCount
    if (dept.status === 'active') activeDepartmentCount++
    if (dept.reviewedCount > 0) {
      totalReviewHours += dept.avgReviewHours * dept.reviewedCount
      totalReviewedCount += dept.reviewedCount
    }
    if (dept.twoLevelReviewedCount > 0) {
      totalFirstReviewHours += dept.avgFirstReviewHours * dept.twoLevelReviewedCount
      totalFinalReviewHours += dept.avgFinalReviewHours * dept.twoLevelReviewedCount
      totalTwoLevelReviewedCount += dept.twoLevelReviewedCount
    }
  })

  const submittedCount = publishedCount + rejectedCount
  const rejectRate = submittedCount > 0 ? rejectedCount / submittedCount : 0
  const avgReviewHours = totalReviewedCount > 0 ? totalReviewHours / totalReviewedCount : 0
  const avgFirstReviewHours = totalTwoLevelReviewedCount > 0 ? totalFirstReviewHours / totalTwoLevelReviewedCount : 0
  const avgFinalReviewHours = totalTwoLevelReviewedCount > 0 ? totalFinalReviewHours / totalTwoLevelReviewedCount : 0

  return {
    totalCount,
    publishedCount,
    pendingCount,
    rejectedCount,
    draftCount,
    rejectRate,
    avgReviewHours,
    avgFirstReviewHours,
    avgFinalReviewHours,
    activeDepartmentCount,
  }
}

export const exportStatsToCsv = (departmentStats, overallStats, filters = {}) => {
  const headers = [
    '科室名称',
    '状态',
    '总数',
    '已发布',
    '待审核',
    '已退回',
    '草稿',
    '退回率',
    '平均审核耗时(小时)',
    '平均初审耗时(小时)',
    '平均终审耗时(小时)',
    '最近更新',
  ]

  const formatRow = (dept) => [
    dept.name,
    dept.status === 'active' ? '正常' : '停用',
    dept.totalCount,
    dept.publishedCount,
    dept.pendingCount,
    dept.rejectedCount,
    dept.draftCount,
    (dept.rejectRate * 100).toFixed(2) + '%',
    dept.avgReviewHours.toFixed(2),
    dept.avgFirstReviewHours.toFixed(2),
    dept.avgFinalReviewHours.toFixed(2),
    dept.lastUpdated || '-',
  ]

  const escapeCsv = (value) => {
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  let csvContent = '\uFEFF'

  csvContent += '科室公开统计报表\n'
  csvContent += `生成时间,${formatDateTime(new Date())}\n`
  if (filters.category) csvContent += `公开类别,${filters.categoryName || filters.category}\n`
  if (filters.department) csvContent += `科室,${filters.departmentName || filters.department}\n`
  if (filters.status) csvContent += `状态,${getStatusText(filters.status)}\n`
  if (filters.startDate || filters.endDate) {
    csvContent += `时间范围,${filters.startDate || '开始'} 至 ${filters.endDate || '结束'}\n`
  }
  csvContent += '\n'

  csvContent += '汇总统计\n'
  csvContent += `活跃科室,${overallStats.activeDepartmentCount}\n`
  csvContent += `总数量,${overallStats.totalCount}\n`
  csvContent += `已发布,${overallStats.publishedCount}\n`
  csvContent += `待审核,${overallStats.pendingCount}\n`
  csvContent += `已退回,${overallStats.rejectedCount}\n`
  csvContent += `草稿,${overallStats.draftCount}\n`
  csvContent += `退回率,${(overallStats.rejectRate * 100).toFixed(2)}%\n`
  csvContent += `平均审核耗时(小时),${overallStats.avgReviewHours.toFixed(2)}\n`
  csvContent += `平均初审耗时(小时),${overallStats.avgFirstReviewHours.toFixed(2)}\n`
  csvContent += `平均终审耗时(小时),${overallStats.avgFinalReviewHours.toFixed(2)}\n`
  csvContent += '\n'

  csvContent += '详细统计\n'
  csvContent += headers.map(escapeCsv).join(',') + '\n'

  departmentStats.forEach((dept) => {
    csvContent += formatRow(dept).map(escapeCsv).join(',') + '\n'
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `科室公开统计_${formatDate(new Date())}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const filterLogsByDateRange = (logs, startDate, endDate) => {
  if (!startDate && !endDate) return logs

  return logs.filter((log) => {
    if (!log.operatedAt) return false
    const logDate = log.operatedAt.split(' ')[0]
    if (startDate && logDate < startDate) return false
    if (endDate && logDate > endDate) return false
    return true
  })
}
