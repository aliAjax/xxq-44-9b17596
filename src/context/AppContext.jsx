import { useReducer, useEffect } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { mockArticles, users, categories, departments, rejectTemplates, reviewFlowConfigs } from '../data/mockData'
import { generateId, formatDate, formatDateTime, OPERATION_ACTIONS } from '../utils/helpers'
import { AppContext } from './useApp'

const initialState = {
  articles: [],
  currentUser: null,
  users: [],
  categories: [],
  departments: [],
  rejectTemplates: [],
  operationLogs: [],
  reviewFlowConfigs: [],
}

const actionTypes = {
  INIT_DATA: 'INIT_DATA',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  ADD_ARTICLE: 'ADD_ARTICLE',
  BATCH_ADD_ARTICLES: 'BATCH_ADD_ARTICLES',
  UPDATE_ARTICLE: 'UPDATE_ARTICLE',
  DELETE_ARTICLE: 'DELETE_ARTICLE',
  RESTORE_ARTICLE: 'RESTORE_ARTICLE',
  PERMANENT_DELETE_ARTICLE: 'PERMANENT_DELETE_ARTICLE',
  REVIEW_ARTICLE: 'REVIEW_ARTICLE',
  ADD_REJECT_TEMPLATE: 'ADD_REJECT_TEMPLATE',
  UPDATE_REJECT_TEMPLATE: 'UPDATE_REJECT_TEMPLATE',
  DELETE_REJECT_TEMPLATE: 'DELETE_REJECT_TEMPLATE',
  ADD_OPERATION_LOG: 'ADD_OPERATION_LOG',
  UPDATE_REVIEW_FLOW_CONFIG: 'UPDATE_REVIEW_FLOW_CONFIG',
  INIT_REVIEW_FLOW_CONFIGS: 'INIT_REVIEW_FLOW_CONFIGS',
}

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.INIT_DATA:
      return {
        ...state,
        articles: action.payload.articles,
        users: action.payload.users,
        categories: action.payload.categories,
        departments: action.payload.departments,
        rejectTemplates: action.payload.rejectTemplates,
        operationLogs: action.payload.operationLogs,
        reviewFlowConfigs: action.payload.reviewFlowConfigs,
        currentUser: action.payload.currentUser,
      }
    case actionTypes.SET_USER:
      return {
        ...state,
        currentUser: action.payload,
      }
    case actionTypes.LOGOUT:
      return {
        ...state,
        currentUser: null,
      }
    case actionTypes.ADD_ARTICLE:
      return {
        ...state,
        articles: [action.payload, ...state.articles],
      }
    case actionTypes.BATCH_ADD_ARTICLES:
      return {
        ...state,
        articles: [...action.payload, ...state.articles],
      }
    case actionTypes.UPDATE_ARTICLE:
      return {
        ...state,
        articles: state.articles.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      }
    case actionTypes.DELETE_ARTICLE:
      return {
        ...state,
        articles: state.articles.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      }
    case actionTypes.RESTORE_ARTICLE:
      return {
        ...state,
        articles: state.articles.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      }
    case actionTypes.PERMANENT_DELETE_ARTICLE:
      return {
        ...state,
        articles: state.articles.filter((item) => item.id !== action.payload),
      }
    case actionTypes.REVIEW_ARTICLE:
      return {
        ...state,
        articles: state.articles.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                status: action.payload.status,
                reviewerId: action.payload.reviewerId,
                reviewerName: action.payload.reviewerName,
                rejectReason: action.payload.rejectReason || '',
                reviewedAt: action.payload.reviewedAt,
                publishDate: action.payload.publishDate || item.publishDate,
                firstReviewerId: action.payload.firstReviewerId || item.firstReviewerId,
                firstReviewerName: action.payload.firstReviewerName || item.firstReviewerName,
                firstReviewedAt: action.payload.firstReviewedAt || item.firstReviewedAt,
                finalReviewerId: action.payload.finalReviewerId || item.finalReviewerId,
                finalReviewerName: action.payload.finalReviewerName || item.finalReviewerName,
                finalReviewedAt: action.payload.finalReviewedAt || item.finalReviewedAt,
                reviewStage: action.payload.reviewStage || item.reviewStage,
                reviewHistory: action.payload.reviewHistory || item.reviewHistory,
              }
            : item
        ),
      }
    case actionTypes.ADD_REJECT_TEMPLATE:
      return {
        ...state,
        rejectTemplates: [...state.rejectTemplates, action.payload].sort((a, b) => a.sort - b.sort),
      }
    case actionTypes.UPDATE_REJECT_TEMPLATE:
      return {
        ...state,
        rejectTemplates: state.rejectTemplates
          .map((t) => (t.id === action.payload.id ? action.payload : t))
          .sort((a, b) => a.sort - b.sort),
      }
    case actionTypes.DELETE_REJECT_TEMPLATE:
      return {
        ...state,
        rejectTemplates: state.rejectTemplates.filter((t) => t.id !== action.payload),
      }
    case actionTypes.ADD_OPERATION_LOG:
      return {
        ...state,
        operationLogs: [action.payload, ...state.operationLogs],
      }
    case actionTypes.INIT_REVIEW_FLOW_CONFIGS:
      return {
        ...state,
        reviewFlowConfigs: action.payload,
      }
    case actionTypes.UPDATE_REVIEW_FLOW_CONFIG:
      return {
        ...state,
        reviewFlowConfigs: state.reviewFlowConfigs.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const migrateReviewFlowConfigs = (configs, categoryList) => {
    if (!categoryList || categoryList.length === 0) return configs || []
    const existingConfigs = configs || []
    const existingCodes = new Set(existingConfigs.map((c) => c.categoryCode))
    const newConfigs = [...existingConfigs]
    let maxId = existingConfigs.length > 0
      ? Math.max(...existingConfigs.map((c) => parseInt(c.id) || 0))
      : 0

    categoryList.forEach((cat) => {
      if (!existingCodes.has(cat.code)) {
        maxId += 1
        newConfigs.push({
          id: String(maxId),
          categoryCode: cat.code,
          categoryName: cat.name,
          requireTwoLevel: false,
        })
      }
    })

    return newConfigs
  }

  const migrateArticles = (articles, flowConfigs) => {
    if (!articles || articles.length === 0) return []
    const configMap = new Map((flowConfigs || []).map((c) => [c.categoryCode, c]))

    return articles.map((article) => {
      const migrated = { ...article }
      if (migrated.firstReviewerId === undefined) migrated.firstReviewerId = ''
      if (migrated.firstReviewerName === undefined) migrated.firstReviewerName = ''
      if (migrated.firstReviewedAt === undefined) migrated.firstReviewedAt = ''
      if (migrated.finalReviewerId === undefined) migrated.finalReviewerId = ''
      if (migrated.finalReviewerName === undefined) migrated.finalReviewerName = ''
      if (migrated.finalReviewedAt === undefined) migrated.finalReviewedAt = ''
      if (migrated.reviewStage === undefined) migrated.reviewStage = ''
      if (migrated.reviewHistory === undefined) migrated.reviewHistory = []

      const config = configMap.get(article.category)
      const needTwoLevel = config ? config.requireTwoLevel : false

      if (!migrated.reviewStage) {
        if (article.status === 'pending' && needTwoLevel) {
          migrated.reviewStage = 'first_pending'
        } else if (article.status === 'first_reviewed') {
          migrated.reviewStage = 'first_passed'
        } else if (article.status === 'published') {
          if (needTwoLevel && migrated.finalReviewerId) {
            migrated.reviewStage = 'final_passed'
          } else if (migrated.reviewerId) {
            migrated.reviewStage = 'single_passed'
          }
        } else if (article.status === 'rejected') {
          if (needTwoLevel && migrated.finalReviewerId) {
            migrated.reviewStage = 'final_rejected'
          } else if (migrated.reviewerId) {
            migrated.reviewStage = 'first_rejected'
          }
        }
      }

      return migrated
    })
  }

  useEffect(() => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED)
    if (!initialized) {
      storage.set(STORAGE_KEYS.ARTICLES, mockArticles)
      storage.set(STORAGE_KEYS.USERS, users)
      storage.set(STORAGE_KEYS.CATEGORIES, categories)
      storage.set(STORAGE_KEYS.DEPARTMENTS, departments)
      storage.set(STORAGE_KEYS.REJECT_TEMPLATES, rejectTemplates)
      storage.set(STORAGE_KEYS.REJECT_TEMPLATES_INITIALIZED, true)
      storage.set(STORAGE_KEYS.REVIEW_FLOW_CONFIGS, reviewFlowConfigs)
      storage.set(STORAGE_KEYS.REVIEW_FLOW_INITIALIZED, true)
      storage.set(STORAGE_KEYS.INITIALIZED, true)
    } else {
      const templatesInitialized = storage.get(STORAGE_KEYS.REJECT_TEMPLATES_INITIALIZED)
      if (!templatesInitialized) {
        const existingTemplates = storage.get(STORAGE_KEYS.REJECT_TEMPLATES)
        if (!existingTemplates) {
          storage.set(STORAGE_KEYS.REJECT_TEMPLATES, rejectTemplates)
        }
        storage.set(STORAGE_KEYS.REJECT_TEMPLATES_INITIALIZED, true)
      }

      const reviewFlowInitialized = storage.get(STORAGE_KEYS.REVIEW_FLOW_INITIALIZED)
      const loadedCategories = storage.get(STORAGE_KEYS.CATEGORIES) || categories
      const existingFlowConfigs = storage.get(STORAGE_KEYS.REVIEW_FLOW_CONFIGS) || []
      const migratedFlowConfigs = migrateReviewFlowConfigs(existingFlowConfigs, loadedCategories)
      if (!reviewFlowInitialized || migratedFlowConfigs.length !== existingFlowConfigs.length) {
        storage.set(STORAGE_KEYS.REVIEW_FLOW_CONFIGS, migratedFlowConfigs)
        storage.set(STORAGE_KEYS.REVIEW_FLOW_INITIALIZED, true)
      }

      const existingArticles = storage.get(STORAGE_KEYS.ARTICLES) || []
      const migratedArticles = migrateArticles(existingArticles, migratedFlowConfigs)
      storage.set(STORAGE_KEYS.ARTICLES, migratedArticles)
    }

    const loadedCategories = storage.get(STORAGE_KEYS.CATEGORIES) || categories
    const loadedFlowConfigs = storage.get(STORAGE_KEYS.REVIEW_FLOW_CONFIGS) || []
    const finalFlowConfigs = migrateReviewFlowConfigs(loadedFlowConfigs, loadedCategories)
    const loadedArticles = storage.get(STORAGE_KEYS.ARTICLES) || []
    const finalArticles = migrateArticles(loadedArticles, finalFlowConfigs)

    dispatch({
      type: actionTypes.INIT_DATA,
      payload: {
        articles: finalArticles,
        users: storage.get(STORAGE_KEYS.USERS) || [],
        categories: loadedCategories,
        departments: storage.get(STORAGE_KEYS.DEPARTMENTS) || [],
        rejectTemplates: storage.get(STORAGE_KEYS.REJECT_TEMPLATES) || [],
        operationLogs: storage.get(STORAGE_KEYS.OPERATION_LOGS) || [],
        reviewFlowConfigs: finalFlowConfigs,
        currentUser: storage.get(STORAGE_KEYS.CURRENT_USER),
      },
    })
  }, [])

  const login = (username, password, role) => {
    const user = state.users.find(
      (u) => u.username === username && u.password === password && u.role === role
    )
    if (user) {
      const userInfo = { id: user.id, username: user.username, role: user.role, name: user.name }
      storage.set(STORAGE_KEYS.CURRENT_USER, userInfo)
      dispatch({ type: actionTypes.SET_USER, payload: userInfo })
      return { success: true, user: userInfo }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = () => {
    storage.remove(STORAGE_KEYS.CURRENT_USER)
    dispatch({ type: actionTypes.LOGOUT })
  }

  const addOperationLog = (action, articleTitle) => {
    if (!state.currentUser) return
    const log = {
      id: generateId(),
      action,
      articleTitle,
      operatorId: state.currentUser.id,
      operatorName: state.currentUser.name,
      operatorRole: state.currentUser.role,
      operatedAt: formatDateTime(new Date()),
    }
    const logs = [log, ...state.operationLogs]
    storage.set(STORAGE_KEYS.OPERATION_LOGS, logs)
    dispatch({ type: actionTypes.ADD_OPERATION_LOG, payload: log })
  }

  const isTwoLevelReview = (categoryCode) => {
    const config = state.reviewFlowConfigs.find((c) => c.categoryCode === categoryCode)
    return config ? config.requireTwoLevel : false
  }

  const addArticle = (article) => {
    const category = state.categories.find((c) => c.code === article.category)
    const needTwoLevel = isTwoLevelReview(article.category)
    const reviewStage = article.status === 'pending' && needTwoLevel ? 'first_pending' : ''
    const newArticle = {
      ...article,
      id: generateId(),
      categoryName: category ? category.name : '',
      authorId: state.currentUser.id,
      authorName: state.currentUser.name,
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
      reviewedAt: '',
      reviewerId: '',
      reviewerName: '',
      rejectReason: '',
      firstReviewerId: '',
      firstReviewerName: '',
      firstReviewedAt: '',
      finalReviewerId: '',
      finalReviewerName: '',
      finalReviewedAt: '',
      reviewStage,
      reviewHistory: [],
    }
    const articles = [newArticle, ...state.articles]
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.ADD_ARTICLE, payload: newArticle })

    const action = article.status === 'pending'
      ? OPERATION_ACTIONS.SUBMIT_REVIEW
      : OPERATION_ACTIONS.SAVE_DRAFT
    addOperationLog(action, newArticle.title)

    return newArticle
  }

  const batchAddArticles = (articles) => {
    const now = formatDate(new Date())
    const newArticles = articles.map((article) => {
      const category = state.categories.find((c) => c.code === article.category)
      const needTwoLevel = isTwoLevelReview(article.category)
      const reviewStage = article.status === 'pending' && needTwoLevel ? 'first_pending' : ''
      return {
        ...article,
        id: generateId(),
        categoryName: category ? category.name : '',
        authorId: state.currentUser.id,
        authorName: state.currentUser.name,
        createdAt: now,
        updatedAt: now,
        reviewedAt: '',
        reviewerId: '',
        reviewerName: '',
        rejectReason: '',
        firstReviewerId: '',
        firstReviewerName: '',
        firstReviewedAt: '',
        finalReviewerId: '',
        finalReviewerName: '',
        finalReviewedAt: '',
        reviewStage,
        reviewHistory: [],
        deleted: false,
      }
    })
    const allArticles = [...newArticles, ...state.articles]
    storage.set(STORAGE_KEYS.ARTICLES, allArticles)
    dispatch({ type: actionTypes.BATCH_ADD_ARTICLES, payload: newArticles })

    addOperationLog(OPERATION_ACTIONS.BATCH_IMPORT, `共${newArticles.length}条`)

    return newArticles
  }

  const updateArticle = (id, updates) => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const category = state.categories.find((c) => c.code === (updates.category || article.category))
    const needTwoLevel = isTwoLevelReview(updates.category || article.category)
    let reviewStage = article.reviewStage
    if (updates.status === 'pending') {
      reviewStage = needTwoLevel ? 'first_pending' : ''
    } else if (updates.status === 'draft') {
      reviewStage = ''
    }
    const updated = {
      ...article,
      ...updates,
      categoryName: category ? category.name : article.categoryName,
      updatedAt: formatDate(new Date()),
      reviewStage,
    }
    const articles = state.articles.map((a) => (a.id === id ? updated : a))
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.UPDATE_ARTICLE, payload: updated })

    if (updates.status === 'pending') {
      addOperationLog(OPERATION_ACTIONS.SUBMIT_REVIEW, updated.title)
    } else if (updates.status === 'draft') {
      addOperationLog(OPERATION_ACTIONS.SAVE_DRAFT, updated.title)
    }

    return updated
  }

  const deleteArticle = (id) => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const updated = {
      ...article,
      deleted: true,
      deletedAt: formatDateTime(new Date()),
      deletedBy: state.currentUser?.name || '',
    }
    const articles = state.articles.map((a) => (a.id === id ? updated : a))
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.DELETE_ARTICLE, payload: updated })
    addOperationLog(OPERATION_ACTIONS.DELETE, article.title)
  }

  const restoreArticle = (id) => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const restored = {
      ...article,
      deleted: false,
      deletedAt: '',
      deletedBy: '',
    }
    const articles = state.articles.map((a) => (a.id === id ? restored : a))
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.RESTORE_ARTICLE, payload: restored })
    addOperationLog(OPERATION_ACTIONS.RESTORE, article.title)
  }

  const permanentDeleteArticle = (id) => {
    const articles = state.articles.filter((a) => a.id !== id)
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.PERMANENT_DELETE_ARTICLE, payload: id })
  }

  const addReviewHistoryItem = (articleId, historyItem) => {
    const articles = state.articles.map((a) => {
      if (a.id === articleId) {
        return {
          ...a,
          reviewHistory: [...(a.reviewHistory || []), historyItem],
        }
      }
      return a
    })
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    return articles
  }

  const reviewArticle = (id, status, rejectReason = '') => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const currentUser = state.currentUser
    if (!currentUser) return null

    const needTwoLevel = isTwoLevelReview(article.category)
    const now = formatDate(new Date())
    const newPublishDate = status === 'published'
      ? (article.publishDate || now)
      : article.publishDate

    let firstReviewerId = article.firstReviewerId
    let firstReviewerName = article.firstReviewerName
    let firstReviewedAt = article.firstReviewedAt
    let finalReviewerId = article.finalReviewerId
    let finalReviewerName = article.finalReviewerName
    let finalReviewedAt = article.finalReviewedAt
    let reviewStage = article.reviewStage
    let reviewAction = ''
    let historyStage = ''
    let historyAction = ''

    if (!needTwoLevel) {
      firstReviewerId = currentUser.id
      firstReviewerName = currentUser.name
      firstReviewedAt = now
      reviewStage = status === 'published' ? 'single_passed' : 'single_rejected'
      reviewAction = status === 'published'
        ? OPERATION_ACTIONS.REVIEW_PASS
        : OPERATION_ACTIONS.REVIEW_REJECT
      historyStage = 'single'
      historyAction = status === 'published' ? 'pass' : 'reject'
    } else {
      if (currentUser.role === 'reviewer') {
        firstReviewerId = currentUser.id
        firstReviewerName = currentUser.name
        firstReviewedAt = now
        if (status === 'first_reviewed') {
          reviewStage = 'first_passed'
          reviewAction = OPERATION_ACTIONS.FIRST_REVIEW_PASS
          historyStage = 'first'
          historyAction = 'pass'
        } else if (status === 'rejected') {
          reviewStage = 'first_rejected'
          reviewAction = OPERATION_ACTIONS.FIRST_REVIEW_REJECT
          historyStage = 'first'
          historyAction = 'reject'
        }
      } else if (currentUser.role === 'senior_reviewer') {
        finalReviewerId = currentUser.id
        finalReviewerName = currentUser.name
        finalReviewedAt = now
        if (status === 'published') {
          reviewStage = 'final_passed'
          reviewAction = OPERATION_ACTIONS.FINAL_REVIEW_PASS
          historyStage = 'final'
          historyAction = 'pass'
        } else if (status === 'rejected') {
          reviewStage = 'final_rejected'
          reviewAction = OPERATION_ACTIONS.FINAL_REVIEW_REJECT
          historyStage = 'final'
          historyAction = 'reject'
        }
      }
    }

    const historyItem = {
      id: generateId(),
      stage: historyStage,
      action: historyAction,
      status,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerRole: currentUser.role,
      reviewTime: now,
      comment: rejectReason || '',
    }

    const updatedHistory = [...(article.reviewHistory || []), historyItem]

    const reviewData = {
      id,
      status,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      rejectReason,
      reviewedAt: now,
      publishDate: newPublishDate,
      firstReviewerId,
      firstReviewerName,
      firstReviewedAt,
      finalReviewerId,
      finalReviewerName,
      finalReviewedAt,
      reviewStage,
      reviewHistory: updatedHistory,
    }

    const articles = state.articles.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          rejectReason,
          reviewedAt: now,
          publishDate: newPublishDate,
          firstReviewerId,
          firstReviewerName,
          firstReviewedAt,
          finalReviewerId,
          finalReviewerName,
          finalReviewedAt,
          reviewStage,
          reviewHistory: updatedHistory,
        }
      }
      return a
    })
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.REVIEW_ARTICLE, payload: reviewData })

    addOperationLog(reviewAction, article.title)
  }

  const updateReviewFlowConfig = (id, updates) => {
    const config = state.reviewFlowConfigs.find((c) => c.id === id)
    if (!config) return null
    const updated = { ...config, ...updates }
    const configs = state.reviewFlowConfigs.map((c) => (c.id === id ? updated : c))
    storage.set(STORAGE_KEYS.REVIEW_FLOW_CONFIGS, configs)
    dispatch({ type: actionTypes.UPDATE_REVIEW_FLOW_CONFIG, payload: updated })
    return updated
  }

  const getReviewFlowConfig = (categoryCode) => {
    return state.reviewFlowConfigs.find((c) => c.categoryCode === categoryCode) || null
  }

  const getArticleById = (id) => {
    return state.articles.find((a) => a.id === id)
  }

  const getPublishedArticles = (filters = {}) => {
    let result = state.articles.filter((a) => a.status === 'published' && !a.deleted)

    if (filters.category) {
      result = result.filter((a) => a.category === filters.category)
    }
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) ||
          a.content.toLowerCase().includes(keyword)
      )
    }
    if (filters.startDate) {
      result = result.filter((a) => a.publishDate >= filters.startDate)
    }
    if (filters.endDate) {
      result = result.filter((a) => a.publishDate <= filters.endDate)
    }

    result.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    return result
  }

  const getDeletedArticles = () => {
    return state.articles
      .filter((a) => a.deleted)
      .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))
  }

  const addRejectTemplate = (template) => {
    const maxSort = state.rejectTemplates.length > 0
      ? Math.max(...state.rejectTemplates.map((t) => t.sort))
      : 0
    const newTemplate = {
      ...template,
      id: generateId(),
      sort: maxSort + 1,
    }
    const templates = [...state.rejectTemplates, newTemplate].sort((a, b) => a.sort - b.sort)
    storage.set(STORAGE_KEYS.REJECT_TEMPLATES, templates)
    dispatch({ type: actionTypes.ADD_REJECT_TEMPLATE, payload: newTemplate })
    return newTemplate
  }

  const updateRejectTemplate = (id, updates) => {
    const template = state.rejectTemplates.find((t) => t.id === id)
    if (!template) return null
    const updated = { ...template, ...updates }
    const templates = state.rejectTemplates
      .map((t) => (t.id === id ? updated : t))
      .sort((a, b) => a.sort - b.sort)
    storage.set(STORAGE_KEYS.REJECT_TEMPLATES, templates)
    dispatch({ type: actionTypes.UPDATE_REJECT_TEMPLATE, payload: updated })
    return updated
  }

  const deleteRejectTemplate = (id) => {
    const templates = state.rejectTemplates.filter((t) => t.id !== id)
    storage.set(STORAGE_KEYS.REJECT_TEMPLATES, templates)
    dispatch({ type: actionTypes.DELETE_REJECT_TEMPLATE, payload: id })
  }

  const getOperationLogs = (filters = {}) => {
    let result = [...state.operationLogs]

    if (filters.action) {
      result = result.filter((log) => log.action === filters.action)
    }
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      result = result.filter(
        (log) =>
          log.articleTitle.toLowerCase().includes(keyword) ||
          log.operatorName.toLowerCase().includes(keyword)
      )
    }

    return result
  }

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        logout,
        addArticle,
        batchAddArticles,
        updateArticle,
        deleteArticle,
        restoreArticle,
        permanentDeleteArticle,
        reviewArticle,
        getArticleById,
        getPublishedArticles,
        getDeletedArticles,
        addRejectTemplate,
        updateRejectTemplate,
        deleteRejectTemplate,
        getOperationLogs,
        isTwoLevelReview,
        updateReviewFlowConfig,
        getReviewFlowConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
