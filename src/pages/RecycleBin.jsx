import { useState, useMemo } from 'react'
import { Search, RotateCcw, Trash2, Eye, MessageSquare, X } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import Pagination from '../components/Pagination'
import { useApp } from '../context/useApp'

const PAGE_SIZE = 10

export default function RecycleBin() {
  const { state, restoreArticle, permanentDeleteArticle } = useApp()
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailArticle, setDetailArticle] = useState(null)

  const deletedArticles = useMemo(() => {
    let result = state.articles.filter((a) => a.deleted)

    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter((a) => a.title.toLowerCase().includes(kw))
    }
    if (category) {
      result = result.filter((a) => a.category === category)
    }

    result.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))
    return result
  }, [state.articles, keyword, category])

  const totalPages = Math.ceil(deletedArticles.length / PAGE_SIZE)
  const paginatedArticles = deletedArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleRestore = (id) => {
    if (window.confirm('确定要恢复这条信息吗？')) {
      restoreArticle(id)
      if (detailArticle && detailArticle.id === id) {
        setShowDetailModal(false)
        setDetailArticle(null)
      }
    }
  }

  const handlePermanentDelete = (id) => {
    if (window.confirm('确定要彻底删除这条信息吗？删除后无法恢复！')) {
      permanentDeleteArticle(id)
      if (detailArticle && detailArticle.id === id) {
        setShowDetailModal(false)
        setDetailArticle(null)
      }
    }
  }

  const handleViewDetail = (article) => {
    setDetailArticle(article)
    setShowDetailModal(true)
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">回收站</h2>
        <p className="text-gray-500 text-sm mt-1">管理已删除的政务公开信息，可恢复或彻底删除</p>
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
                placeholder="搜索标题..."
                className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部类别</option>
              {state.categories.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            共 <span className="font-medium text-gray-700">{deletedArticles.length}</span> 条已删除信息
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  标题
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  类别
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  状态
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-36">
                  删除时间
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  删除人
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-40">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedArticles.length > 0 ? (
                paginatedArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 font-medium line-clamp-1">
                        {article.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {article.department}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {article.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusTag status={article.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{article.deletedAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{article.deletedBy}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetail(article)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRestore(article.id)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="恢复"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(article.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="彻底删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                    回收站为空
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

      {showDetailModal && detailArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">信息详情</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setDetailArticle(null)
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {detailArticle.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
                <span>{detailArticle.categoryName}</span>
                <span>{detailArticle.department}</span>
                <span>提交人：{detailArticle.authorName}</span>
                <StatusTag status={detailArticle.status} />
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">删除信息</div>
                <div className="text-sm text-gray-700">
                  删除时间：{detailArticle.deletedAt} · 删除人：{detailArticle.deletedBy}
                </div>
              </div>
              <div
                className="prose max-w-none text-gray-700"
                style={{ lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: detailArticle.content }}
              />
              {detailArticle.rejectReason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-red-800">退回原因</div>
                      <div className="text-sm text-red-600 mt-1">
                        {detailArticle.rejectReason}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {detailArticle.attachmentName && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">附件</div>
                  <a
                    href={detailArticle.attachmentUrl}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {detailArticle.attachmentName}
                  </a>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => handleRestore(detailArticle.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                恢复
              </button>
              <button
                onClick={() => handlePermanentDelete(detailArticle.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                彻底删除
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
