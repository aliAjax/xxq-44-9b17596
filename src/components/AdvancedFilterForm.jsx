import { X, RotateCcw } from 'lucide-react'
import { getActiveCategories, getActiveDepartments } from '../utils/helpers'

export default function AdvancedFilterForm({
  filters,
  onFilterChange,
  categories,
  departments,
  isAdmin = false,
  showStatusFilter = false,
  showDeletedFilter = false,
  onReset,
  onClose,
}) {
  const displayCategories = getActiveCategories(categories || [])
  const displayDepartments = getActiveDepartments(departments || [])

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">高级筛选</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">公开类别</label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">全部类别</option>
            {displayCategories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">发布科室</label>
          <select
            value={filters.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">全部科室</option>
            {displayDepartments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">是否有附件</label>
          <select
            value={filters.hasAttachment || ''}
            onChange={(e) => handleChange('hasAttachment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">不限</option>
            <option value="yes">有附件</option>
            <option value="no">无附件</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">开始日期</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">结束日期</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {isAdmin && showStatusFilter && (
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">状态</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部状态</option>
              <option value="draft">草稿</option>
              <option value="pending_all">待审核（含待复审）</option>
              <option value="pending">待初审</option>
              <option value="first_reviewed">待复审</option>
              <option value="published">已发布</option>
              <option value="rejected">已退回</option>
            </select>
          </div>
        )}

        {isAdmin && showDeletedFilter && (
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">删除情况</label>
            <select
              value={filters.deleted || ''}
              onChange={(e) => handleChange('deleted', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">不限</option>
              <option value="no">未删除</option>
              <option value="yes">已删除</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
