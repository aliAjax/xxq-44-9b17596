import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Building2,
  Eye,
  Clock,
  AlertTriangle,
  FileDown,
  ChevronRight,
  X,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import Pagination from '../components/Pagination'
import { useApp } from '../context/useApp'
import {
  getActiveDepartments,
  getActiveCategories,
  calculateDepartmentStats,
  calculateOverallStats,
  formatDurationHours,
  exportStatsToCsv,
} from '../utils/helpers'

const PAGE_SIZE = 10

export default function DepartmentStats() {
  const { state } = useApp()
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    department: '',
    status: '',
    startDate: '',
    endDate: '',
  })

  const [showFilter, setShowFilter] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [articlePage, setArticlePage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const activeCategories = useMemo(() => getActiveCategories(state.categories), [state.categories])
  const activeDepartments = useMemo(() => getActiveDepartments(state.departments), [state.departments])

  const departmentStats = useMemo(() => {
    return calculateDepartmentStats(state.articles, state.departments, {
      category: filters.category,
      department: filters.department,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate,
    })
  }, [state.articles, state.departments, filters.category, filters.department, filters.status, filters.startDate, filters.endDate])

  const filteredDepartments = useMemo(() => {
    let result = departmentStats
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase()
      result = result.filter((dept) => dept.name.toLowerCase().includes(kw))
    }
    return result
  }, [departmentStats, filters.keyword])

  const overallStats = useMemo(() => {
    return calculateOverallStats(departmentStats)
  }, [departmentStats])

  const totalPages = Math.ceil(filteredDepartments.length / PAGE_SIZE)
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const selectedDeptArticles = useMemo(() => {
    if (!selectedDepartment) return []
    let articles = state.articles.filter(
      (a) => !a.deleted && (a.departmentId === selectedDepartment || (!a.departmentId && a.department === selectedDepartment))
    )

    if (filters.category) {
      articles = articles.filter((a) => a.category === filters.category)
    }
    if (filters.status) {
      articles = articles.filter((a) => a.status === filters.status)
    }
    if (filters.startDate || filters.endDate) {
      articles = articles.filter((a) => {
        const dateStr = a.publishDate || a.updatedAt || a.createdAt
        if (!dateStr) return false
        if (filters.startDate && dateStr < filters.startDate) return false
        if (filters.endDate && dateStr > filters.endDate) return false
        return true
      })
    }

    return articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [state.articles, selectedDepartment, filters.category, filters.status, filters.startDate, filters.endDate])

  const totalArticlePages = Math.ceil(selectedDeptArticles.length / PAGE_SIZE)
  const paginatedArticles = selectedDeptArticles.slice(
    (articlePage - 1) * PAGE_SIZE,
    articlePage * PAGE_SIZE
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.category) count++
    if (filters.department) count++
    if (filters.status) count++
    if (filters.startDate) count++
    if (filters.endDate) count++
    return count
  }, [filters])

  const handleDepartmentClick = (deptId) => {
    if (selectedDepartment === deptId) {
      setSelectedDepartment(null)
    } else {
      setSelectedDepartment(deptId)
      setArticlePage(1)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
    setSelectedDepartment(null)
  }

  const handleReset = () => {
    setFilters({
      keyword: '',
      category: '',
      department: '',
      status: '',
      startDate: '',
      endDate: '',
    })
    setCurrentPage(1)
    setSelectedDepartment(null)
  }

  const handleExport = () => {
    const categoryName = activeCategories.find((c) => c.code === filters.category)?.name || ''
    const departmentName = state.departments.find(
      (d) => d.id === filters.department || d.name === filters.department
    )?.name || ''

    exportStatsToCsv(departmentStats, overallStats, {
      ...filters,
      categoryName,
      departmentName,
    })
  }

  const goToArticleList = (status = '', deptId = '') => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (deptId) {
      const dept = state.departments.find((d) => d.id === deptId)
      if (dept) params.set('department', dept.name)
    }
    if (filters.category) params.set('category', filters.category)
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)
    navigate(`/admin/articles?${params.toString()}`)
  }

  const statCards = [
    {
      label: '活跃科室',
      value: overallStats.activeDepartmentCount,
      subLabel: `共${state.departments.length}个`,
      icon: Building2,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
      clickable: false,
    },
    {
      label: '已发布',
      value: overallStats.publishedCount,
      subLabel: '条信息',
      icon: Eye,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      clickable: true,
      status: 'published',
    },
    {
      label: '待审核',
      value: overallStats.pendingCount,
      subLabel: '条信息',
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600',
      clickable: true,
      status: 'pending',
    },
    {
      label: '已退回',
      value: overallStats.rejectedCount,
      subLabel: '条信息',
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      clickable: true,
      status: 'rejected',
    },
    {
      label: '退回率',
      value: (overallStats.rejectRate * 100).toFixed(1) + '%',
      subLabel: '退回/提交',
      icon: AlertTriangle,
      color: 'amber',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
      clickable: false,
    },
    {
      label: '平均审核耗时',
      value: formatDurationHours(overallStats.avgReviewHours),
      subLabel: '平均时长',
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-600',
      clickable: false,
    },
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">科室公开统计</h2>
        <p className="text-gray-500 text-sm mt-1">查看各科室的公开信息统计数据，支持多维度筛选与钻取分析</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`bg-white rounded-lg shadow-sm p-4 ${
                card.clickable ? 'cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5' : ''
              }`}
              onClick={() => card.clickable && goToArticleList(card.status)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className={`text-xl font-bold ${card.valueColor} truncate`}>{card.value}</div>
                  <div className="text-xs text-gray-500 truncate">{card.label}</div>
                  <div className="text-xs text-gray-400 truncate">{card.subLabel}</div>
                </div>
              </div>
              {card.clickable && (
                <div className="mt-2 text-xs text-primary-600 flex items-center gap-0.5">
                  查看详情
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {(overallStats.avgFirstReviewHours > 0 || overallStats.avgFinalReviewHours > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {formatDurationHours(overallStats.avgFirstReviewHours)}
                </div>
                <div className="text-xs text-gray-500">平均初审耗时</div>
                <div className="text-xs text-gray-400">二级审核文章初审平均时长</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {formatDurationHours(overallStats.avgFinalReviewHours)}
                </div>
                <div className="text-xs text-gray-500">平均终审耗时</div>
                <div className="text-xs text-gray-400">二级审核文章终审平均时长</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => {
                    handleFilterChange('keyword', e.target.value)
                  }}
                  placeholder="搜索科室名称..."
                  className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
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
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重置筛选
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                导出CSV
              </button>
            </div>
          </div>

          {showFilter && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">公开类别</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">全部类别</option>
                    {activeCategories.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">发布科室</label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">全部科室</option>
                    {activeDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">状态</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">全部状态</option>
                    <option value="draft">草稿</option>
                    <option value="pending">待审核</option>
                    <option value="first_reviewed">待复审</option>
                    <option value="published">已发布</option>
                    <option value="rejected">已退回</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">开始日期</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">结束日期</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                >
                  重置
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            共 <span className="font-medium text-primary-700">{filteredDepartments.length}</span> 个科室
            {activeFilterCount > 0 && (
              <span className="text-gray-400 ml-2">（已筛选）</span>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-10"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  科室名称
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-20">
                  已发布
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-20">
                  待审核
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-20">
                  已退回
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-20">
                  总数
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  退回率
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  平均审核耗时
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  平均初审耗时
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  平均终审耗时
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                  最近更新
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedDepartments.length > 0 ? (
                paginatedDepartments.map((dept) => (
                  <>
                    <tr
                      key={dept.id}
                      onClick={() => handleDepartmentClick(dept.id)}
                      className={`border-b border-gray-50 cursor-pointer transition-colors ${
                        selectedDepartment === dept.id
                          ? 'bg-primary-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        {selectedDepartment === dept.id ? (
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 ${dept.status === 'inactive' ? 'text-gray-300' : 'text-gray-400'}`} />
                          <span
                            className={`text-sm font-medium ${
                              dept.status === 'inactive'
                                ? 'text-gray-400 line-through'
                                : 'text-gray-900'
                            }`}
                          >
                            {dept.name}
                            {dept.status === 'inactive' && (
                              <span className="ml-2 text-xs text-gray-400 not-italic">（已停用）</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="text-sm font-medium text-green-600 cursor-pointer hover:text-green-800 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            goToArticleList('published', dept.id)
                          }}
                        >
                          {dept.publishedCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="text-sm font-medium text-orange-600 cursor-pointer hover:text-orange-800 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            goToArticleList('pending', dept.id)
                          }}
                        >
                          {dept.pendingCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="text-sm font-medium text-red-600 cursor-pointer hover:text-red-800 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            goToArticleList('rejected', dept.id)
                          }}
                        >
                          {dept.rejectedCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {dept.totalCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-medium ${
                          dept.rejectRate >= 0.3 ? 'text-red-600' : dept.rejectRate >= 0.1 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {(dept.rejectRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">
                          {formatDurationHours(dept.avgReviewHours)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-blue-600">
                          {dept.twoLevelReviewedCount > 0 ? formatDurationHours(dept.avgFirstReviewHours) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-purple-600">
                          {dept.twoLevelReviewedCount > 0 ? formatDurationHours(dept.avgFinalReviewHours) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {dept.lastUpdated || '-'}
                        </span>
                      </td>
                    </tr>
                    {selectedDepartment === dept.id && (
                      <tr>
                        <td colSpan="11" className="bg-gray-50 px-4 py-4">
                          <div className="bg-white rounded-lg border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700">
                                {dept.name} - 文章列表
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  goToArticleList('', dept.id)
                                }}
                                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                              >
                                在信息管理中查看
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                                      标题
                                    </th>
                                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase w-24">
                                      类别
                                    </th>
                                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase w-24">
                                      状态
                                    </th>
                                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase w-32">
                                      更新时间
                                    </th>
                                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase w-20">
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
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <td className="px-4 py-2">
                                          <div className="text-sm text-gray-900 line-clamp-1">
                                            {article.title}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2">
                                          <span className="text-sm text-gray-600">
                                            {article.categoryName}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2">
                                          <StatusTag status={article.status} reviewStage={article.reviewStage} />
                                        </td>
                                        <td className="px-4 py-2">
                                          <span className="text-sm text-gray-500">
                                            {article.updatedAt}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2">
                                          <button
                                            onClick={() => navigate(`/detail/${article.id}`)}
                                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                            title="查看"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="5"
                                        className="px-4 py-8 text-center text-gray-400 text-sm"
                                      >
                                        暂无文章
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                            {totalArticlePages > 1 && (
                              <div className="p-3 border-t border-gray-100">
                                <Pagination
                                  currentPage={articlePage}
                                  totalPages={totalArticlePages}
                                  onPageChange={setArticlePage}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="px-4 py-12 text-center text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>暂无匹配的科室</p>
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
    </AdminLayout>
  )
}
