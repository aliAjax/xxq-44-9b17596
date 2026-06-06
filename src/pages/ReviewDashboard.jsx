import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  CheckCircle,
  XCircle,
  PieChart,
  ListTodo,
  Eye,
  ChevronRight,
  FileText,
  MessageSquare,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import { useApp } from '../context/useApp'

export default function ReviewDashboard() {
  const { state, reviewArticle } = useApp()
  const navigate = useNavigate()
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailArticle, setDetailArticle] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectArticleId, setRejectArticleId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const stats = useMemo(() => {
    const pending = state.articles.filter((a) => a.status === 'pending' && !a.deleted).length
    const published = state.articles.filter((a) => a.status === 'published' && !a.deleted).length
    const rejected = state.articles.filter((a) => a.status === 'rejected' && !a.deleted).length
    return { pending, published, rejected }
  }, [state.articles])

  const categoryStats = useMemo(() => {
    const pendingArticles = state.articles.filter((a) => a.status === 'pending' && !a.deleted)
    const stats = state.categories.map((cat) => {
      const count = pendingArticles.filter((a) => a.category === cat.code).length
      return { ...cat, count }
    })
    return stats
  }, [state.articles, state.categories])

  const recentPending = useMemo(() => {
    return state.articles
      .filter((a) => a.status === 'pending' && !a.deleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [state.articles])

  const handleViewDetail = (article) => {
    setDetailArticle(article)
    setShowDetailModal(true)
  }

  const handleApprove = (id) => {
    if (window.confirm('确定要审核通过这条信息吗？')) {
      reviewArticle(id, 'published')
      setShowDetailModal(false)
      setDetailArticle(null)
    }
  }

  const handleReject = (id) => {
    setRejectArticleId(id)
    setRejectReason('')
    setShowRejectModal(true)
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
    setShowDetailModal(false)
    setDetailArticle(null)
  }

  const goToReviewList = () => {
    navigate('/admin/review')
  }

  const statCards = [
    {
      label: '待审核',
      value: stats.pending,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600',
    },
    {
      label: '已通过',
      value: stats.published,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
    },
    {
      label: '已退回',
      value: stats.rejected,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
    },
  ]

  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">审核工作台</h2>
        <p className="text-gray-500 text-sm mt-1">欢迎回来，快速了解审核工作概况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${card.valueColor}`}>{card.value}</p>
                  <p className="text-gray-400 text-xs mt-1">条信息</p>
                </div>
                <div className={`w-14 h-14 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-800">待办分类分布</h3>
            </div>
            <span className="text-xs text-gray-400">共 {stats.pending} 条待办</span>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {categoryStats.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{cat.name}</span>
                    <span className="text-sm font-medium text-gray-600">{cat.count} 条</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-800">最近待审核</h3>
            </div>
            <button
              onClick={goToReviewList}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPending.length > 0 ? (
              recentPending.map((article) => (
                <div
                  key={article.id}
                  className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetail(article)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {article.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{article.categoryName}</span>
                        <span>{article.department}</span>
                        <span>提交人：{article.authorName}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        提交时间：{article.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusTag status={article.status} />
                      <button
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="查看详情"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetail(article)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">暂无待审核信息</p>
              </div>
            )}
          </div>
        </div>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">{detailArticle.title}</h2>
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
                      <div className="text-sm text-red-600 mt-1">{detailArticle.rejectReason}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              {detailArticle.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(detailArticle.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    审核通过
                  </button>
                  <button
                    onClick={() => {
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

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">退回审核</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">请填写退回原因，以便编辑人员修改完善。</p>
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
    </AdminLayout>
  )
}
