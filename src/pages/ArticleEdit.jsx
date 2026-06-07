import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Send,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paperclip,
  AlertTriangle,
  XCircle,
  Info,
  History,
  Clock,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../context/useApp'
import {
  getValidationRules,
  getContentTextLength,
  getActiveCategories,
  getActiveDepartments,
  getReviewStageText,
  getReviewStageColor,
} from '../utils/helpers'

export default function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, addArticle, updateArticle, getArticleById, getReviewFlowConfig } = useApp()
  const editorRef = useRef(null)
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    department: '',
    publishDate: '',
    content: '',
    attachmentUrl: '',
    attachmentName: '',
  })

  const [errors, setErrors] = useState({})
  const [warnings, setWarnings] = useState([])
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [rectificationRemark, setRectificationRemark] = useState('')
  const [showReviewHistory, setShowReviewHistory] = useState(false)
  const [showRejectReason, setShowRejectReason] = useState(true)

  const currentRules = useMemo(() => {
    if (!formData.category) return null
    const config = getReviewFlowConfig(formData.category)
    return getValidationRules(config)
  }, [formData.category, getReviewFlowConfig])

  const contentLength = useMemo(() => {
    return getContentTextLength(formData.content)
  }, [formData.content])

  const availableCategories = useMemo(() => {
    const activeCats = getActiveCategories(state.categories)
    if (isEdit && formData.category) {
      const currentCat = state.categories.find((c) => c.code === formData.category)
      if (currentCat && currentCat.status !== 'active') {
        return [...activeCats, currentCat].sort((a, b) => (a.sort || 0) - (b.sort || 0))
      }
    }
    return activeCats
  }, [state.categories, formData.category, isEdit])

  const availableDepartments = useMemo(() => {
    const activeDepts = getActiveDepartments(state.departments)
    if (isEdit && formData.department) {
      const currentDept = state.departments.find((d) => d.name === formData.department)
      if (currentDept && currentDept.status !== 'active') {
        return [...activeDepts, currentDept].sort((a, b) => (a.sort || 0) - (b.sort || 0))
      }
    }
    return activeDepts
  }, [state.departments, formData.department, isEdit])

  const currentArticle = useMemo(() => {
    if (!isEdit) return null
    return getArticleById(id) || null
  }, [isEdit, id, getArticleById])

  const isRejectedArticle = useMemo(() => {
    return currentArticle && currentArticle.status === 'rejected'
  }, [currentArticle])

  const lastRejectInfo = useMemo(() => {
    if (!currentArticle || !currentArticle.reviewHistory || currentArticle.reviewHistory.length === 0) {
      return null
    }
    const rejectRecords = currentArticle.reviewHistory.filter((h) => h.action === 'reject')
    if (rejectRecords.length === 0) return null
    return rejectRecords[rejectRecords.length - 1]
  }, [currentArticle])

  const usedRejectTemplates = useMemo(() => {
    if (!currentArticle || !currentArticle.reviewHistory) return []
    const templates = []
    const seenIds = new Set()
    currentArticle.reviewHistory
      .filter((h) => h.action === 'reject' && h.rejectTemplateId)
      .reverse()
      .forEach((h) => {
        if (!seenIds.has(h.rejectTemplateId)) {
          seenIds.add(h.rejectTemplateId)
          templates.push({
            id: h.rejectTemplateId,
            title: h.rejectTemplateTitle,
            content: h.comment,
          })
        }
      })
    return templates
  }, [currentArticle])

  useEffect(() => {
    if (isEdit) {
      const article = getArticleById(id)
      if (article) {
        setFormData({
          title: article.title,
          category: article.category,
          department: article.department,
          publishDate: article.publishDate,
          content: article.content,
          attachmentUrl: article.attachmentUrl,
          attachmentName: article.attachmentName,
        })
        if (editorRef.current) {
          editorRef.current.innerHTML = article.content
        }
      }
    }
  }, [id, isEdit, getArticleById])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      if (name === 'attachmentName' || name === 'attachmentUrl') {
        delete next.attachment
      }
      if (name === 'category') {
        delete next.attachment
        delete next.publishDate
      }
      return next
    })
  }

  const handleContentInput = () => {
    if (editorRef.current) {
      setFormData((prev) => ({ ...prev, content: editorRef.current.innerHTML }))
      if (errors.content) {
        setErrors((prev) => ({ ...prev, content: '' }))
      }
    }
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleContentInput()
  }

  const getBasicErrors = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = '请输入标题'
    if (!formData.category) newErrors.category = '请选择公开类别'
    if (!formData.department) newErrors.department = '请选择发布科室'
    if (!formData.content.trim()) newErrors.content = '请输入正文内容'
    return newErrors
  }

  const validateBasic = () => {
    const newErrors = getBasicErrors()
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateWithRules = (isSubmit = false) => {
    const basicErrors = getBasicErrors()
    const hasBasicError = Object.keys(basicErrors).length > 0

    if (hasBasicError) {
      setErrors(basicErrors)
      setWarnings([])
      return { isValid: false, errors: basicErrors, warnings: [] }
    }

    if (!currentRules) {
      setErrors({})
      setWarnings([])
      return { isValid: true, errors: {}, warnings: [] }
    }

    const ruleErrors = {}
    const ruleWarnings = []

    if (currentRules.requireAttachment) {
      const hasAttachment = (formData.attachmentName && formData.attachmentName.trim()) ||
        (formData.attachmentUrl && formData.attachmentUrl.trim())
      if (!hasAttachment) {
        if (isSubmit) {
          ruleErrors.attachment = '该分类必须上传附件'
        } else {
          ruleWarnings.push('该分类要求必须上传附件')
        }
      }
    }

    if (currentRules.minContentLength > 0) {
      if (contentLength > 0 && contentLength < currentRules.minContentLength) {
        if (isSubmit) {
          ruleErrors.content = `正文内容字数不能少于 ${currentRules.minContentLength} 字（当前 ${contentLength} 字）`
        } else {
          ruleWarnings.push(`正文内容字数不足 ${currentRules.minContentLength} 字（当前 ${contentLength} 字）`)
        }
      }
    }

    if (currentRules.requirePublishDate && !formData.publishDate) {
      if (isSubmit) {
        ruleErrors.publishDate = '该分类发布日期为必填项'
      } else {
        ruleWarnings.push('该分类要求发布日期为必填项')
      }
    }

    if (currentRules.forbidDuplicateTitle && formData.title.trim()) {
      const trimmedTitle = formData.title.trim()
      const isDuplicate = state.articles.some((a) => {
        if (isEdit && a.id === id) return false
        if (a.deleted) return false
        return a.title && a.title.trim() === trimmedTitle
      })
      if (isDuplicate) {
        if (isSubmit) {
          ruleErrors.title = '该分类禁止重复标题，当前标题已存在'
        } else {
          ruleWarnings.push('标题与现有文章重复，该分类禁止重复标题')
        }
      }
    }

    if (!currentRules.forbidDuplicateTitle && formData.title.trim()) {
      const trimmedTitle = formData.title.trim()
      const isDuplicate = state.articles.some((a) => {
        if (isEdit && a.id === id) return false
        if (a.deleted) return false
        return a.title && a.title.trim() === trimmedTitle
      })
      if (isDuplicate) {
        ruleWarnings.push('标题与现有文章重复')
      }
    }

    const allErrors = { ...basicErrors, ...ruleErrors }
    setErrors(allErrors)
    setWarnings(ruleWarnings)

    return {
      isValid: Object.keys(allErrors).length === 0,
      errors: allErrors,
      warnings: ruleWarnings,
    }
  }

  const handleSaveDraft = () => {
    if (!validateBasic()) return

    const result = validateWithRules(false)

    if (result.warnings.length > 0) {
      setPendingAction('draft')
      setShowWarningModal(true)
      return
    }

    doSaveDraft()
  }

  const doSaveDraft = () => {
    setShowWarningModal(false)
    setPendingAction(null)

    if (isEdit) {
      updateArticle(id, { ...formData, status: 'draft' })
    } else {
      addArticle({ ...formData, status: 'draft' })
    }
    navigate('/admin/articles')
  }

  const handleSubmitReview = () => {
    const result = validateWithRules(true)
    if (!result.isValid) {
      return
    }

    if (isRejectedArticle && !rectificationRemark.trim()) {
      alert('请填写整改说明后再重新提交审核')
      return
    }

    if (isEdit) {
      updateArticle(id, { ...formData, status: 'pending' }, {
        rectificationRemark: rectificationRemark.trim(),
      })
    } else {
      addArticle({ ...formData, status: 'pending' })
    }
    navigate('/admin/articles')
  }

  const confirmWithWarnings = () => {
    if (pendingAction === 'draft') {
      doSaveDraft()
    } else if (pendingAction === 'submit') {
      setShowWarningModal(false)
      setPendingAction(null)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link
          to="/admin/articles"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
        <h2 className="text-xl font-bold text-gray-800">
          {isEdit ? '编辑信息' : '新增信息'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          填写政务公开信息的详细内容
        </p>
      </div>

      {currentRules && (currentRules.requireAttachment || currentRules.minContentLength > 0 || currentRules.requirePublishDate || currentRules.forbidDuplicateTitle) && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium">该分类校验规则</p>
              <div className="mt-1 text-amber-600 space-y-0.5">
                {currentRules.requireAttachment && <p>· 必须上传附件</p>}
                {currentRules.minContentLength > 0 && <p>· 正文最少 {currentRules.minContentLength} 字</p>}
                {currentRules.requirePublishDate && <p>· 发布日期必填</p>}
                {currentRules.forbidDuplicateTitle && <p>· 禁止重复标题</p>}
              </div>
              <p className="mt-1 text-xs text-amber-500">
                保存草稿时仅提示风险，提交审核时按规则严格校验
              </p>
            </div>
          </div>
        </div>
      )}

      {isRejectedArticle && (
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div
            className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between cursor-pointer hover:bg-red-50/80 transition-colors"
            onClick={() => setShowRejectReason(!showRejectReason)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-red-900 flex items-center gap-2">
                  退回原因
                  {currentArticle?.rectificationCount > 0 && (
                    <span className="text-xs font-normal bg-red-200 text-red-700 px-2 py-0.5 rounded-full">
                      第 {currentArticle.rectificationCount + 1} 次退回
                    </span>
                  )}
                </h3>
                <p className="text-sm text-red-600 mt-0.5">
                  请根据退回意见修改后重新提交，记得填写整改说明
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastRejectInfo?.rejectTemplateTitle && (
                <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-md font-medium">
                  {lastRejectInfo.rejectTemplateTitle}
                </span>
              )}
              {showRejectReason ? (
                <ChevronUp className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
            </div>
          </div>
          {showRejectReason && (
            <div className="p-6">
              {lastRejectInfo && (
                <div className="bg-red-50/50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-800">
                        {lastRejectInfo.reviewerName}
                      </span>
                      <span className="text-xs text-red-500">
                        {lastRejectInfo.reviewedAt}
                      </span>
                    </div>
                    {lastRejectInfo.reviewStage && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getReviewStageColor(lastRejectInfo.reviewStage)}`}>
                        {getReviewStageText(lastRejectInfo.reviewStage)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-red-900 leading-relaxed whitespace-pre-wrap">
                    {lastRejectInfo.comment || '无退回原因说明'}
                  </p>
                </div>
              )}

              {usedRejectTemplates.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    使用过的退回模板
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {usedRejectTemplates.map((tpl) => (
                      <span
                        key={tpl.id}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full cursor-help hover:bg-gray-200 transition-colors"
                        title={tpl.content}
                      >
                        {tpl.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isRejectedArticle && (
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              整改说明 <span className="text-red-500 text-sm">*</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              请简要说明针对退回意见所做的修改内容
            </p>
          </div>
          <div className="p-6">
            <textarea
              value={rectificationRemark}
              onChange={(e) => setRectificationRemark(e.target.value)}
              placeholder="例如：已补充完善第二段的具体数据；已调整第三部分的表述逻辑；已修正附件中的错别字..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {rectificationRemark.length} / 1000 字
            </p>
          </div>
        </div>
      )}

      {currentArticle && currentArticle.reviewHistory && currentArticle.reviewHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowReviewHistory(!showReviewHistory)}
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              <h3 className="text-base font-semibold text-gray-900">审核历史</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {currentArticle.reviewHistory.length} 条记录
              </span>
            </div>
            {showReviewHistory ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {showReviewHistory && (
            <div className="p-6">
              <div className="space-y-4">
                {[...currentArticle.reviewHistory].reverse().map((record, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          record.action === 'pass'
                            ? 'bg-green-100 text-green-600'
                            : record.action === 'reject'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {record.action === 'pass' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : record.action === 'reject' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      {index < currentArticle.reviewHistory.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {record.reviewerName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          record.action === 'pass'
                            ? 'bg-green-100 text-green-700'
                            : record.action === 'reject'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {record.action === 'pass' ? '审核通过' : record.action === 'reject' ? '退回修改' : '提交审核'}
                        </span>
                        {record.reviewStage && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getReviewStageColor(record.reviewStage)}`}>
                            {getReviewStageText(record.reviewStage)}
                          </span>
                        )}
                        {record.rejectTemplateTitle && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {record.rejectTemplateTitle}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">
                          {record.reviewedAt || record.time}
                        </span>
                      </div>
                      {record.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {record.comment}
                        </p>
                      )}
                      {record.rectificationRemark && (
                        <div className="mt-2 text-sm bg-amber-50 text-amber-800 p-2.5 rounded-md border border-amber-100">
                          <span className="font-medium">整改说明：</span>
                          {record.rectificationRemark}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入信息标题"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                  errors.title ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公开类别 <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                  errors.category ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                }`}
              >
                <option value="">请选择类别</option>
                {availableCategories.map((cat) => (
                  <option key={cat.code} value={cat.code} disabled={cat.status === 'inactive'}>
                    {cat.name}
                    {cat.status === 'inactive' && ' (已停用)'}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发布科室 <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                  errors.department ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                }`}
              >
                <option value="">请选择科室</option>
                {availableDepartments.map((dept) => (
                  <option key={dept.id} value={dept.name} disabled={dept.status === 'inactive'}>
                    {dept.name}
                    {dept.status === 'inactive' && ' (已停用)'}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.department}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发布日期
                {currentRules?.requirePublishDate && <span className="text-red-500"> *</span>}
              </label>
              <input
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                  errors.publishDate ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                }`}
              />
              {errors.publishDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.publishDate}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                {currentRules?.requirePublishDate
                  ? '该分类发布日期为必填项'
                  : '可选，审核通过后自动填入发布日期'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                附件
                {currentRules?.requireAttachment && <span className="text-red-500"> *</span>}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="attachmentName"
                    value={formData.attachmentName}
                    onChange={handleInputChange}
                    placeholder="附件名称"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm ${
                      errors.attachment ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                    }`}
                  />
                </div>
                <input
                  type="text"
                  name="attachmentUrl"
                  value={formData.attachmentUrl}
                  onChange={handleInputChange}
                  placeholder="附件链接URL"
                  className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm ${
                    errors.attachment ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.attachment && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.attachment}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                正文内容 <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${
                currentRules?.minContentLength > 0 && contentLength < currentRules.minContentLength
                  ? 'text-amber-600'
                  : 'text-gray-400'
              }`}>
                {contentLength} 字
                {currentRules?.minContentLength > 0 && ` / 最少 ${currentRules.minContentLength} 字`}
              </span>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => execCommand('bold')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="加粗"
                >
                  <Bold className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('italic')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="斜体"
                >
                  <Italic className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('underline')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="下划线"
                >
                  <Underline className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => execCommand('justifyLeft')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="左对齐"
                >
                  <AlignLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('justifyCenter')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="居中"
                >
                  <AlignCenter className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('justifyRight')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="右对齐"
                >
                  <AlignRight className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => execCommand('insertUnorderedList')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="无序列表"
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('insertOrderedList')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="有序列表"
                >
                  <ListOrdered className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentInput}
                className="richtext-editor border-0 rounded-none min-h-[300px] p-4 focus:ring-0"
                placeholder="请输入正文内容..."
              />
            </div>
            {errors.content && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.content}
              </p>
            )}
          </div>

          {warnings.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">风险提示</p>
                  <ul className="mt-1 text-sm text-amber-700 space-y-0.5">
                    {warnings.map((warn, idx) => (
                      <li key={idx}>· {warn}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => navigate('/admin/articles')}
            className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-5 py-2.5 border border-primary-600 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存草稿
          </button>
          <button
            onClick={handleSubmitReview}
            className="px-5 py-2.5 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            提交审核
          </button>
        </div>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md fade-in">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">风险提示</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    以下内容可能不符合该分类的校验规则：
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {warnings.map((warn, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-amber-500">·</span>
                        {warn}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    {pendingAction === 'draft'
                      ? '保存草稿仅作提示，不影响保存。提交审核时将按规则严格校验。'
                      : '提交审核将被阻断，请修改后再提交。'}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowWarningModal(false)
                  setPendingAction(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                {pendingAction === 'draft' ? '继续编辑' : '我知道了'}
              </button>
              {pendingAction === 'draft' && (
                <button
                  onClick={confirmWithWarnings}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2"
                >
                  仍保存草稿
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
