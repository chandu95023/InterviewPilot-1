import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <p className="text-xs text-slate-500 font-medium">Authenticating...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  return children
}

export default ProtectedRoute
