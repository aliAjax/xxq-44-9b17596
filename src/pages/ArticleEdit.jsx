import { useState, useEffect, useRef } from 'react'
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
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../context/AppContext'

export default function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, addArticle, updateArticle, getArticleById } = useApp()
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
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

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = '请输入标题'
    if (!formData.category) newErrors.category = '请选择公开类别'
    if (!formData.department) newErrors.department = '请选择发布科室'
    if (!formData.content.trim()) newErrors.content = '请输入正文内容'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveDraft = () => {
    if (!validate()) return

    if (isEdit) {
      updateArticle(id, { ...formData, status: 'draft' })
    } else {
      addArticle({ ...formData, status: 'draft' })
    }
    navigate('/admin/articles')
  }

  const handleSubmitReview = () => {
    if (!validate()) return

    if (isEdit) {
      updateArticle(id, { ...formData, status: 'pending' })
    } else {
      addArticle({ ...formData, status: 'pending' })
    }
    navigate('/admin/articles')
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
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
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
                {state.categories.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
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
                {state.departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发布日期
              </label>
              <input
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <p className="text-gray-400 text-xs mt-1">
                可选，审核通过后自动填入发布日期
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                附件
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
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                  />
                </div>
                <input
                  type="text"
                  name="attachmentUrl"
                  value={formData.attachmentUrl}
                  onChange={handleInputChange}
                  placeholder="附件链接URL"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              正文内容 <span className="text-red-500">*</span>
            </label>

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
              <p className="text-red-500 text-xs mt-1">{errors.content}</p>
            )}
          </div>
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
    </AdminLayout>
  )
}
