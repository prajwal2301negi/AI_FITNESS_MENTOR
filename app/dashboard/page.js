'use client'
import { useEffect, useState } from 'react'
import { trackingAPI, aiAPI } from '@/lib/api'
import { useFetch } from '@/hooks/useApi'
import useAuthStore from '@/store/authStore'
import { formatDate, getToday } from '@/lib/utils'
import { Flame, Dumbbell, Utensils, TrendingUp, Trophy, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: dashboard, loading } = useFetch(trackingAPI.getDashboard)
  const { data: streak } = useFetch(trackingAPI.getStreak)
  const { data: motivation, loading: motivLoading } = useFetch(
    () => aiAPI.getMotivation({ streak: streak?.currentStreak || 0, goal: user?.fitness_goal || 'general fitness' }),
    [streak],
    { skip: !streak }
  )

  if (loading) return <PageLoader />

  const today = dashboard?.today
  const stats = dashboard?.last30Days || {}

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Good morning, {user?.first_name}! 👋</h1>
        <p className="text-muted-foreground text-sm">{formatDate(new Date())}</p>
      </div>

      {/* Streak + Motivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-card space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold">Current Streak</span>
          </div>
          <p className="text-3xl font-bold">{streak?.currentStreak || 0} <span className="text-base font-normal text-muted-foreground">days</span></p>
        </div>

        <div className="border rounded-lg p-4 bg-card space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">Daily Motivation</span>
          </div>
          <p className="text-sm text-muted-foreground italic">
            {motivLoading ? 'Loading...' : motivation?.motivation || 'Stay consistent and keep pushing!'}
          </p>
        </div>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="font-semibold mb-3">Today&apos;s Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Utensils className="h-4 w-4 text-green-500" />} label="Calories" value={today?.nutrition?.caloriesConsumed || 0} unit="kcal" />
          <StatCard icon={<Dumbbell className="h-4 w-4 text-blue-500" />} label="Workout" value={today?.workout?.completed ? '✅ Done' : '❌ Pending'} />
          <StatCard icon={<TrendingUp className="h-4 w-4 text-purple-500" />} label="Steps" value={today?.lifestyle?.steps || 0} />
          <StatCard icon={<Flame className="h-4 w-4 text-red-500" />} label="Burned" value={today?.workout?.caloriesBurned || 0} unit="kcal" />
        </div>
      </div>

      {/* 30-Day Stats */}
      <div>
        <h2 className="font-semibold mb-3">Last 30 Days</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Workouts" value={stats.totalWorkouts || 0} unit="sessions" />
          <StatCard label="Calories Burned" value={Math.round(stats.totalCalsBurned || 0)} unit="kcal" />
          <StatCard label="Active Minutes" value={Math.round(stats.totalActiveMin || 0)} unit="min" />
          <StatCard label="Avg Mood" value={(stats.avgMood || 0).toFixed(1)} unit="/ 10" />
        </div>
      </div>

      {/* Weight Trend Chart */}
      {dashboard?.weightTrend?.length > 0 && (
        <div className="border rounded-lg p-4 bg-card">
          <h2 className="font-semibold mb-4">Weight Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dashboard.weightTrend}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="weight_kg" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Achievements */}
      {dashboard?.recentAchievements?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Recent Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {dashboard.recentAchievements.map((a) => (
              <div key={a.id} className="border rounded-lg px-3 py-2 bg-card flex items-center gap-2 text-sm">
                <span className="text-xl">{a.icon}</span>
                <span className="font-medium">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, unit }) {
  return (
    <div className="border rounded-lg p-3 bg-card space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xl font-bold">
        {value} {unit && <span className="text-sm font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg" />)}
      </div>
    </div>
  )
}
