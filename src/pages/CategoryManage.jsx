import { useState } from 'react'
import { Plus, Edit2, Power, X, Check, FolderOpen, AlertTriangle } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../context/useApp'
import { getActiveCategories } from '../utils/helpers'

export default function CategoryManage() {
  const { state, addCategory, updateCategory } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [newCategory, setNewCategory] = useState({ name: '', code: '' })
  const [errors, setErrors] = useState({})

  const activeCategories = getActiveCategories(state.categories)
  const inactiveCategories = state.categories.filter((c) => c.status === 'inactive')

  const validateNewCategory = () => {
    const newErrors = {}
    if (!newCategory.name.trim()) {
      newErrors.name = '请输入类别名称'
    }
    if (!newCategory.code.trim()) {
      newErrors.code = '请输入类别代码'
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(newCategory.code)) {
      newErrors.code = '类别代码只能包含字母、数字和下划线，且以字母开头'
    } else if (state.categories.some((c) => c.code === newCategory.code.trim())) {
      newErrors.code = '该类别代码已存在'
    }
    if (state.categories.some((c) => c.name === newCategory.name.trim())) {
      newErrors.name = '该类别名称已存在'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddCategory = () => {
    if (!validateNewCategory()) return

    addCategory({
      name: newCategory.name.trim(),
      code: newCategory.code.trim(),
    })
    setNewCategory({ name: '', code: '' })
    setShowAddModal(false)
    setErrors({})
  }

  const handleStartEdit = (category) => {
    setEditingId(category.id)
    setEditName(category.name)
  }

  const handleSaveEdit = (id) => {
    if (!editName.trim()) {
      setErrors({ editName: '类别名称不能为空' })
      return
    }
    const exists = state.categories.some(
      (c) => c.id !== id && c.name === editName.trim()
    )
    if (exists) {
      setErrors({ editName: '该类别名称已存在' })
      return
    }

    updateCategory(id, { name: editName.trim() })
    setEditingId(null)
    setEditName('')
    setErrors({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setErrors({})
  }

  const handleToggleStatus = (category) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active'
    if (newStatus === 'inactive') {
      const articleCount = state.articles.filter(
        (a) => a.category === category.code && !a.deleted
      ).length
      if (articleCount > 0) {
        if (!window.confirm(
          `该类别下有 ${articleCount} 篇文章，停用后将无法用于新文章，但历史文章仍会正常显示。确定要停用吗？`
        )) {
          return
        }
      }
    }
    updateCategory(category.id, { status: newStatus })
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">公开类别管理</h2>
        <p className="text-gray-500 text-sm mt-1">
          管理政务公开信息的分类，高级复核员可新增、重命名和停用类别
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-800">公开类别列表</h3>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增类别
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">使用说明</p>
                <p className="mt-1 text-blue-600">
                  停用的类别将无法用于新建文章，但历史文章、版本历史、操作记录和回收站中的类别名称仍会正常显示。
                  重命名类别后，所有历史文章的类别名称会自动更新。
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              启用中 ({activeCategories.length})
            </h4>
            <div className="space-y-2">
              {activeCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    {editingId === cat.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="保存"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors"
                          title="取消"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {errors.editName && (
                          <span className="text-red-500 text-xs">{errors.editName}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-800">{cat.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">代码：{cat.code}</div>
                      </div>
                    )}
                  </div>
                  {editingId !== cat.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="重命名"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="停用"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {inactiveCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                已停用 ({inactiveCategories.length})
              </h4>
              <div className="space-y-2">
                {inactiveCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-600 line-through">{cat.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">代码：{cat.code}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(cat)}
                      className="px-3 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded transition-colors font-medium"
                    >
                      启用
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">新增公开类别</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewCategory({ name: '', code: '' })
                  setErrors({})
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类别名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => {
                    setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  placeholder="请输入类别名称，如：政策法规"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                    errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类别代码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.code}
                  onChange={(e) => {
                    setNewCategory((prev) => ({ ...prev, code: e.target.value.toLowerCase() }))
                    if (errors.code) setErrors((prev) => ({ ...prev, code: '' }))
                  }}
                  placeholder="请输入英文代码，如：policy"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                    errors.code ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                  }`}
                />
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">
                  类别代码为英文标识，创建后不可修改，用于系统内部关联
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewCategory({ name: '', code: '' })
                  setErrors({})
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新增
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
