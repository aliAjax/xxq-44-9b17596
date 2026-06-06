import { useReducer, useEffect } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { mockArticles, users, categories, departments, rejectTemplates } from '../data/mockData'
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
}

const actionTypes = {
  INIT_DATA: 'INIT_DATA',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  ADD_ARTICLE: 'ADD_ARTICLE',
  UPDATE_ARTICLE: 'UPDATE_ARTICLE',
  DELETE_ARTICLE: 'DELETE_ARTICLE',
  RESTORE_ARTICLE: 'RESTORE_ARTICLE',
  PERMANENT_DELETE_ARTICLE: 'PERMANENT_DELETE_ARTICLE',
  REVIEW_ARTICLE: 'REVIEW_ARTICLE',
  ADD_REJECT_TEMPLATE: 'ADD_REJECT_TEMPLATE',
  UPDATE_REJECT_TEMPLATE: 'UPDATE_REJECT_TEMPLATE',
  DELETE_REJECT_TEMPLATE: 'DELETE_REJECT_TEMPLATE',
  ADD_OPERATION_LOG: 'ADD_OPERATION_LOG',
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
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED)
    if (!initialized) {
      storage.set(STORAGE_KEYS.ARTICLES, mockArticles)
      storage.set(STORAGE_KEYS.USERS, users)
      storage.set(STORAGE_KEYS.CATEGORIES, categories)
      storage.set(STORAGE_KEYS.DEPARTMENTS, departments)
      storage.set(STORAGE_KEYS.REJECT_TEMPLATES, rejectTemplates)
      storage.set(STORAGE_KEYS.REJECT_TEMPLATES_INITIALIZED, true)
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
    }

    dispatch({
      type: actionTypes.INIT_DATA,
      payload: {
        articles: storage.get(STORAGE_KEYS.ARTICLES) || [],
        users: storage.get(STORAGE_KEYS.USERS) || [],
        categories: storage.get(STORAGE_KEYS.CATEGORIES) || [],
        departments: storage.get(STORAGE_KEYS.DEPARTMENTS) || [],
        rejectTemplates: storage.get(STORAGE_KEYS.REJECT_TEMPLATES) || [],
        operationLogs: storage.get(STORAGE_KEYS.OPERATION_LOGS) || [],
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

  const addArticle = (article) => {
    const category = state.categories.find((c) => c.code === article.category)
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

  const updateArticle = (id, updates) => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const category = state.categories.find((c) => c.code === updates.category)
    const updated = {
      ...article,
      ...updates,
      categoryName: category ? category.name : article.categoryName,
      updatedAt: formatDate(new Date()),
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

  const reviewArticle = (id, status, rejectReason = '') => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const newPublishDate = status === 'published'
      ? (article.publishDate || formatDate(new Date()))
      : article.publishDate
    const reviewData = {
      id,
      status,
      reviewerId: state.currentUser.id,
      reviewerName: state.currentUser.name,
      rejectReason,
      reviewedAt: formatDate(new Date()),
      publishDate: newPublishDate,
    }
    const articles = state.articles.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status,
          reviewerId: reviewData.reviewerId,
          reviewerName: reviewData.reviewerName,
          rejectReason,
          reviewedAt: reviewData.reviewedAt,
          publishDate: newPublishDate,
        }
      }
      return a
    })
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.REVIEW_ARTICLE, payload: reviewData })

    const action = status === 'published'
      ? OPERATION_ACTIONS.REVIEW_PASS
      : OPERATION_ACTIONS.REVIEW_REJECT
    addOperationLog(action, article.title)
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
