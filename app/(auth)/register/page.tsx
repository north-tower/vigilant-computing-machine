'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/useAuth'
import SycharBoot from '@/components/layout/SycharBoot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { UserRole } from '@/types'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Full name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerAuth, isBooting, setBooting, redirectToDashboard } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.PRINCIPAL,
    }
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)
    try {
      await registerAuth(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0F12] flex items-center justify-center p-4">
      <div className="bg-[#151820] border border-[#1E2330] rounded-[12px] p-10 w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="font-display text-[32px] text-[#2DD4BF] leading-none mb-1">
            Sychar
          </h1>
          <div className="font-body font-medium text-[13px] text-[#64748B] tracking-[0.15em] uppercase">
            CoPilot
          </div>
          <div className="font-body text-[12px] text-[#334155] mt-2">
            Create Staff Account
          </div>
        </div>

        <div className="h-[1px] bg-[#1E2330] my-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-text-muted">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...register('full_name')}
              className="bg-[#0D0F12] border-[#1E2330] text-[#F1F5F9] focus:border-[#2DD4BF] focus-visible:ring-0"
            />
            {errors.full_name && (
              <p className="text-[#EF4444] text-xs">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-muted">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="staff@sychar.ac.ke"
              {...register('email')}
              className="bg-[#0D0F12] border-[#1E2330] text-[#F1F5F9] focus:border-[#2DD4BF] focus-visible:ring-0"
            />
            {errors.email && (
              <p className="text-[#EF4444] text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" title="Password" className="text-text-muted">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className="bg-[#0D0F12] border-[#1E2330] text-[#F1F5F9] focus:border-[#2DD4BF] focus-visible:ring-0"
            />
            {errors.password && (
              <p className="text-[#EF4444] text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-text-muted">Role</Label>
            <select
              id="role"
              {...register('role')}
              className="w-full h-8 bg-[#0D0F12] border border-[#1E2330] text-[#F1F5F9] rounded-lg px-2.5 text-sm focus:border-[#2DD4BF] outline-none"
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-[#EF4444] text-xs">{errors.role.message}</p>
            )}
          </div>

          {error && (
            <p className="text-[#EF4444] text-xs mt-2">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2DD4BF] hover:bg-[#26B8A5] text-[#0D0F12] font-medium h-11 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </Button>

          <p className="text-center text-[12px] text-[#64748B] mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2DD4BF] hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>

      {isBooting && (
        <SycharBoot onComplete={() => {
          setBooting(false)
          redirectToDashboard()
        }} />
      )}
    </div>
  )
}
