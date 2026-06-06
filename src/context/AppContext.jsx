import { createContext, useContext, useReducer, useEffect } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { mockArticles, users, categories, departments } from '../data/mockData'
import { generateId, formatDate } from '../utils/helpers'

const AppContext = createContext()

const initialState = {
  articles: [],
  currentUser: null,
  users: [],
  categories: [],
  departments: [],
}

const actionTypes = {
  INIT_DATA: 'INIT_DATA',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  ADD_ARTICLE: 'ADD_ARTICLE',
  UPDATE_ARTICLE: 'UPDATE_ARTICLE',
  DELETE_ARTICLE: 'DELETE_ARTICLE',
  REVIEW_ARTICLE: 'REVIEW_ARTICLE',
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
                publishDate: action.payload.status === 'published' ? action.payload.publishDate : item.publishDate,
              }
            : item
        ),
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
      storage.set(STORAGE_KEYS.INITIALIZED, true)
    }

    dispatch({
      type: actionTypes.INIT_DATA,
      payload: {
        articles: storage.get(STORAGE_KEYS.ARTICLES) || [],
        users: storage.get(STORAGE_KEYS.USERS) || [],
        categories: storage.get(STORAGE_KEYS.CATEGORIES) || [],
        departments: storage.get(STORAGE_KEYS.DEPARTMENTS) || [],
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
    return updated
  }

  const deleteArticle = (id) => {
    const articles = state.articles.filter((a) => a.id !== id)
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.DELETE_ARTICLE, payload: id })
  }

  const reviewArticle = (id, status, rejectReason = '') => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const reviewData = {
      id,
      status,
      reviewerId: state.currentUser.id,
      reviewerName: state.currentUser.name,
      rejectReason,
      reviewedAt: formatDate(new Date()),
      publishDate: status === 'published' ? formatDate(new Date()) : '',
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
          publishDate: status === 'published' ? formatDate(new Date()) : a.publishDate,
        }
      }
      return a
    })
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.REVIEW_ARTICLE, payload: reviewData })
  }

  const getArticleById = (id) => {
    return state.articles.find((a) => a.id === id)
  }

  const getPublishedArticles = (filters = {}) => {
    let result = state.articles.filter((a) => a.status === 'published')

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

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        logout,
        addArticle,
        updateArticle,
        deleteArticle,
        reviewArticle,
        getArticleById,
        getPublishedArticles,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
