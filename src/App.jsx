import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Detail from './pages/Detail'
import CatalogList from './pages/CatalogList'
import CatalogDetail from './pages/CatalogDetail'
import Login from './pages/Login'
import ArticleList from './pages/ArticleList'
import ArticleEdit from './pages/ArticleEdit'
import ReviewList from './pages/ReviewList'
import ReviewDashboard from './pages/ReviewDashboard'
import RecycleBin from './pages/RecycleBin'
import DepartmentStats from './pages/DepartmentStats'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detail/:id" element={<Detail />} />
      <Route path="/catalog" element={<CatalogList />} />
      <Route path="/catalog/:category" element={<CatalogDetail />} />
      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin/articles"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <ArticleList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/articles/new"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <ArticleEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/articles/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <ArticleEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/recycle"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <RecycleBin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/department-stats"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <DepartmentStats />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['reviewer']}>
            <ReviewDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/review"
        element={
          <ProtectedRoute allowedRoles={['reviewer']}>
            <ReviewList />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
