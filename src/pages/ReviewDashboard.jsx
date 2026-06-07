import { useCallback, useMemo, useState } from 'react'
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
  BookTemplate,
  History,
  Hand,
  Unlock,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import RejectTemplateManager from '../components/RejectTemplateManager'
import { useApp } from '../context/useApp'
import { getReviewStageText, getReviewStageColor, isArticleClaimed, isArticleClaimedByUser } from '../utils/helpers'

export default function ReviewDashboard() {
  const { state, reviewArticle, isTwoLevelReview, claimArticle, releaseArticle } = useApp()
  const navigate = useNavigate()
  const currentUser = state.currentUser
  const userRole = currentUser?.role
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailArticle, setDetailArticle] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectArticleId, setRejectArticleId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)

  const canUserOperateArticle = useCallback((article) => {
    if (!currentUser || !article) return false
    if (!isArticlePendingForUser(article)) return false
    if (!isArticleClaimed(article)) return false
    return isArticleClaimedByUser(article, currentUser.id)
  }, [currentUser, isArticlePendingForUser])

  const canUserClaimArticle = useCallback((article) => {
    if (!currentUser || !article) return false
    if (!isArticlePendingForUser(article)) return false
    if (isArticleClaimed(article)) return false
    return true
  }, [currentUser, isArticlePendingForUser])

  const canUserReleaseArticle = useCallback((article, isForce = false) => {
    if (!currentUser || !article) return false
    if (!isArticlePendingForUser(article)) return false
    if (!isArticleClaimed(article)) return false
    if (isForce) {
      return userRole === 'senior_reviewer'
    }
    return isArticleClaimedByUser(article, currentUser.id)
  }, [currentUser, userRole, isArticlePendingForUser])

  const isArticlePendingForUser = useCallback((article) => {
    if (article.status !== 'pending' && article.status !== 'first_reviewed') return false
    if (userRole === 'reviewer') {
      return article.status === 'pending'
    }
    if (userRole === 'senior_reviewer') {
      return article.status === 'first_reviewed'
    }
    return false
  }, [userRole])

  const stats = useMemo(() => {
    const pending = state.articles.filter((a) => !a.deleted && isArticlePendingForUser(a)).length
    const published = state.articles.filter((a) => a.status === 'published' && !a.deleted).length
    const rejected = state.articles.filter((a) => a.status === 'rejected' && !a.deleted).length
    return { pending, published, rejected }
  }, [state.articles, isArticlePendingForUser])

  const categoryStats = useMemo(() => {
    const pendingArticles = state.articles.filter((a) => !a.deleted && isArticlePendingForUser(a))
    const stats = state.categories.map((cat) => {
      const count = pendingArticles.filter((a) => a.category === cat.code).length
      return { ...cat, count }
    })
    return stats
  }, [state.articles, state.categories, isArticlePendingForUser])

  const recentPending = useMemo(() => {
    return state.articles
      .filter((a) => !a.deleted && isArticlePendingForUser(a))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [state.articles, isArticlePendingForUser])

  const getApproveStatus = (article) => {
    const needTwoLevel = isTwoLevelReview(article.category)
    if (!needTwoLevel) {
      return 'published'
    }
    if (userRole === 'reviewer') {
      return 'first_reviewed'
    }
    if (userRole === 'senior_reviewer') {
      return 'published'
    }
    return 'published'
  }

  const getApproveText = (article) => {
    const needTwoLevel = isTwoLevelReview(article.category)
    if (!needTwoLevel) {
      return '审核通过'
    }
    if (userRole === 'reviewer') {
      return '初审通过'
    }
    if (userRole === 'senior_reviewer') {
      return '终审通过'
    }
    return '审核通过'
  }

  const getRejectText = (article) => {
    const needTwoLevel = isTwoLevelReview(article.category)
    if (!needTwoLevel) {
      return '审核退回'
    }
    if (userRole === 'reviewer') {
      return '初审退回'
    }
    if (userRole === 'senior_reviewer') {
      return '终审退回'
    }
    return '审核退回'
  }

  const handleViewDetail = (article) => {
    setDetailArticle(article)
    setShowDetailModal(true)
  }

  const handleClaim = (id) => {
    const result = claimArticle(id)
    if (result && !result.success) {
      alert(result.message)
    }
  }

  const handleRelease = (id, isForce = false) => {
    const confirmText = isForce
      ? '确定要强制释放该任务吗？'
      : '确定要释放该任务吗？释放后其他人可以认领。'
    if (window.confirm(confirmText)) {
      const result = releaseArticle(id, isForce)
      if (result && !result.success) {
        alert(result.message)
      }
    }
  }

  const handleApprove = (id) => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return
    const newStatus = getApproveStatus(article)
    if (window.confirm(`确定要${getApproveText(article)}这条信息吗？`)) {
      reviewArticle(id, newStatus)
      setShowDetailModal(false)
      setDetailArticle(null)
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
    setShowTemplatePanel(false)
    setShowDetailModal(false)
    setDetailArticle(null)
  }

  const goToReviewList = () => {
    navigate('/admin/review')
  }

  const statCards = [
    {
      label: userRole === 'senior_reviewer' ? '待复审' : '待审核',
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
                      {isArticleClaimed(article) && (
                        <p className="text-xs text-cyan-600 mt-1">
                          认领人：{article.claimantName} · {article.claimedAt}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusTag status={article.status} reviewStage={article.reviewStage} />
                      {canUserClaimArticle(article) && (
                        <button
                          className="p-1.5 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded transition-colors"
                          title="认领任务"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClaim(article.id)
                          }}
                        >
                          <Hand className="w-4 h-4" />
                        </button>
                      )}
                      {canUserReleaseArticle(article) && (
                        <button
                          className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                          title="释放任务"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRelease(article.id)
                          }}
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}
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
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b flex-wrap">
                <span>{detailArticle.categoryName}</span>
                <span>{detailArticle.department}</span>
                <span>提交人：{detailArticle.authorName}</span>
                <StatusTag status={detailArticle.status} reviewStage={detailArticle.reviewStage} />
                {isTwoLevelReview(detailArticle.category) && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    二级审核
                  </span>
                )}
                {isArticleClaimed(detailArticle) && (
                  <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                    {detailArticle.claimantName} 认领于 {detailArticle.claimedAt}
                  </span>
                )}
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
              {detailArticle.reviewHistory && detailArticle.reviewHistory.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-800">审核历史</span>
                  </div>
                  <div className="space-y-2">
                    {detailArticle.reviewHistory.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getReviewStageColor(item.stage)}`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {item.reviewerName}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              {getReviewStageText(item.stage)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              item.action === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {item.action === 'pass' ? '通过' : '退回'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.reviewTime}
                          </div>
                          {item.comment && (
                            <div className="text-sm text-gray-600 mt-2">
                              {item.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                {isArticlePendingForUser(detailArticle) && !isArticleClaimed(detailArticle) && (
                  <span className="text-xs text-gray-500">提示：请先认领任务后再进行审核操作</span>
                )}
                {isArticlePendingForUser(detailArticle) && isArticleClaimed(detailArticle) && !canUserOperateArticle(detailArticle) && (
                  <span className="text-xs text-amber-600">该任务已被 {detailArticle.claimantName} 认领</span>
                )}
              </div>
              <div className="flex justify-end gap-3">
                {canUserClaimArticle(detailArticle) && (
                  <button
                    onClick={() => {
                      handleClaim(detailArticle.id)
                      const updated = state.articles.find((a) => a.id === detailArticle.id)
                      if (updated) setDetailArticle(updated)
                    }}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <Hand className="w-4 h-4" />
                    认领任务
                  </button>
                )}
                {canUserReleaseArticle(detailArticle) && (
                  <button
                    onClick={() => {
                      handleRelease(detailArticle.id)
                      const updated = state.articles.find((a) => a.id === detailArticle.id)
                      if (updated) setDetailArticle(updated)
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    释放任务
                  </button>
                )}
                {canUserReleaseArticle(detailArticle, true) && !canUserReleaseArticle(detailArticle) && (
                  <button
                    onClick={() => {
                      handleRelease(detailArticle.id, true)
                      const updated = state.articles.find((a) => a.id === detailArticle.id)
                      if (updated) setDetailArticle(updated)
                    }}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    强制释放
                  </button>
                )}
                {canUserOperateArticle(detailArticle) && (
                  <>
                    <button
                      onClick={() => handleApprove(detailArticle.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {getApproveText(detailArticle)}
                    </button>
                    <button
                      onClick={() => {
                        handleReject(detailArticle.id)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {getRejectText(detailArticle)}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {(() => {
                  const article = state.articles.find((a) => a.id === rejectArticleId)
                  return article ? getRejectText(article) : '退回审核'
                })()}
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">请填写退回原因，以便编辑人员修改完善。</p>

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
    </AdminLayout>
  )
}
