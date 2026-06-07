const STORAGE_KEYS = {
  ARTICLES: 'gov_articles',
  CURRENT_USER: 'gov_current_user',
  USERS: 'gov_users',
  CATEGORIES: 'gov_categories',
  CATEGORIES_INITIALIZED: 'gov_categories_initialized',
  DEPARTMENTS: 'gov_departments',
  DEPARTMENTS_INITIALIZED: 'gov_departments_initialized',
  REJECT_TEMPLATES: 'gov_reject_templates',
  REJECT_TEMPLATES_INITIALIZED: 'gov_reject_templates_initialized',
  OPERATION_LOGS: 'gov_operation_logs',
  REVIEW_FLOW_CONFIGS: 'gov_review_flow_configs',
  REVIEW_FLOW_INITIALIZED: 'gov_review_flow_initialized',
  ARTICLE_VERSIONS: 'gov_article_versions',
  VERSIONS_INITIALIZED: 'gov_versions_initialized',
  IMPORT_DRAFTS: 'gov_import_drafts',
  INITIALIZED: 'gov_initialized',
}

export const storage = {
  get(key) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (e) {
      console.error('Storage get error:', e)
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('Storage set error:', e)
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error('Storage remove error:', e)
      return false
    }
  },
}

export { STORAGE_KEYS }
