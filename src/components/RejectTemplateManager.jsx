import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import { useApp } from '../context/useApp'

export default function RejectTemplateManager({ onSelectTemplate, onClose }) {
  const { state, addRejectTemplate, updateRejectTemplate, deleteRejectTemplate } = useApp()
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('请填写模板标题和内容')
      return
    }
    addRejectTemplate({ title: newTitle.trim(), content: newContent.trim() })
    setNewTitle('')
    setNewContent('')
    setIsAdding(false)
  }

  const handleEdit = (template) => {
    setEditingId(template.id)
    setEditTitle(template.title)
    setEditContent(template.content)
  }

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('请填写模板标题和内容')
      return
    }
    updateRejectTemplate(editingId, { title: editTitle.trim(), content: editContent.trim() })
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个模板吗？')) {
      deleteRejectTemplate(id)
    }
  }

  const handleSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">常用退回原因模板</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            新增模板
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-lg border border-primary-200 p-3 mb-3">
          <div className="mb-2">
            <label className="text-xs text-gray-500 mb-1 block">模板标题</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="请输入模板标题"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="mb-2">
            <label className="text-xs text-gray-500 mb-1 block">模板内容</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="请输入模板内容"
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAdding(false)
                setNewTitle('')
                setNewContent('')
              }}
              className="px-3 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              保存
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {state.rejectTemplates.length > 0 ? (
          state.rejectTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:border-primary-300 transition-colors"
            >
              {editingId === template.id ? (
                <div>
                  <div className="mb-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="mb-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{template.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.content}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {onSelectTemplate && (
                        <button
                          onClick={() => handleSelect(template)}
                          className="px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        >
                          使用
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">
            暂无模板，点击上方"新增模板"添加
          </div>
        )}
      </div>
    </div>
  )
}
