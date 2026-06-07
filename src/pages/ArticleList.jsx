import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Send,
  Eye,
  Upload,
  Clock,
  X,
  Building,
  Calendar,
  Paperclip,
  User,
  XCircle,
  SlidersHorizontal,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import Pagination from '../components/Pagination'
import AdvancedFilterForm from '../components/AdvancedFilterForm'
import VersionHistoryModal from '../components/VersionHistoryModal'
import { useApp } from '../context/useApp'
import {
  getValidationRules,
  validateArticle,
} from '../utils/helpers'
import {
  filterArticles,
  paginateArticles,
  getActiveFilterCount,
  resetFilters,
  splitByKeyword,
} from '../utils/articleFilter'

const PAGE_SIZE = 10

export default function ArticleList() {
  const { state, deleteArticle, updateArticle, restoreArticle } = useApp()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    startDate: '',
    endDate: '',
    hasAttachment: '',
    status: '',
    deleted: 'no',
  })

  const [showVersionModal, setShowVersionModal] = useState(false)
  const [versionArticle, setVersionArticle] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailArticle, setDetailArticle] = useState(null)
  const [showSubmitErrorModal, setShowSubmitErrorModal] = useState(false)
  const [submitErrorArticle, setSubmitErrorArticle] = useState(null)
  const [submitErrors, setSubmitErrors] = useState([])

  const activeFilterCount = useMemo(
    () => getActiveFilterCount({ ...filters, keyword: searchKeyword }, true),
    [filters, searchKeyword]
  )

  const filteredArticles = useMemo(() => {
    const allFilters = {
      ...filters,
      keyword: searchKeyword,
    }
    return filterArticles(state.articles, allFilters, {
      isAdmin: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }, [state.articles, filters, searchKeyword])

  const pagination = useMemo(() => {
    return paginateArticles(filteredArticles, currentPage, PAGE_SIZE)
  }, [filteredArticles, currentPage])

  const handleSearch = () => {
    setSearchKeyword(keyword)
    setCurrentPage(1)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setKeyword('')
    setSearchKeyword('')
    setFilters({
      ...resetFilters(true),
      deleted: 'no',
    })
    setCurrentPage(1)
  }

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这条信息吗？')) {
      deleteArticle(id)
    }
  }

  const handleRestore = (id) => {
    if (window.confirm('确定要恢复这条信息吗？')) {
      restoreArticle(id)
    }
  }

  const handleSubmitReview = (article) => {
    const config = state.reviewFlowConfigs.find(
      (c) => c.categoryCode === article.category
    )
    const rules = getValidationRules(config)

    const result = validateArticle(
      {
        title: article.title,
        category: article.category,
        department: article.department,
        content: article.content,
        publishDate: article.publishDate,
        attachmentName: article.attachmentName,
        attachmentUrl: article.attachmentUrl,
      },
      rules,
      state.articles,
      article.id
    )

    if (!result.isValid) {
      setSubmitErrorArticle(article)
      setSubmitErrors(result.errors)
      setShowSubmitErrorModal(true)
      return
    }

    if (window.confirm('确定要提交审核吗？')) {
      updateArticle(article.id, { status: 'pending' })
    }
  }

  const handleViewVersions = (article) => {
    setVersionArticle(article)
    setShowVersionModal(true)
  }

  const handleViewDetail = (article) => {
    setDetailArticle(article)
    setShowDetailModal(true)
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">信息管理</h2>
        <p className="text-gray-500 text-sm mt-1">管理您发布的政务公开信息</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="搜索标题或正文..."
                  className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium"
              >
                搜索
              </button>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
                  showFilter || activeFilterCount > 0
                    ? 'border-primary-500 text-primary-700 bg-primary-50'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                高级筛选
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/admin/batch-import')}
                className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                批量导入
              </button>
              <button
                onClick={() => navigate('/admin/articles/new')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                新增信息
              </button>
            </div>
          </div>

          {showFilter && (
            <AdvancedFilterForm
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={state.categories}
              departments={state.departments}
              isAdmin={true}
              showStatusFilter={true}
              showDeletedFilter={true}
              onReset={handleReset}
              onClose={() => setShowFilter(false)}
            />
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            共 <span className="font-medium text-primary-700">{pagination.total}</span> 条
            {searchKeyword && (
              <span className="text-gray-400 ml-2">
                关键词：<span className="text-gray-700">{searchKeyword}</span>
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              清除全部筛选
            </button>
          )}
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">
                  创建时间
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-40">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {pagination.items.length > 0 ? (
                pagination.items.map((article) => (
                  <tr
                    key={article.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      article.deleted ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 font-medium line-clamp-1">
                        {searchKeyword
                          ? splitByKeyword(article.title, searchKeyword).map((seg, idx) =>
                              seg.isMatch ? (
                                <mark
                                  key={idx}
                                  className="bg-yellow-200 text-yellow-900 px-0.5 rounded"
                                >
                                  {seg.text}
                                </mark>
                              ) : (
                                <span key={idx}>{seg.text}</span>
                              )
                            )
                          : article.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        <span>{article.department}</span>
                        {article.attachmentName && (
                          <span className="flex items-center gap-0.5 text-primary-500">
                            <Paperclip className="w-3 h-3" />
                            附件
                          </span>
                        )}
                        {article.deleted && (
                          <span className="text-red-500">（已删除）</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {article.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusTag
                        status={article.status}
                        reviewStage={article.reviewStage}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {article.createdAt}
                      </span>
                    </td>
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
                          onClick={() => handleViewVersions(article)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="版本历史"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        {(article.status === 'draft' ||
                          article.status === 'rejected') &&
                          !article.deleted && (
                            <button
                              onClick={() =>
                                navigate(`/admin/articles/${article.id}/edit`)
                              }
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        {article.status === 'draft' && !article.deleted && (
                          <button
                            onClick={() => handleSubmitReview(article)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="提交审核"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {!article.deleted ? (
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(article.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="恢复"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>暂无数据</p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={handleReset}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                      >
                        重置筛选条件
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {showDetailModal && detailArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-gray-900">信息详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {searchKeyword
                    ? splitByKeyword(detailArticle.title, searchKeyword).map((seg, idx) =>
                        seg.isMatch ? (
                          <mark
                            key={idx}
                            className="bg-yellow-200 text-yellow-900 px-0.5 rounded"
                          >
                            {seg.text}
                          </mark>
                        ) : (
                          <span key={idx}>{seg.text}</span>
                        )
                      )
                    : detailArticle.title}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusTag
                    status={detailArticle.status}
                    reviewStage={detailArticle.reviewStage}
                  />
                  <span className="text-xs text-gray-500">
                    {detailArticle.categoryName}
                  </span>
                  {detailArticle.deleted && (
                    <span className="text-xs text-red-500 font-medium">
                      已删除
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">科室</div>
                    <div className="text-sm text-gray-700">
                      {detailArticle.department}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">发布日期</div>
                    <div className="text-sm text-gray-700">
                      {detailArticle.publishDate || '（未设置）'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">创建人</div>
                    <div className="text-sm text-gray-700">
                      {detailArticle.authorName || '（未知）'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">更新时间</div>
                    <div className="text-sm text-gray-700">
                      {detailArticle.updatedAt || detailArticle.createdAt}
                    </div>
                  </div>
                </div>
              </div>

              {detailArticle.attachmentName && (
                <div className="flex items-start gap-2">
                  <Paperclip className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">附件</div>
                    <div className="text-sm text-primary-600">
                      {detailArticle.attachmentName}
                    </div>
                  </div>
                </div>
              )}

              {detailArticle.rejectReason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="text-xs text-red-600 font-medium mb-1">
                    退回原因
                  </div>
                  <div className="text-sm text-red-700">
                    {detailArticle.rejectReason}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-gray-500 mb-2">正文内容</div>
                <div
                  className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 prose prose-sm max-w-none max-h-64 overflow-auto"
                  style={{ lineHeight: '1.8' }}
                  dangerouslySetInnerHTML={{ __html: detailArticle.content }}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  handleViewVersions(detailArticle)
                }}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                版本历史
              </button>
              <div className="flex gap-2">
                {(detailArticle.status === 'draft' ||
                  detailArticle.status === 'rejected') &&
                  !detailArticle.deleted && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false)
                        navigate(
                          `/admin/articles/${detailArticle.id}/edit`
                        )
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑
                    </button>
                  )}
                {detailArticle.status === 'draft' &&
                  !detailArticle.deleted && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false)
                        handleSubmitReview(detailArticle)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      提交审核
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubmitErrorModal && submitErrorArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">无法提交审核</h3>
              <button
                onClick={() => {
                  setShowSubmitErrorModal(false)
                  setSubmitErrorArticle(null)
                  setSubmitErrors([])
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    「{submitErrorArticle.title}」
                  </p>
                  <p className="text-sm text-gray-500">
                    该文章不符合分类校验规则，请修正后再提交
                  </p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 mb-2">错误列表：</p>
                <ul className="space-y-1">
                  {submitErrors.map((err, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-red-700 flex items-start gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowSubmitErrorModal(false)
                  setSubmitErrorArticle(null)
                  setSubmitErrors([])
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                我知道了
              </button>
              <button
                onClick={() => {
                  setShowSubmitErrorModal(false)
                  setSubmitErrorArticle(null)
                  setSubmitErrors([])
                  navigate(`/admin/articles/${submitErrorArticle.id}/edit`)
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                去编辑
              </button>
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
        />
      )}
    </AdminLayout>
  )
}
