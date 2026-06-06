import { Link } from 'react-router-dom'
import { Calendar, Building, FolderOpen, Paperclip } from 'lucide-react'
import { stripHtml, truncateText } from '../utils/helpers'

export default function ArticleCard({ article }) {
  const summary = truncateText(stripHtml(article.content), 80)

  return (
    <Link
      to={`/detail/${article.id}`}
      className="block bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200 hover-lift"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-primary-800 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{summary}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" />
              {article.categoryName}
            </span>
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              {article.department}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishDate}
            </span>
            {article.attachmentName && (
              <span className="flex items-center gap-1 text-primary-600">
                <Paperclip className="w-3.5 h-3.5" />
                附件
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
