import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  Calendar,
  Building,
  FolderOpen,
  FileText,
} from 'lucide-react'
import FrontendLayout from '../components/FrontendLayout'
import { useApp } from '../context/useApp'
import { groupByMonth } from '../utils/helpers'

export default function CatalogDetail() {
  const { category } = useParams()
  const { state } = useApp()

  const currentCategory = useMemo(() => {
    return state.categories.find((cat) => cat.code === category)
  }, [state.categories, category])

  const monthGroups = useMemo(() => {
    const filtered = state.articles.filter((a) => a.category === category)
    return groupByMonth(filtered)
  }, [state.articles, category])

  const totalCount = useMemo(() => {
    return monthGroups.reduce((sum, group) => sum + group.articles.length, 0)
  }, [monthGroups])

  if (!currentCategory) {
    return (
      <FrontendLayout>
        <div className="bg-white rounded-lg p-12 text-center text-gray-400 shadow-sm">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>分类不存在</p>
          <Link
            to="/catalog"
            className="inline-block mt-4 text-primary-600 hover:text-primary-800 text-sm"
          >
            返回公开目录
          </Link>
        </div>
      </FrontendLayout>
    )
  }

  return (
    <FrontendLayout>
      <div className="mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回目录首页
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {currentCategory.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                共收录 <span className="text-primary-600 font-medium">{totalCount}</span> 条公开信息，
                按发布月份整理如下
              </p>
            </div>
          </div>
        </div>
      </div>

      {monthGroups.length > 0 ? (
        <div className="space-y-6">
          {monthGroups.map((group) => (
            <div key={group.label} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <h2 className="font-medium text-gray-800">{group.label}</h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    {group.articles.length} 条
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-gray-50">
                {group.articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`/detail/${article.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-700 hover:text-primary-600 transition-colors truncate">
                          {article.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0 ml-4">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {article.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {article.publishDate}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 text-center text-gray-400 shadow-sm">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>该分类下暂无公开信息</p>
        </div>
      )}
    </FrontendLayout>
  )
}
