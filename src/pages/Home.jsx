import { useState, useMemo } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import FrontendLayout from '../components/FrontendLayout'
import ArticleCard from '../components/ArticleCard'
import Pagination from '../components/Pagination'
import { useApp } from '../context/useApp'

const PAGE_SIZE = 10

export default function Home() {
  const { state } = useApp()
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilter, setShowFilter] = useState(false)

  const articles = useMemo(() => {
    let result = state.articles.filter((a) => a.status === 'published' && !a.deleted)

    if (category) {
      result = result.filter((a) => a.category === category)
    }
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(kw) ||
          a.content.toLowerCase().includes(kw)
      )
    }
    if (startDate) {
      result = result.filter((a) => a.publishDate >= startDate)
    }
    if (endDate) {
      result = result.filter((a) => a.publishDate <= endDate)
    }

    result.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    return result
  }, [state.articles, category, searchKeyword, startDate, endDate])

  const handleSearch = () => {
    setSearchKeyword(keyword)
    setCurrentPage(1)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const totalPages = Math.ceil(articles.length / PAGE_SIZE)
  const paginatedArticles = articles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleReset = () => {
    setCategory('')
    setStartDate('')
    setEndDate('')
    setKeyword('')
    setSearchKeyword('')
  }

  return (
    <FrontendLayout>
      <div className="mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入关键词搜索..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium"
            >
              搜索
            </button>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              高级筛选
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {showFilter && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">公开类别</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">全部类别</option>
                  {state.categories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              公开信息列表
              <span className="ml-2 text-sm text-gray-400 font-normal">
                共 {articles.length} 条
              </span>
            </h2>
            {(category || searchKeyword || startDate || endDate) && (
              <button
                onClick={handleReset}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                重置筛选
              </button>
            )}
          </div>

          {paginatedArticles.length > 0 ? (
            <div className="space-y-3">
              {paginatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center text-gray-400 shadow-sm">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无符合条件的公开信息</p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        <aside className="w-64 shrink-0">
          <div className="bg-white rounded-lg p-4 shadow-sm sticky top-4">
            <h3 className="font-medium text-gray-800 mb-3 pb-2 border-b">信息分类</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => {
                    setCategory('')
                    setShowFilter(false)
                    setCurrentPage(1)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !category
                      ? 'bg-primary-50 text-primary-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  全部类别
                </button>
              </li>
              {state.categories.map((cat) => (
                <li key={cat.code}>
                  <button
                    onClick={() => {
                      setCategory(cat.code)
                      setShowFilter(false)
                      setCurrentPage(1)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat.code
                        ? 'bg-primary-50 text-primary-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </FrontendLayout>
  )
}
