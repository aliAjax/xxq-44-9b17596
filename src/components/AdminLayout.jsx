import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, CheckSquare, LogOut, User, Building2 } from 'lucide-react'
import { useApp } from '../context/useApp'

export default function AdminLayout({ children }) {
  const { state, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = state.currentUser

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const menuItems = [
    {
      path: '/admin/articles',
      label: '信息管理',
      icon: FileText,
      roles: ['editor'],
    },
    {
      path: '/admin/review',
      label: '审核管理',
      icon: CheckSquare,
      roles: ['reviewer'],
    },
  ]

  const visibleMenuItems = menuItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : false
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary-800 text-white shadow-lg">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-7 h-7" />
              <div>
                <h1 className="text-lg font-bold">政务公开后台管理系统</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{currentUser?.name}</span>
                <span className="text-primary-300">
                  ({currentUser?.role === 'editor' ? '工作人员' : '审核人员'})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-56 min-h-screen bg-white border-r shadow-sm">
          <nav className="py-4">
            <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase">功能菜单</div>
            {visibleMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 my-1 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="mt-6 pt-4 border-t">
              <Link
                to="/"
                target="_blank"
                className="flex items-center gap-3 px-4 py-2.5 mx-2 my-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>前台首页</span>
              </Link>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6 fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
