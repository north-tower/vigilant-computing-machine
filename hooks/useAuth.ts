import { useAuthStore } from '@/lib/auth' 
import { useRouter } from 'next/navigation' 
import { UserRole } from '@/types' 

const ROLE_ROUTES: Record<UserRole, string> = { 
  [UserRole.PRINCIPAL]: '/principal', 
  [UserRole.DEPUTY_PRINCIPAL]: '/deputy', 
  [UserRole.HOD]: '/hod', 
  [UserRole.CLASS_TEACHER]: '/teacher', 
  [UserRole.ACCOUNTANT]: '/accountant', 
  [UserRole.PARENT]: '/parent', 
  [UserRole.NURSE]: '/students', 
} 

export function useAuth() { 
  const { user, token, login, register, logout, isBooting, setBooting } = useAuthStore() 
  const router = useRouter() 

  const isAuthenticated = !!token && !! user 

  const redirectToDashboard = () => { 
    if (!user) return 
    router.push(ROLE_ROUTES[user.role]) 
  } 

  return { 
    user, 
    token, 
    isAuthenticated, 
    isBooting, 
    setBooting, 
    login, 
    register, 
    logout, 
    redirectToDashboard, 
    roleRoute: user ? ROLE_ROUTES[user.role] : null, 
  } 
}
