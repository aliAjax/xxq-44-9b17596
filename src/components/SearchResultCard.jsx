import { Link } from 'react-router-dom'
import { Calendar, Building, FolderOpen, Paperclip, Search } from 'lucide-react'
import { splitByKeyword, hasAttachment } from '../utils/articleFilter'
import { stripHtml, truncateText } from '../utils/helpers'

function HighlightText({ text, keyword, className }) {
  const segments = splitByKeyword(text, keyword)
  return (
    <span className={className}>
      {segments.map((seg, idx) =>
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
      )}
    </span>
  )
}

function HighlightSnippet({ html, keyword, maxLength = 150 }) {
  if (!keyword) {
    return <span className="text-gray-500 text-sm mb-3 line-clamp-2">{truncateText(stripHtml(html), maxLength)}</span>
  }

  const text = stripHtml(html)
  const lowerText = text.toLowerCase()
  const lowerKw = keyword.toLowerCase()
  const index = lowerText.indexOf(lowerKw)

  if (index === -1) {
    return <span className="text-gray-500 text-sm mb-3 line-clamp-2">{truncateText(text, maxLength)}</span>
  }

  const kwLength = keyword.length
  const halfLength = Math.floor((maxLength - kwLength) / 2)
  let start = Math.max(0, index - halfLength)
  let end = Math.min(text.length, index + kwLength + halfLength)

  if (start === 0) {
    end = Math.min(text.length, maxLength)
  } else if (end === text.length) {
    start = Math.max(0, text.length - maxLength)
  }

  let snippetText = text.slice(start, end)
  if (start > 0) snippetText = '...' + snippetText
  if (end < text.length) snippetText = snippetText + '...'

  const segments = splitByKeyword(snippetText, keyword)

  return (
    <span className="text-gray-500 text-sm mb-3 line-clamp-2">
      {segments.map((seg, idx) =>
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
      )}
    </span>
  )
}

export default function SearchResultCard({ article, keyword = '' }) {
  return (
    <Link
      to={`/detail/${article.id}${keyword ? `?highlight=${encodeURIComponent(keyword)}` : ''}`}
      className="block bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <HighlightText
            text={article.title}
            keyword={keyword}
            className="text-lg font-medium text-gray-900 mb-2 hover:text-primary-800 transition-colors line-clamp-2 block"
          />
          <HighlightSnippet
            html={article.content}
            keyword={keyword}
            maxLength={150}
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
