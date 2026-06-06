import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Send, Eye } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import StatusTag from '../components/StatusTag'
import Pagination from '../components/Pagination'
import { useApp } from '../context/AppContext'

const PAGE_SIZE = 10

export default function ArticleList() {
  const { state, deleteArticle, updateArticle } = useApp()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')

  const filteredArticles = useMemo(() => {
    let result = [...state.articles]

    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter((a) => a.title.toLowerCase().includes(kw))
    }
    if (status) {
      result = result.filter((a) => a.status === status)
    }
    if (category) {
      result = result.filter((a) => a.category === category)
    }

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return result
  }, [state.articles, keyword, status, category])

  const totalPages = Math.ceil(filteredArticles.length / PAGE_SIZE)
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这条信息吗？')) {
      deleteArticle(id)
    }
  }

  const handleSubmitReview = (id) => {
    if (window.confirm('确定要提交审核吗？')) {
      updateArticle(id, { status: 'pending' })
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">信息管理</h2>
        <p className="text-gray-500 text-sm mt-1">管理您发布的政务公开信息</p>
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
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">全部状态</option>
              <option value="draft">草稿</option>
              <option value="pending">待审核</option>
              <option value="published">已发布</option>
              <option value="rejected">已退回</option>
            </select>
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
          <button
            onClick={() => navigate('/admin/articles/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            新增信息
          </button>
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
                      <span className="text-sm text-gray-500">{article.createdAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/detail/${article.id}`)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(article.status === 'draft' || article.status === 'rejected') && (
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
                        {article.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitReview(article.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="提交审核"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(article.id)}
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
                  <td colSpan="5" className="px-4 py-12 text-center text-gray-400">
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
    </AdminLayout>
  )
}
