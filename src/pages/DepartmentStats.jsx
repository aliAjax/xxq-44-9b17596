import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import Pagination from '../components/Pagination'
import { useApp } from '../context/useApp'

const PAGE_SIZE = 10

export default function DepartmentStats() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [articlePage, setArticlePage] = useState(1)

  const departmentStats = useMemo(() => {
    const stats = []

    state.departments.forEach((dept) => {
      const deptArticles = state.articles.filter(
        (a) => a.department === dept.name && !a.deleted
      )

      const publishedCount = deptArticles.filter((a) => a.status === 'published').length
      const pendingCount = deptArticles.filter((a) => a.status === 'pending').length
      const rejectedCount = deptArticles.filter((a) => a.status === 'rejected').length

      const lastUpdated = deptArticles.reduce((latest, article) => {
        if (!latest) return article.updatedAt
        return new Date(article.updatedAt) > new Date(latest) ? article.updatedAt : latest
      }, '')

      stats.push({
        ...dept,
        totalCount: deptArticles.length,
        publishedCount,
        pendingCount,
        rejectedCount,
        lastUpdated,
      })
    })

    return stats
  }, [state.articles, state.departments])

  const filteredDepartments = useMemo(() => {
    if (!keyword) return departmentStats
    const kw = keyword.toLowerCase()
    return departmentStats.filter((dept) => dept.name.toLowerCase().includes(kw))
  }, [departmentStats, keyword])

  const selectedDeptArticles = useMemo(() => {
    if (!selectedDepartment) return []
    return state.articles
      .filter((a) => a.department === selectedDepartment && !a.deleted)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [state.articles, selectedDepartment])

  const totalArticlePages = Math.ceil(selectedDeptArticles.length / PAGE_SIZE)
  const paginatedArticles = selectedDeptArticles.slice(
    (articlePage - 1) * PAGE_SIZE,
    articlePage * PAGE_SIZE
  )

  const handleDepartmentClick = (deptName) => {
    if (selectedDepartment === deptName) {
      setSelectedDepartment(null)
    } else {
      setSelectedDepartment(deptName)
      setArticlePage(1)
    }
  }

  const totalPublished = departmentStats.reduce((sum, d) => sum + d.publishedCount, 0)
  const totalPending = departmentStats.reduce((sum, d) => sum + d.pendingCount, 0)
  const totalRejected = departmentStats.reduce((sum, d) => sum + d.rejectedCount, 0)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">科室公开统计</h2>
        <p className="text-gray-500 text-sm mt-1">查看各科室的公开信息统计数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{state.departments.length}</div>
              <div className="text-sm text-gray-500">科室总数</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{totalPublished}</div>
              <div className="text-sm text-gray-500">已发布</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-lg font-bold text-orange-600">待</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{totalPending}</div>
              <div className="text-sm text-gray-500">待审核</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <span className="text-lg font-bold text-red-600">退</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{totalRejected}</div>
              <div className="text-sm text-gray-500">已退回</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setSelectedDepartment(null)
              }}
              placeholder="搜索科室名称..."
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-10"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  科室名称
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  已发布
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  待审核
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  已退回
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                  总数
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-36">
                  最近更新
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <>
                    <tr
                      key={dept.id}
                      onClick={() => handleDepartmentClick(dept.name)}
                      className={`border-b border-gray-50 cursor-pointer transition-colors ${
                        selectedDepartment === dept.name
                          ? 'bg-primary-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        {selectedDepartment === dept.name ? (
                          <ChevronUp className="w-4 h-4 text-primary-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {dept.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-green-600">
                          {dept.publishedCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-orange-600">
                          {dept.pendingCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-red-600">
                          {dept.rejectedCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {dept.totalCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {dept.lastUpdated || '-'}
                        </span>
                      </td>
                    </tr>
                    {selectedDepartment === dept.name && (
                      <tr>
                        <td colSpan="7" className="bg-gray-50 px-4 py-4">
                          <div className="bg-white rounded-lg border border-gray-200">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                              <h4 className="text-sm font-medium text-gray-700">
                                {dept.name} - 文章列表
                              </h4>
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
                                          <StatusTag status={article.status} />
                                        </td>
                                        <td className="px-4 py-2">
                                          <span className="text-sm text-gray-500">
                                            {article.updatedAt}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              navigate(`/detail/${article.id}`)
                                            }}
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
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                    暂无匹配的科室
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
