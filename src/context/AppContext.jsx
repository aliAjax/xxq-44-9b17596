import { useReducer, useEffect } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { mockArticles, users, categories, departments, rejectTemplates, reviewFlowConfigs } from '../data/mockData'
import {
  generateId,
  formatDate,
  formatDateTime,
  OPERATION_ACTIONS,
  VERSION_TYPES,
  getVersionTypeText,
} from '../utils/helpers'
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
  articleVersions: [],
  importDrafts: [],
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
  CLAIM_ARTICLE: 'CLAIM_ARTICLE',
  RELEASE_ARTICLE: 'RELEASE_ARTICLE',
  ADD_REJECT_TEMPLATE: 'ADD_REJECT_TEMPLATE',
  UPDATE_REJECT_TEMPLATE: 'UPDATE_REJECT_TEMPLATE',
  DELETE_REJECT_TEMPLATE: 'DELETE_REJECT_TEMPLATE',
  ADD_OPERATION_LOG: 'ADD_OPERATION_LOG',
  UPDATE_REVIEW_FLOW_CONFIG: 'UPDATE_REVIEW_FLOW_CONFIG',
  INIT_REVIEW_FLOW_CONFIGS: 'INIT_REVIEW_FLOW_CONFIGS',
  ADD_ARTICLE_VERSION: 'ADD_ARTICLE_VERSION',
  INIT_ARTICLE_VERSIONS: 'INIT_ARTICLE_VERSIONS',
  SAVE_IMPORT_DRAFT: 'SAVE_IMPORT_DRAFT',
  UPDATE_IMPORT_DRAFT: 'UPDATE_IMPORT_DRAFT',
  DELETE_IMPORT_DRAFT: 'DELETE_IMPORT_DRAFT',
  INIT_IMPORT_DRAFTS: 'INIT_IMPORT_DRAFTS',
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
        articleVersions: action.payload.articleVersions,
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
                claimantId: '',
                claimantName: '',
                claimedAt: '',
              }
            : item
        ),
      }
    case actionTypes.CLAIM_ARTICLE:
      return {
        ...state,
        articles: state.articles.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                claimantId: action.payload.claimantId,
                claimantName: action.payload.claimantName,
                claimedAt: action.payload.claimedAt,
              }
            : item
        ),
      }
    case actionTypes.RELEASE_ARTICLE:
      return {
        ...state,
        articles: state.articles.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                claimantId: '',
                claimantName: '',
                claimedAt: '',
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
    case actionTypes.ADD_ARTICLE_VERSION:
      return {
        ...state,
        articleVersions: [action.payload, ...state.articleVersions],
      }
    case actionTypes.INIT_ARTICLE_VERSIONS:
      return {
        ...state,
        articleVersions: action.payload,
      }
    case actionTypes.INIT_IMPORT_DRAFTS:
      return {
        ...state,
        importDrafts: action.payload,
      }
    case actionTypes.SAVE_IMPORT_DRAFT:
      return {
        ...state,
        importDrafts: [action.payload, ...state.importDrafts],
      }
    case actionTypes.UPDATE_IMPORT_DRAFT:
      return {
        ...state,
        importDrafts: state.importDrafts.map((d) =>
          d.id === action.payload.id ? action.payload : d
        ),
      }
    case actionTypes.DELETE_IMPORT_DRAFT:
      return {
        ...state,
        importDrafts: state.importDrafts.filter((d) => d.id !== action.payload),
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const migrateUsers = (existingUsers) => {
    const migratedUsers = [...(existingUsers || [])]
    const usedIds = new Set(migratedUsers.map((user) => user.id))
    let maxId = migratedUsers.length > 0
      ? Math.max(...migratedUsers.map((user) => parseInt(user.id) || 0))
      : 0

    users.forEach((defaultUser) => {
      const exists = migratedUsers.some(
        (user) => user.username === defaultUser.username && user.role === defaultUser.role
      )
      if (!exists) {
        let nextId = defaultUser.id
        if (usedIds.has(nextId)) {
          maxId += 1
          nextId = String(maxId)
        }
        usedIds.add(nextId)
        migratedUsers.push({ ...defaultUser, id: nextId })
      }
    })

    return migratedUsers
  }

  const migrateReviewFlowConfigs = (configs, categoryList) => {
    if (!categoryList || categoryList.length === 0) return configs || []
    const existingConfigs = configs || []
    const existingCodes = new Set(existingConfigs.map((c) => c.categoryCode))
    const newConfigs = [...existingConfigs]
    const defaultConfigMap = new Map(
      reviewFlowConfigs.map((config) => [config.categoryCode, config])
    )
    let maxId = existingConfigs.length > 0
      ? Math.max(...existingConfigs.map((c) => parseInt(c.id) || 0))
      : 0

    categoryList.forEach((cat) => {
      if (!existingCodes.has(cat.code)) {
        const defaultConfig = defaultConfigMap.get(cat.code)
        maxId += 1
        newConfigs.push({
          id: String(maxId),
          categoryCode: cat.code,
          categoryName: cat.name,
          requireTwoLevel: defaultConfig?.requireTwoLevel || false,
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
      if (migrated.claimantId === undefined) migrated.claimantId = ''
      if (migrated.claimantName === undefined) migrated.claimantName = ''
      if (migrated.claimedAt === undefined) migrated.claimedAt = ''

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

  const migrateArticleVersions = (versions, articles) => {
    if (!articles || articles.length === 0) return versions || []

    const existingVersions = versions || []
    const articleIdsWithVersions = new Set(existingVersions.map((v) => v.articleId))
    const newVersions = [...existingVersions]

    articles.forEach((article) => {
      if (!articleIdsWithVersions.has(article.id) && !article.deleted) {
        const initialVersion = {
          id: 'v_' + generateId(),
          articleId: article.id,
          version: 1,
          versionType: VERSION_TYPES.INITIAL,
          description: '初始版本',
          title: article.title,
          category: article.category,
          categoryName: article.categoryName,
          department: article.department,
          publishDate: article.publishDate,
          content: article.content,
          attachmentUrl: article.attachmentUrl,
          attachmentName: article.attachmentName,
          status: article.status,
          reviewStage: article.reviewStage || '',
          operatorId: article.authorId || '',
          operatorName: article.authorName || '系统',
          operatorRole: article.authorId ? 'editor' : 'system',
          operatedAt: article.updatedAt || article.createdAt || formatDate(new Date()),
        }
        newVersions.push(initialVersion)
      }
    })

    return newVersions
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

      const initialVersions = migrateArticleVersions([], mockArticles)
      storage.set(STORAGE_KEYS.ARTICLE_VERSIONS, initialVersions)
      storage.set(STORAGE_KEYS.VERSIONS_INITIALIZED, true)

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

      const existingUsers = storage.get(STORAGE_KEYS.USERS) || []
      const migratedUsers = migrateUsers(existingUsers)
      if (migratedUsers.length !== existingUsers.length) {
        storage.set(STORAGE_KEYS.USERS, migratedUsers)
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

      const versionsInitialized = storage.get(STORAGE_KEYS.VERSIONS_INITIALIZED)
      const existingVersions = storage.get(STORAGE_KEYS.ARTICLE_VERSIONS) || []
      const migratedVersions = migrateArticleVersions(existingVersions, migratedArticles)
      if (!versionsInitialized || migratedVersions.length !== existingVersions.length) {
        storage.set(STORAGE_KEYS.ARTICLE_VERSIONS, migratedVersions)
        storage.set(STORAGE_KEYS.VERSIONS_INITIALIZED, true)
      }
    }

    const loadedCategories = storage.get(STORAGE_KEYS.CATEGORIES) || categories
    const loadedFlowConfigs = storage.get(STORAGE_KEYS.REVIEW_FLOW_CONFIGS) || []
    const finalFlowConfigs = migrateReviewFlowConfigs(loadedFlowConfigs, loadedCategories)
    const loadedUsers = storage.get(STORAGE_KEYS.USERS) || []
    const finalUsers = migrateUsers(loadedUsers)
    const loadedArticles = storage.get(STORAGE_KEYS.ARTICLES) || []
    const finalArticles = migrateArticles(loadedArticles, finalFlowConfigs)
    const loadedVersions = storage.get(STORAGE_KEYS.ARTICLE_VERSIONS) || []
    const finalVersions = migrateArticleVersions(loadedVersions, finalArticles)

    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER)
    const allImportDrafts = storage.get(STORAGE_KEYS.IMPORT_DRAFTS) || []
    const userImportDrafts = currentUser
      ? allImportDrafts.filter((d) => d.createdBy === currentUser.id)
      : []

    dispatch({
      type: actionTypes.INIT_DATA,
      payload: {
        articles: finalArticles,
        users: finalUsers,
        categories: loadedCategories,
        departments: storage.get(STORAGE_KEYS.DEPARTMENTS) || [],
        rejectTemplates: storage.get(STORAGE_KEYS.REJECT_TEMPLATES) || [],
        operationLogs: storage.get(STORAGE_KEYS.OPERATION_LOGS) || [],
        reviewFlowConfigs: finalFlowConfigs,
        currentUser,
        articleVersions: finalVersions,
        importDrafts: userImportDrafts,
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

      const allImportDrafts = storage.get(STORAGE_KEYS.IMPORT_DRAFTS) || []
      const userDrafts = allImportDrafts.filter((d) => d.createdBy === user.id)
      dispatch({ type: actionTypes.INIT_IMPORT_DRAFTS, payload: userDrafts })

      return { success: true, user: userInfo }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = () => {
    storage.remove(STORAGE_KEYS.CURRENT_USER)
    dispatch({ type: actionTypes.LOGOUT })
    dispatch({ type: actionTypes.INIT_IMPORT_DRAFTS, payload: [] })
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

  const getNextVersionNumber = (articleId) => {
    const articleVersions = state.articleVersions.filter((v) => v.articleId === articleId)
    if (articleVersions.length === 0) return 1
    const maxVersion = Math.max(...articleVersions.map((v) => v.version))
    return maxVersion + 1
  }

  const addArticleVersion = (article, versionType, description = '') => {
    if (!article || !article.id) return null

    const version = getNextVersionNumber(article.id)
    const currentUser = state.currentUser

    const newVersion = {
      id: 'v_' + generateId(),
      articleId: article.id,
      version,
      versionType,
      description: description || getVersionTypeText(versionType),
      title: article.title,
      category: article.category,
      categoryName: article.categoryName,
      department: article.department,
      publishDate: article.publishDate,
      content: article.content,
      attachmentUrl: article.attachmentUrl,
      attachmentName: article.attachmentName,
      status: article.status,
      reviewStage: article.reviewStage || '',
      operatorId: currentUser?.id || article.authorId || '',
      operatorName: currentUser?.name || article.authorName || '系统',
      operatorRole: currentUser?.role || (article.authorId ? 'editor' : 'system'),
      operatedAt: formatDateTime(new Date()),
    }

    const allVersions = [newVersion, ...state.articleVersions]
    storage.set(STORAGE_KEYS.ARTICLE_VERSIONS, allVersions)
    dispatch({ type: actionTypes.ADD_ARTICLE_VERSION, payload: newVersion })

    return newVersion
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
      claimantId: '',
      claimantName: '',
      claimedAt: '',
    }
    const articles = [newArticle, ...state.articles]
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.ADD_ARTICLE, payload: newArticle })

    const versionType = article.status === 'pending'
      ? VERSION_TYPES.SUBMIT_REVIEW
      : VERSION_TYPES.SAVE_DRAFT
    addArticleVersion(newArticle, versionType)

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
        claimantId: '',
        claimantName: '',
        claimedAt: '',
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
    let claimantId = article.claimantId
    let claimantName = article.claimantName
    let claimedAt = article.claimedAt
    if (updates.status === 'pending') {
      reviewStage = needTwoLevel ? 'first_pending' : ''
      claimantId = ''
      claimantName = ''
      claimedAt = ''
    } else if (updates.status === 'draft') {
      reviewStage = ''
      claimantId = ''
      claimantName = ''
      claimedAt = ''
    }
    const updated = {
      ...article,
      ...updates,
      categoryName: category ? category.name : article.categoryName,
      updatedAt: formatDate(new Date()),
      reviewStage,
      claimantId,
      claimantName,
      claimedAt,
    }
    const articles = state.articles.map((a) => (a.id === id ? updated : a))
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.UPDATE_ARTICLE, payload: updated })

    if (updates.status === 'pending') {
      addArticleVersion(updated, VERSION_TYPES.SUBMIT_REVIEW)
      addOperationLog(OPERATION_ACTIONS.SUBMIT_REVIEW, updated.title)
    } else if (updates.status === 'draft') {
      addArticleVersion(updated, VERSION_TYPES.SAVE_DRAFT)
      addOperationLog(OPERATION_ACTIONS.SAVE_DRAFT, updated.title)
    } else if (updates.publishDate !== undefined && updates.publishDate !== article.publishDate) {
      addArticleVersion(updated, VERSION_TYPES.SCHEDULE_PUBLISH_DATE)
      addOperationLog(OPERATION_ACTIONS.SCHEDULE_PUBLISH_DATE, updated.title)
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
    const currentUser = state.currentUser
    if (!currentUser) return null

    if (!article.claimantId) {
      return { success: false, message: '请先认领任务后再进行审核操作' }
    }
    if (article.claimantId !== currentUser.id) {
      return { success: false, message: '该任务已被其他人认领，您无法操作' }
    }

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
      claimantId: '',
      claimantName: '',
      claimedAt: '',
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
          claimantId: '',
          claimantName: '',
          claimedAt: '',
        }
      }
      return a
    })
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.REVIEW_ARTICLE, payload: reviewData })

    const reviewedArticle = articles.find((a) => a.id === id)
    let versionType = VERSION_TYPES.REVIEW_PASS
    if (status === 'rejected') {
      if (historyStage === 'first') {
        versionType = VERSION_TYPES.FIRST_REVIEW_REJECT
      } else if (historyStage === 'final') {
        versionType = VERSION_TYPES.FINAL_REVIEW_REJECT
      } else {
        versionType = VERSION_TYPES.REVIEW_REJECT
      }
    } else {
      if (historyStage === 'first') {
        versionType = VERSION_TYPES.FIRST_REVIEW_PASS
      } else if (historyStage === 'final') {
        versionType = VERSION_TYPES.FINAL_REVIEW_PASS
      }
    }
    if (reviewedArticle) {
      addArticleVersion(reviewedArticle, versionType)
    }

    addOperationLog(reviewAction, article.title)

    return { success: true }
  }

  const claimArticle = (id) => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const currentUser = state.currentUser
    if (!currentUser) return null

    if (article.claimantId && article.claimantId !== currentUser.id) {
      return { success: false, message: '该任务已被其他人认领' }
    }

    if (article.claimantId === currentUser.id) {
      return { success: false, message: '您已认领该任务' }
    }

    const now = formatDateTime(new Date())
    const claimData = {
      id,
      claimantId: currentUser.id,
      claimantName: currentUser.name,
      claimedAt: now,
    }

    const articles = state.articles.map((a) =>
      a.id === id
        ? {
            ...a,
            claimantId: currentUser.id,
            claimantName: currentUser.name,
            claimedAt: now,
          }
        : a
    )
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.CLAIM_ARTICLE, payload: claimData })
    addOperationLog(OPERATION_ACTIONS.CLAIM_TASK, article.title)

    return { success: true, data: claimData }
  }

  const releaseArticle = (id, isForce = false) => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return null
    const currentUser = state.currentUser
    if (!currentUser) return null

    if (!article.claimantId) {
      return { success: false, message: '该任务未被认领' }
    }

    if (!isForce && article.claimantId !== currentUser.id) {
      return { success: false, message: '只能释放您自己认领的任务' }
    }

    const releaseData = {
      id,
    }

    const articles = state.articles.map((a) =>
      a.id === id
        ? {
            ...a,
            claimantId: '',
            claimantName: '',
            claimedAt: '',
          }
        : a
    )
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.RELEASE_ARTICLE, payload: releaseData })

    const action = isForce
      ? OPERATION_ACTIONS.FORCE_RELEASE_TASK
      : OPERATION_ACTIONS.RELEASE_TASK
    addOperationLog(action, article.title)

    return { success: true }
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

  const getArticleVersions = (articleId) => {
    if (!articleId) return []
    return state.articleVersions
      .filter((v) => v.articleId === articleId)
      .sort((a, b) => b.version - a.version)
  }

  const getArticleVersionById = (versionId) => {
    if (!versionId) return null
    return state.articleVersions.find((v) => v.id === versionId) || null
  }

  const compareVersions = (version1, version2) => {
    if (!version1 || !version2) return []

    const fields = [
      { key: 'title', label: '标题' },
      { key: 'categoryName', label: '类别' },
      { key: 'department', label: '科室' },
      { key: 'publishDate', label: '发布日期' },
      { key: 'content', label: '正文' },
    ]

    const differences = []
    fields.forEach((field) => {
      const oldVal = version1[field.key] || ''
      const newVal = version2[field.key] || ''
      if (oldVal !== newVal) {
        differences.push({
          field: field.key,
          label: field.label,
          oldValue: oldVal,
          newValue: newVal,
        })
      }
    })

    const oldAttachmentName = version1.attachmentName || ''
    const oldAttachmentUrl = version1.attachmentUrl || ''
    const newAttachmentName = version2.attachmentName || ''
    const newAttachmentUrl = version2.attachmentUrl || ''
    if (oldAttachmentName !== newAttachmentName || oldAttachmentUrl !== newAttachmentUrl) {
      const formatAttachment = (name, url) => {
        if (!name && !url) return ''
        if (name && url) return `${name} (${url})`
        return name || url
      }
      differences.push({
        field: 'attachment',
        label: '附件',
        oldValue: formatAttachment(oldAttachmentName, oldAttachmentUrl),
        newValue: formatAttachment(newAttachmentName, newAttachmentUrl),
      })
    }

    return differences
  }

  const restoreArticleFromVersion = (versionId) => {
    const version = getArticleVersionById(versionId)
    if (!version) return null

    const article = state.articles.find((a) => a.id === version.articleId)
    if (!article) return null

    const restored = {
      ...article,
      title: version.title,
      category: version.category,
      categoryName: version.categoryName,
      department: version.department,
      publishDate: version.publishDate,
      content: version.content,
      attachmentUrl: version.attachmentUrl,
      attachmentName: version.attachmentName,
      status: 'draft',
      reviewStage: '',
      updatedAt: formatDate(new Date()),
    }

    const articles = state.articles.map((a) => (a.id === article.id ? restored : a))
    storage.set(STORAGE_KEYS.ARTICLES, articles)
    dispatch({ type: actionTypes.UPDATE_ARTICLE, payload: restored })

    addArticleVersion(restored, VERSION_TYPES.RESTORE, `从 v${version.version} 版本恢复`)
    addOperationLog(OPERATION_ACTIONS.RESTORE_VERSION, restored.title)

    return restored
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

  const saveImportDraft = (draftData) => {
    if (!state.currentUser) return null

    const now = formatDateTime(new Date())
    const allDrafts = storage.get(STORAGE_KEYS.IMPORT_DRAFTS) || []

    const newDraft = {
      id: generateId(),
      name: draftData.name || `导入草稿-${now}`,
      rows: draftData.rows || [],
      totalCount: draftData.totalCount || 0,
      validCount: draftData.validCount || 0,
      errorCount: draftData.errorCount || 0,
      warningCount: draftData.warningCount || 0,
      sourceType: draftData.sourceType || 'upload',
      createdBy: state.currentUser.id,
      createdByName: state.currentUser.name,
      createdAt: now,
      updatedAt: now,
    }

    const updatedDrafts = [newDraft, ...allDrafts]
    storage.set(STORAGE_KEYS.IMPORT_DRAFTS, updatedDrafts)

    const userDrafts = updatedDrafts.filter((d) => d.createdBy === state.currentUser.id)
    dispatch({ type: actionTypes.INIT_IMPORT_DRAFTS, payload: userDrafts })

    addOperationLog(OPERATION_ACTIONS.SAVE_IMPORT_DRAFT, newDraft.name)

    return newDraft
  }

  const updateImportDraft = (draftId, draftData) => {
    if (!state.currentUser) return null

    const allDrafts = storage.get(STORAGE_KEYS.IMPORT_DRAFTS) || []
    const draftIndex = allDrafts.findIndex((d) => d.id === draftId)
    if (draftIndex === -1) return null

    const now = formatDateTime(new Date())
    const updatedDraft = {
      ...allDrafts[draftIndex],
      ...draftData,
      updatedAt: now,
    }

    allDrafts[draftIndex] = updatedDraft
    storage.set(STORAGE_KEYS.IMPORT_DRAFTS, allDrafts)

    const userDrafts = allDrafts.filter((d) => d.createdBy === state.currentUser.id)
    dispatch({ type: actionTypes.INIT_IMPORT_DRAFTS, payload: userDrafts })

    return updatedDraft
  }

  const deleteImportDraft = (draftId) => {
    if (!state.currentUser) return false

    const allDrafts = storage.get(STORAGE_KEYS.IMPORT_DRAFTS) || []
    const draft = allDrafts.find((d) => d.id === draftId)
    if (!draft) return false

    const updatedDrafts = allDrafts.filter((d) => d.id !== draftId)
    storage.set(STORAGE_KEYS.IMPORT_DRAFTS, updatedDrafts)

    const userDrafts = updatedDrafts.filter((d) => d.createdBy === state.currentUser.id)
    dispatch({ type: actionTypes.INIT_IMPORT_DRAFTS, payload: userDrafts })

    addOperationLog(OPERATION_ACTIONS.DELETE_IMPORT_DRAFT, draft.name)

    return true
  }

  const getImportDraftById = (draftId) => {
    return state.importDrafts.find((d) => d.id === draftId) || null
  }

  const partialBatchImport = (articles, draftId = null) => {
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
        claimantId: '',
        claimantName: '',
        claimedAt: '',
        deleted: false,
      }
    })
    const allArticles = [...newArticles, ...state.articles]
    storage.set(STORAGE_KEYS.ARTICLES, allArticles)
    dispatch({ type: actionTypes.BATCH_ADD_ARTICLES, payload: newArticles })

    newArticles.forEach((article) => {
      const versionType = article.status === 'pending'
        ? VERSION_TYPES.SUBMIT_REVIEW
        : VERSION_TYPES.SAVE_DRAFT
      addArticleVersion(article, versionType)
    })

    addOperationLog(OPERATION_ACTIONS.PARTIAL_BATCH_IMPORT, `共${newArticles.length}条`)

    if (draftId) {
      deleteImportDraft(draftId)
    }

    return newArticles
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
        claimArticle,
        releaseArticle,
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
        getArticleVersions,
        getArticleVersionById,
        compareVersions,
        restoreArticleFromVersion,
        saveImportDraft,
        updateImportDraft,
        deleteImportDraft,
        getImportDraftById,
        partialBatchImport,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
