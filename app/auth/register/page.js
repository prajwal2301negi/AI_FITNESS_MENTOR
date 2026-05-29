'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useAuthStore from '@/store/authStore'

const schema = z.object({
  firstName: z.string().min(2, 'Min 2 characters'),
  lastName: z.string().min(2, 'Min 2 characters'),
  username: z.string().min(3, 'Min 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
})

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    clearError()
    const result = await registerUser(data)
    if (result.success) router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">💪 FitMentor AI</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        <div className="border rounded-lg p-6 space-y-4 bg-card">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">First Name</label>
                <input
                  {...register('firstName')}
                  placeholder="John"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  {...register('lastName')}
                  placeholder="Doe"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Username</label>
              <input
                {...register('username')}
                placeholder="johndoe"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
