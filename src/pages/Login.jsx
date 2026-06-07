import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Building2, User, Lock, Shield, Crown } from 'lucide-react'
import { useApp } from '../context/useApp'

export default function Login() {
  const { state, login } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('editor')
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || null

  const matchesRoute = (path, route) => {
    return path === route || path?.startsWith(`${route}/`)
  }

  const getDefaultRedirect = (userRole) => {
    if (userRole === 'editor') return '/admin/articles'
    if (userRole === 'senior_reviewer') return '/admin/dashboard'
    return '/admin/dashboard'
  }

  const isEditorRoute = (path) => {
    return (
      matchesRoute(path, '/admin/articles') ||
      matchesRoute(path, '/admin/batch-import') ||
      matchesRoute(path, '/admin/recycle') ||
      matchesRoute(path, '/admin/department-stats') ||
      matchesRoute(path, '/admin/calendar') ||
      matchesRoute(path, '/admin/operation-logs')
    )
  }

  const isReviewerRoute = (path) => {
    return (
      matchesRoute(path, '/admin/dashboard') ||
      matchesRoute(path, '/admin/review') ||
      matchesRoute(path, '/admin/operation-logs')
    )
  }

  const isSeniorReviewerRoute = (path) => {
    return (
      matchesRoute(path, '/admin/dashboard') ||
      matchesRoute(path, '/admin/review') ||
      matchesRoute(path, '/admin/review-flow') ||
      matchesRoute(path, '/admin/operation-logs')
    )
  }

  if (state.currentUser) {
    let redirectPath = getDefaultRedirect(state.currentUser.role)
    if (from) {
      let roleMatch = false
      if (state.currentUser.role === 'editor') {
        roleMatch = isEditorRoute(from)
      } else if (state.currentUser.role === 'reviewer') {
        roleMatch = isReviewerRoute(from)
      } else if (state.currentUser.role === 'senior_reviewer') {
        roleMatch = isSeniorReviewerRoute(from)
      }
      if (roleMatch) {
        redirectPath = from
      }
    }
    return <Navigate to={redirectPath} replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    const result = login(username, password, role)
    if (result.success) {
      let redirectPath = getDefaultRedirect(result.user.role)
      if (from) {
        const roleMatch =
          (result.user.role === 'editor' && isEditorRoute(from)) ||
          (result.user.role === 'reviewer' && isReviewerRoute(from)) ||
          (result.user.role === 'senior_reviewer' && isSeniorReviewerRoute(from))
        if (roleMatch) {
          redirectPath = from
        }
      }
      navigate(redirectPath, { replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">政务公开后台管理系统</h1>
          <p className="text-primary-200 text-sm">请登录以继续管理工作</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户角色
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('editor')}
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border transition-all ${
                    role === 'editor'
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs">工作人员</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('reviewer')}
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border transition-all ${
                    role === 'reviewer'
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-xs">初审人员</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('senior_reviewer')}
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border transition-all ${
                    role === 'senior_reviewer'
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  <span className="text-xs">复核人员</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary-800 hover:bg-primary-900 text-white font-medium rounded-lg transition-colors"
            >
              登 录
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>测试账号：editor / 123456（工作人员）</p>
            <p>测试账号：reviewer / 123456（初审人员）</p>
            <p>测试账号：senior / 123456（复核人员）</p>
          </div>
        </div>

        <p className="text-center text-primary-300 text-xs mt-6">
          © 2024 政务公开信息发布系统
        </p>
      </div>
    </div>
  )
}
