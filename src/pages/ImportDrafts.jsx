import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search,
  Trash2,
  Eye,
  ArrowLeft,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  FileArchive,
  Edit,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import Pagination from '../components/Pagination'
import { useApp } from '../context/useApp'

const PAGE_SIZE = 10

export default function ImportDrafts() {
  const { state, deleteImportDraft } = useApp()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailDraft, setDetailDraft] = useState(null)

  const drafts = useMemo(() => {
    let result = [...state.importDrafts]

    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(kw) ||
          d.rows.some((r) => r.title.toLowerCase().includes(kw))
      )
    }

    result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    return result
  }, [state.importDrafts, keyword])

  const totalPages = Math.ceil(drafts.length / PAGE_SIZE)
  const paginatedDrafts = drafts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleDelete = (id) => {
    const draft = state.importDrafts.find((d) => d.id === id)
    if (window.confirm(`确定要删除草稿"${draft?.name}"吗？删除后无法恢复！`)) {
      deleteImportDraft(id)
      if (detailDraft && detailDraft.id === id) {
        setShowDetailModal(false)
        setDetailDraft(null)
      }
    }
  }

  const handleViewDetail = (draft) => {
    setDetailDraft(draft)
    setShowDetailModal(true)
  }

  const handleContinueEdit = (draftId) => {
    navigate(`/admin/batch-import?draftId=${draftId}`)
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
        <h2 className="text-xl font-bold text-gray-800">导入草稿箱</h2>
        <p className="text-gray-500 text-sm mt-1">
          管理批量导入的草稿，可继续编辑、导入或删除
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="搜索草稿名称或标题..."
                className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/batch-import')}
            className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            新建批量导入
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  草稿名称
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  数据条数
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  有效/错误/警告
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-36">
                  创建时间
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-36">
                  更新时间
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-40">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrafts.length > 0 ? (
                paginatedDrafts.map((draft) => (
                  <tr
                    key={draft.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileArchive className="w-4 h-4 text-indigo-500" />
                        <div>
                          <div className="text-sm text-gray-900 font-medium line-clamp-1">
                            {draft.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {draft.sourceType === 'upload' ? '文件上传' : '文本粘贴'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {draft.totalCount} 条
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {draft.validCount}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {draft.errorCount}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-yellow-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {draft.warningCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{draft.createdAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{draft.updatedAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetail(draft)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleContinueEdit(draft.id)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="继续编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(draft.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-16 text-center">
                    <FileArchive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">暂无导入草稿</p>
                    <button
                      onClick={() => navigate('/admin/batch-import')}
                      className="mt-3 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium inline-flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      去批量导入
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {showDetailModal && detailDraft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">草稿详情</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setDetailDraft(null)
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {detailDraft.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span>
                    来源：{detailDraft.sourceType === 'upload' ? '文件上传' : '文本粘贴'}
                  </span>
                  <span>创建人：{detailDraft.createdByName}</span>
                  <span>创建时间：{detailDraft.createdAt}</span>
                  <span>更新时间：{detailDraft.updatedAt}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {detailDraft.totalCount}
                  </div>
                  <div className="text-sm text-gray-500">总记录数</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {detailDraft.validCount}
                  </div>
                  <div className="text-sm text-gray-500">有效</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {detailDraft.errorCount}
                  </div>
                  <div className="text-sm text-gray-500">错误</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {detailDraft.warningCount}
                  </div>
                  <div className="text-sm text-gray-500">警告</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-800 mb-3">数据列表</h4>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-12">
                          行号
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                          标题
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-20">
                          类别
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-24">
                          科室
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-24">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailDraft.rows.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-b border-gray-50 ${
                            !row.isValid
                              ? 'bg-red-50'
                              : row.warnings.length > 0
                              ? 'bg-yellow-50'
                              : ''
                          }`}
                        >
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {row.rowIndex}
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm text-gray-900 line-clamp-1">
                              {row.title || '(空)'}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {row.categoryCode || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {row.department || '-'}
                          </td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              row.warnings.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                                  有警告
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                  有效
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded">
                                有错误
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <button
                onClick={() => handleDelete(detailDraft.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除草稿
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setDetailDraft(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  关闭
                </button>
                <button
                  onClick={() => handleContinueEdit(detailDraft.id)}
                  className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  继续编辑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
