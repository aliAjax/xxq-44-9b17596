import { useState, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Building, FolderOpen, Paperclip, Download, Clock } from 'lucide-react'
import FrontendLayout from '../components/FrontendLayout'
import VersionHistoryModal from '../components/VersionHistoryModal'
import { useApp } from '../context/useApp'
import { highlightHtmlContent, splitByKeyword } from '../utils/articleFilter'

export default function Detail() {
  const { id } = useParams()
  const { getArticleById } = useApp()
  const [searchParams] = useSearchParams()
  const highlightKeyword = searchParams.get('highlight') || ''
  const [showVersionModal, setShowVersionModal] = useState(false)
  const article = getArticleById(id)

  const titleSegments = useMemo(() => {
    if (!article || !highlightKeyword) return null
    return splitByKeyword(article.title, highlightKeyword)
  }, [article, highlightKeyword])

  const highlightedContent = useMemo(() => {
    if (!article || !highlightKeyword) return article?.content || ''
    return highlightHtmlContent(article.content, highlightKeyword)
  }, [article, highlightKeyword])

  if (!article || article.status !== 'published' || article.deleted) {
    return (
      <FrontendLayout>
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <p className="text-gray-500 text-lg">信息不存在或未发布</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-800"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Link>
        </div>
      </FrontendLayout>
    )
  }

  return (
    <FrontendLayout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
        <button
          onClick={() => setShowVersionModal(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <Clock className="w-4 h-4" />
          版本历史
        </button>
      </div>

      <article className="bg-white rounded-lg shadow-sm">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
            {titleSegments
              ? titleSegments.map((seg, idx) =>
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
                )
              : article.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4" />
              {article.categoryName}
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              {article.department}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {article.publishDate}
            </span>
          </div>
        </div>

        <div className="p-8">
          <div
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
            style={{
              lineHeight: '1.8',
              fontSize: '16px',
            }}
          />
        </div>

        {article.attachmentName && (
          <div className="px-8 pb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                附件下载
              </h3>
              <a
                href={article.attachmentUrl}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 hover:underline"
              >
                <Download className="w-4 h-4" />
                {article.attachmentName}
              </a>
            </div>
          </div>
        )}
      </article>

      {showVersionModal && (
        <VersionHistoryModal
          article={article}
          onClose={() => setShowVersionModal(false)}
        />
      )}
    </FrontendLayout>
  )
}
