import { useCallback, useMemo, useState } from 'react'
import { CheckCircle, XCircle, Eye, MessageSquare, BookTemplate, History, Clock, GitCompare, Hand, Unlock } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import Pagination from '../components/Pagination'
import RejectTemplateManager from '../components/RejectTemplateManager'
import VersionHistoryModal from '../components/VersionHistoryModal'
import { useApp } from '../context/useApp'
import { getReviewStageText, getReviewStageColor, isArticleClaimed, isArticleClaimedByUser } from '../utils/helpers'

const PAGE_SIZE = 10

export default function ReviewList() {
  const { state, reviewArticle, isTwoLevelReview, claimArticle, releaseArticle } = useApp()
  const currentUser = state.currentUser
  const [activeTab, setActiveTab] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectArticleId, setRejectArticleId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailArticle, setDetailArticle] = useState(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyArticle, setHistoryArticle] = useState(null)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [versionArticle, setVersionArticle] = useState(null)

  const userRole = currentUser?.role

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

  const filteredArticles = useMemo(() => {
    let result = state.articles.filter((a) => !a.deleted)

    if (activeTab === 'pending') {
      result = result.filter((a) => isArticlePendingForUser(a))
    } else {
      result = result.filter((a) => a.status === 'published' || a.status === 'rejected' || a.status === 'first_reviewed')
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
  }, [state.articles, activeTab, keyword, isArticlePendingForUser])

  const pendingCount = useMemo(() => {
    return state.articles.filter((a) => !a.deleted && isArticlePendingForUser(a)).length
  }, [state.articles, isArticlePendingForUser])

  const totalPages = Math.ceil(filteredArticles.length / PAGE_SIZE)
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

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

  const handleApprove = (id) => {
    const article = state.articles.find((a) => a.id === id)
    if (!article) return
    const newStatus = getApproveStatus(article)
    if (window.confirm(`确定要${getApproveText(article)}这条信息吗？`)) {
      const result = reviewArticle(id, newStatus)
      if (result && result.success === false) {
        alert(result.message)
      }
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
    const result = reviewArticle(rejectArticleId, 'rejected', rejectReason)
    if (result && result.success === false) {
      alert(result.message)
      return
    }
    setShowRejectModal(false)
    setRejectArticleId(null)
    setRejectReason('')
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

  const handleViewHistory = (article) => {
    setHistoryArticle(article)
    setShowHistoryModal(true)
  }

  const handleViewVersions = (article) => {
    setVersionArticle(article)
    setShowVersionModal(true)
  }

  const getPendingTabLabel = () => {
    if (userRole === 'senior_reviewer') {
      return '待复审'
    }
    return '待审核'
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
              {getPendingTabLabel()}
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                {pendingCount}
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
                {activeTab === 'pending' && (
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">
                    认领状态
                  </th>
                )}
                {activeTab === 'reviewed' && (
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">
                    审核时间
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-56">
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
                      <StatusTag status={article.status} reviewStage={article.reviewStage} />
                    </td>
                    {activeTab === 'pending' && (
                      <td className="px-4 py-3">
                        {isArticleClaimed(article) ? (
                          <div>
                            <div className="text-sm font-medium text-cyan-700">{article.claimantName}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{article.claimedAt}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">未认领</span>
                        )}
                      </td>
                    )}
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
                        <button
                          onClick={() => handleViewHistory(article)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="审核历史"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewVersions(article)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="版本历史"
                        >
                          <GitCompare className="w-4 h-4" />
                        </button>
                        {activeTab === 'pending' && canUserClaimArticle(article) && (
                          <button
                            onClick={() => handleClaim(article.id)}
                            className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                            title="认领任务"
                          >
                            <Hand className="w-4 h-4" />
                          </button>
                        )}
                        {activeTab === 'pending' && canUserReleaseArticle(article) && (
                          <button
                            onClick={() => handleRelease(article.id)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="释放任务"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                        {activeTab === 'pending' && canUserReleaseArticle(article, true) && !canUserReleaseArticle(article) && (
                          <button
                            onClick={() => handleRelease(article.id, true)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="强制释放"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                        {activeTab === 'pending' && canUserOperateArticle(article) && (
                          <>
                            <button
                              onClick={() => handleApprove(article.id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title={getApproveText(article)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(article.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title={getRejectText(article)}
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
                    colSpan={6}
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
              <h3 className="text-lg font-bold text-gray-900">
                {(() => {
                  const article = state.articles.find((a) => a.id === rejectArticleId)
                  return article ? getRejectText(article) : '退回审核'
                })()}
              </h3>
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
                      <div className="text-sm text-red-600 mt-1">
                        {detailArticle.rejectReason}
                      </div>
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
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  handleViewVersions(detailArticle)
                }}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                版本历史
              </button>
              <div className="flex gap-3">
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
                      onClick={() => {
                        setShowDetailModal(false)
                        handleApprove(detailArticle.id)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {getApproveText(detailArticle)}
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false)
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

      {showHistoryModal && historyArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">审核历史</h3>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false)
                  setHistoryArticle(null)
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
              <div className="mb-4 pb-4 border-b">
                <div className="text-sm font-medium text-gray-800">{historyArticle.title}</div>
                <div className="text-xs text-gray-500 mt-1">{historyArticle.categoryName}</div>
              </div>
              {historyArticle.reviewHistory && historyArticle.reviewHistory.length > 0 ? (
                <div className="space-y-3">
                  {historyArticle.reviewHistory.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getReviewStageColor(item.stage)}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
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
                          <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                            {item.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">暂无审核历史</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showVersionModal && versionArticle && (
        <VersionHistoryModal
          article={versionArticle}
          onClose={() => {
            setShowVersionModal(false)
            setVersionArticle(null)
          }}
          showRestore={false}
        />
      )}
    </AdminLayout>
  )
}
