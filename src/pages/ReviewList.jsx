import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, Eye, MessageSquare, BookTemplate } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import Pagination from '../components/Pagination'
import RejectTemplateManager from '../components/RejectTemplateManager'
import { useApp } from '../context/useApp'

const PAGE_SIZE = 10

export default function ReviewList() {
  const { state, reviewArticle } = useApp()
  const [activeTab, setActiveTab] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectArticleId, setRejectArticleId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailArticle, setDetailArticle] = useState(null)

  const filteredArticles = useMemo(() => {
    let result = state.articles.filter((a) => !a.deleted)

    if (activeTab === 'pending') {
      result = result.filter((a) => a.status === 'pending')
    } else {
      result = result.filter((a) => a.status === 'published' || a.status === 'rejected')
    }

    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter((a) => a.title.toLowerCase().includes(kw))
    }

    result.sort((a, b) => {
      if (activeTab === 'pending') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      return new Date(b.reviewedAt) - new Date(a.reviewedAt)
    })

    return result
  }, [state.articles, activeTab, keyword])

  const totalPages = Math.ceil(filteredArticles.length / PAGE_SIZE)
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleApprove = (id) => {
    if (window.confirm('确定要审核通过这条信息吗？')) {
      reviewArticle(id, 'published')
    }
  }

  const handleReject = (id) => {
    setRejectArticleId(id)
    setRejectReason('')
    setShowTemplatePanel(false)
    setShowRejectModal(true)
  }

  const handleSelectTemplate = (template) => {
    setRejectReason(template.content)
    setShowTemplatePanel(false)
  }

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('请填写退回原因')
      return
    }
    reviewArticle(rejectArticleId, 'rejected', rejectReason)
    setShowRejectModal(false)
    setRejectArticleId(null)
    setRejectReason('')
  }

  const handleViewDetail = (article) => {
    setDetailArticle(article)
    setShowDetailModal(true)
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">审核管理</h2>
        <p className="text-gray-500 text-sm mt-1">审核待发布的政务公开信息</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab('pending')
                setCurrentPage(1)
              }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              待审核
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                {state.articles.filter((a) => a.status === 'pending' && !a.deleted).length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('reviewed')
                setCurrentPage(1)
              }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reviewed'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              已审核
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative w-64">
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="搜索标题..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  标题
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  类别
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  提交人
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  状态
                </th>
                {activeTab === 'reviewed' && (
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">
                    审核时间
                  </th>
                )}
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
                      <span className="text-sm text-gray-600">
                        {article.authorName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusTag status={article.status} />
                    </td>
                    {activeTab === 'reviewed' && (
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {article.reviewedAt}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetail(article)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(article.id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="通过"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(article.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="退回"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={activeTab === 'reviewed' ? 6 : 5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    暂无数据
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

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">退回审核</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              请填写退回原因，以便编辑人员修改完善。
            </p>

            <div className="mb-3">
              <button
                onClick={() => setShowTemplatePanel(!showTemplatePanel)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
              >
                <BookTemplate className="w-4 h-4" />
                {showTemplatePanel ? '收起模板' : '使用模板'}
              </button>
            </div>

            {showTemplatePanel && (
              <div className="mb-4">
                <RejectTemplateManager
                  onSelectTemplate={handleSelectTemplate}
                  onClose={() => setShowTemplatePanel(false)}
                />
              </div>
            )}

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入退回原因..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectArticleId(null)
                  setShowTemplatePanel(false)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                确认退回
              </button>
            </div>
          </div>
        </div>
      )}

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
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {detailArticle.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
                <span>{detailArticle.categoryName}</span>
                <span>{detailArticle.department}</span>
                <span>提交人：{detailArticle.authorName}</span>
                <StatusTag status={detailArticle.status} />
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
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              {activeTab === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setDetailArticle(null)
                      handleApprove(detailArticle.id)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    审核通过
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      handleReject(detailArticle.id)
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    审核退回
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
