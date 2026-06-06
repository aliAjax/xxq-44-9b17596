import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, ChevronRight, BookOpen, FileText } from 'lucide-react'
import FrontendLayout from '../components/FrontendLayout'
import { useApp } from '../context/useApp'
import { countByCategory, getPublishedArticles } from '../utils/helpers'

export default function CatalogList() {
  const { state } = useApp()

  const categoryStats = useMemo(() => {
    return countByCategory(state.articles, state.categories)
  }, [state.articles, state.categories])

  const totalCount = useMemo(() => {
    return getPublishedArticles(state.articles).length
  }, [state.articles])

  return (
    <FrontendLayout>
      <div className="mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary-700" />
            <h1 className="text-2xl font-bold text-gray-800">公开目录</h1>
          </div>
          <p className="text-gray-500 text-sm">
            按公开类别分类浏览已发布的政务信息，共收录 <span className="text-primary-600 font-medium">{totalCount}</span> 条公开信息
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((cat) => (
          <Link
            key={cat.code}
            to={`/catalog/${cat.code}`}
            className="group bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <FolderOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 group-hover:text-primary-700 transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {cat.count} 条信息
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </FrontendLayout>
  )
}
