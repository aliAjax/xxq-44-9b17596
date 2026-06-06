import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Building, FolderOpen, Paperclip, Download } from 'lucide-react'
import FrontendLayout from '../components/FrontendLayout'
import { useApp } from '../context/useApp'

export default function Detail() {
  const { id } = useParams()
  const { getArticleById } = useApp()
  const article = getArticleById(id)

  if (!article || article.status !== 'published') {
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
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-sm">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
            {article.title}
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
            dangerouslySetInnerHTML={{ __html: article.content }}
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
    </FrontendLayout>
  )
}
