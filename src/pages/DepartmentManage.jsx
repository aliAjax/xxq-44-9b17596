import { useState } from 'react'
import { Plus, Edit2, X, Check, Building2, AlertTriangle, Power } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { useApp } from '../context/useApp'
import { getActiveDepartments } from '../utils/helpers'

export default function DepartmentManage() {
  const { state, addDepartment, updateDepartment } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [newDeptName, setNewDeptName] = useState('')
  const [errors, setErrors] = useState({})

  const activeDepartments = getActiveDepartments(state.departments)
  const inactiveDepartments = state.departments.filter((d) => d.status === 'inactive')

  const validateNewDept = () => {
    const newErrors = {}
    if (!newDeptName.trim()) {
      newErrors.name = '请输入科室名称'
    } else if (state.departments.some((d) => d.name === newDeptName.trim())) {
      newErrors.name = '该科室名称已存在'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddDept = () => {
    if (!validateNewDept()) return

    addDepartment({
      name: newDeptName.trim(),
    })
    setNewDeptName('')
    setShowAddModal(false)
    setErrors({})
  }

  const handleStartEdit = (dept) => {
    setEditingId(dept.id)
    setEditName(dept.name)
  }

  const handleSaveEdit = (id) => {
    if (!editName.trim()) {
      setErrors({ editName: '科室名称不能为空' })
      return
    }
    const exists = state.departments.some(
      (d) => d.id !== id && d.name === editName.trim()
    )
    if (exists) {
      setErrors({ editName: '该科室名称已存在' })
      return
    }

    updateDepartment(id, { name: editName.trim() })
    setEditingId(null)
    setEditName('')
    setErrors({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setErrors({})
  }

  const handleToggleStatus = (dept) => {
    const newStatus = dept.status === 'active' ? 'inactive' : 'active'
    if (newStatus === 'inactive') {
      const articleCount = state.articles.filter(
        (a) => a.department === dept.name && !a.deleted
      ).length
      if (articleCount > 0) {
        if (!window.confirm(
          `该科室下有 ${articleCount} 篇文章，停用后将无法用于新文章，但历史文章仍会正常显示。确定要停用吗？`
        )) {
          return
        }
      }
    }
    updateDepartment(dept.id, { status: newStatus })
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">科室管理</h2>
        <p className="text-gray-500 text-sm mt-1">
          管理发布科室信息，编辑人员可新增、重命名和停用科室
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-800">科室列表</h3>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增科室
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">使用说明</p>
                <p className="mt-1 text-blue-600">
                  停用的科室将无法用于新建文章，但历史文章、版本历史、操作记录和回收站中的科室名称仍会正常显示。
                  重命名科室后，所有历史文章的科室名称会自动更新。
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              启用中 ({activeDepartments.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary-600" />
                    </div>
                    {editingId === dept.id ? (
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1.5 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm min-w-0"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(dept.id)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors shrink-0"
                          title="保存"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors shrink-0"
                          title="取消"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-800 truncate">{dept.name}</span>
                    )}
                  </div>
                  {editingId !== dept.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(dept)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="重命名"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(dept)}
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
            {errors.editName && (
              <p className="text-red-500 text-xs mt-2">{errors.editName}</p>
            )}
          </div>

          {inactiveDepartments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                已停用 ({inactiveDepartments.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {inactiveDepartments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="font-medium text-gray-600 line-through">{dept.name}</span>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(dept)}
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
              <h3 className="text-lg font-bold text-gray-900">新增科室</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewDeptName('')
                  setErrors({})
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  科室名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => {
                    setNewDeptName(e.target.value)
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  placeholder="请输入科室名称，如：办公室"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                    errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewDeptName('')
                  setErrors({})
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleAddDept}
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
