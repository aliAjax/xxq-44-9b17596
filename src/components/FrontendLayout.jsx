import { Link } from 'react-router-dom'
import { Building2, User } from 'lucide-react'

export default function FrontendLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Building2 className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">政务公开信息发布系统</h1>
                <p className="text-xs text-primary-200">Government Information Disclosure System</p>
              </div>
            </Link>
            <Link
              to="/admin/login"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              <User className="w-4 h-4" />
              管理入口
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 fade-in">
        {children}
      </main>
      <footer className="bg-gray-100 border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© 2024 政务公开信息发布系统 版权所有</p>
          <p className="mt-1">主办单位：某某人民政府办公室</p>
        </div>
      </footer>
    </div>
  )
}
