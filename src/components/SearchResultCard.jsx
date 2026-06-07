import { Link } from 'react-router-dom'
import { Calendar, Building, FolderOpen, Paperclip, Search } from 'lucide-react'
import { getHighlightedSnippet, highlightText, hasAttachment } from '../utils/articleFilter'

export default function SearchResultCard({ article, keyword = '' }) {
  const highlightedTitle = keyword ? highlightText(article.title, keyword) : article.title
  const highlightedSnippet = getHighlightedSnippet(article.content, keyword, 150)

  return (
    <Link
      to={`/detail/${article.id}${keyword ? `?highlight=${encodeURIComponent(keyword)}` : ''}`}
      className="block bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-medium text-gray-900 mb-2 hover:text-primary-800 transition-colors line-clamp-2"
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />
          <p
            className="text-gray-500 text-sm mb-3 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
          />
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
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
            {hasAttachment(article) && (
              <span className="flex items-center gap-1 text-primary-600">
                <Paperclip className="w-3.5 h-3.5" />
                附件
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <Search className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </Link>
  )
}
