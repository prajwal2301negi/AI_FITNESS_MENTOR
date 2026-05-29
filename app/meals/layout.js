'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useAuthStore from '@/store/authStore'
import useAppStore from '@/store/appStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Utensils, Dumbbell, Bot,
  TrendingUp, User, LogOut, Menu, X, Flame
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/meals',      label: 'Nutrition',   icon: Utensils },
  { href: '/workouts',   label: 'Workouts',    icon: Dumbbell },
  { href: '/ai',         label: 'AI Mentor',   icon: Bot },
  { href: '/tracking',   label: 'Progress',    icon: TrendingUp },
  { href: '/profile',    label: 'Profile',     icon: User },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, fetchMe, logout, user } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useAppStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/auth/login'); return }
    if (!isAuthenticated) fetchMe()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex bg-background">

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b h-16">
          <Flame className="h-6 w-6 text-primary shrink-0" />
          {sidebarOpen && <span className="font-bold text-lg">FitMentor</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-2 border-t space-y-1">
          {sidebarOpen && user && (
            <div className="px-3 py-2 text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={cn('flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'ml-60' : 'ml-16')}>

        {/* Top bar */}
        <header className="h-16 border-b bg-card flex items-center px-4 gap-4 sticky top-0 z-40">
          <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-accent">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1" />
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <span className="hidden md:block font-medium">{user.first_name} {user.last_name}</span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useAppStore()
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={cn(
            'px-4 py-3 rounded-lg shadow-lg text-sm font-medium cursor-pointer max-w-sm',
            toast.type === 'success' && 'bg-green-500 text-white',
            toast.type === 'error' && 'bg-destructive text-white',
            toast.type === 'info' && 'bg-primary text-primary-foreground',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
