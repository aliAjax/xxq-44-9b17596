import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import FrontendLayout from '../components/FrontendLayout'
import SearchResultCard from '../components/SearchResultCard'
import AdvancedFilterForm from '../components/AdvancedFilterForm'
import Pagination from '../components/Pagination'
import { useApp } from '../context/useApp'
import { filterArticles, paginateArticles, getActiveFilterCount, resetFilters } from '../utils/articleFilter'

const PAGE_SIZE = 10

export default function AdvancedSearch() {
  const { state } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '')
  const [showFilter, setShowFilter] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    department: searchParams.get('department') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    hasAttachment: searchParams.get('hasAttachment') || '',
  })

  const activeFilterCount = useMemo(
    () => getActiveFilterCount({ ...filters, keyword: searchKeyword }, false),
    [filters, searchKeyword]
  )

  const filteredArticles = useMemo(() => {
    const allFilters = {
      ...filters,
      keyword: searchKeyword,
    }
    return filterArticles(state.articles, allFilters, {
      isAdmin: false,
      sortBy: 'publishDate',
      sortOrder: 'desc',
    })
  }, [state.articles, filters, searchKeyword])

  const pagination = useMemo(() => {
    return paginateArticles(filteredArticles, currentPage, PAGE_SIZE)
  }, [filteredArticles, currentPage])

  useEffect(() => {
    const params = {}
    if (searchKeyword) params.q = searchKeyword
    if (filters.category) params.category = filters.category
    if (filters.department) params.department = filters.department
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.hasAttachment) params.hasAttachment = filters.hasAttachment
    setSearchParams(params, { replace: true })
  }, [searchKeyword, filters, setSearchParams])

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
    setFilters(resetFilters(false))
    setCurrentPage(1)
  }

  const handleClearKeyword = () => {
    setKeyword('')
    setSearchKeyword('')
    setCurrentPage(1)
  }

  return (
    <FrontendLayout>
      <div className="mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-4">高级检索</h1>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入关键词，支持标题和正文检索..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              {keyword && (
                <button
                  onClick={handleClearKeyword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium"
            >
              搜索
            </button>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                showFilter || activeFilterCount > 0
                  ? 'border-primary-500 text-primary-700 bg-primary-50'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              筛选条件
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilter && (
            <AdvancedFilterForm
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={state.categories}
              departments={state.departments}
              isAdmin={false}
              onReset={handleReset}
              onClose={() => setShowFilter(false)}
            />
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {searchKeyword || activeFilterCount > 0 ? (
            <span>
              找到 <span className="font-medium text-primary-700">{pagination.total}</span> 条结果
              {searchKeyword && (
                <span className="text-gray-400 ml-2">
                  关键词：<span className="text-gray-700">{searchKeyword}</span>
                </span>
              )}
            </span>
          ) : (
            <span>共 {pagination.total} 条公开信息</span>
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

      {pagination.items.length > 0 ? (
        <div className="space-y-3">
          {pagination.items.map((article) => (
            <SearchResultCard
              key={article.id}
              article={article}
              keyword={searchKeyword}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 text-center text-gray-400 shadow-sm">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg mb-2">暂无符合条件的公开信息</p>
          <p className="text-sm">
            请尝试调整关键词或筛选条件
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
            >
              重置筛选条件
            </button>
          )}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </FrontendLayout>
  )
}
