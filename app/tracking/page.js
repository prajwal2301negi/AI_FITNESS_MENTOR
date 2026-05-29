'use client'
import { useState } from 'react'
import { trackingAPI } from '@/lib/api'
import { useFetch, useMutation } from '@/hooks/useApi'
import { getToday, formatDate } from '@/lib/utils'
import { Trophy, Flame, TrendingUp, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showLogForm, setShowLogForm] = useState(false)

  const { data: dashboard, loading, refetch } = useFetch(trackingAPI.getDashboard)
  const { data: weekly } = useFetch(trackingAPI.getWeeklyReport)
  const { data: achievements } = useFetch(trackingAPI.getAchievements)
  const { data: streak } = useFetch(trackingAPI.getStreak)
  const { data: range } = useFetch(
    () => trackingAPI.getProgressRange({ startDate: new Date(Date.now() - 30 * 24 * 3600000).toISOString().split('T')[0], endDate: getToday() }),
    []
  )

  if (loading) return <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>

  const weightData = range?.map(r => ({ date: r.date, weight: r.body?.weightKg })).filter(r => r.weight) || []
  const calorieData = range?.map(r => ({ date: r.date, calories: r.nutrition?.caloriesConsumed })).filter(r => r.calories) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Progress</h1>
        <button onClick={() => setShowLogForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
          Log Today
        </button>
      </div>

      {/* Streak Banner */}
      <div className="border rounded-lg p-4 bg-card flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
          <Flame className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <p className="text-2xl font-bold">{streak?.currentStreak || 0} day streak 🔥</p>
          <p className="text-sm text-muted-foreground">Keep it up! Consistency is key.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {['overview', 'charts', 'weekly', 'achievements'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="font-semibold">Last 30 Days</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Workouts', value: dashboard?.last30Days?.totalWorkouts || 0, unit: 'sessions' },
              { label: 'Avg Calories', value: Math.round(dashboard?.last30Days?.avgCalories || 0), unit: 'kcal/day' },
              { label: 'Avg Sleep', value: (dashboard?.last30Days?.avgSleep || 0).toFixed(1), unit: 'hrs' },
              { label: 'Avg Mood', value: (dashboard?.last30Days?.avgMood || 0).toFixed(1), unit: '/10' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="border rounded-lg p-3 bg-card">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value} <span className="text-sm font-normal text-muted-foreground">{unit}</span></p>
              </div>
            ))}
          </div>

          {/* Weight Trend */}
          {dashboard?.weightTrend?.length > 0 && (
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-medium mb-3">Weight Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={dashboard.weightTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight_kg" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <div className="space-y-4">
          {weightData.length > 0 && (
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-medium mb-3">Weight (30 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {calorieData.length > 0 && (
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-medium mb-3">Calories Consumed (30 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={calorieData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!weightData.length && !calorieData.length && (
            <div className="text-center text-muted-foreground py-8">
              Log progress daily to see charts
            </div>
          )}
        </div>
      )}

      {/* Weekly Tab */}
      {activeTab === 'weekly' && weekly && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Workouts', value: weekly.totals?.workoutsCompleted || 0 },
              { label: 'Calories Consumed', value: Math.round(weekly.totals?.caloriesConsumed || 0) },
              { label: 'Calories Burned', value: Math.round(weekly.totals?.caloriesBurned || 0) },
              { label: 'Active Minutes', value: weekly.totals?.activeMinutes || 0 },
              { label: 'Steps', value: weekly.totals?.steps || 0 },
              { label: 'Avg Mood', value: weekly.totals?.avgMood || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="border rounded-lg p-3 bg-card">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {weekly.days?.map((day) => (
              <div key={day.date} className="border rounded-lg p-3 bg-card flex items-center justify-between text-sm">
                <span className="font-medium">{formatDate(day.date)}</span>
                <div className="flex gap-4 text-muted-foreground text-xs">
                  <span>{day.workout?.completed ? '✅' : '❌'} Workout</span>
                  <span>{day.nutrition?.caloriesConsumed || 0} kcal</span>
                  <span>😊 {day.lifestyle?.moodScore || '-'}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          {!achievements?.length && (
            <div className="text-center text-muted-foreground py-8">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Complete workouts to earn achievements!</p>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            {achievements?.map((a) => (
              <div key={a.id} className="border rounded-lg p-4 bg-card flex items-center gap-3">
                <span className="text-3xl">{a.icon}</span>
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(a.earned_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Progress Modal */}
      {showLogForm && (
        <LogProgressModal
          onClose={() => setShowLogForm(false)}
          onSuccess={() => { setShowLogForm(false); refetch() }}
        />
      )}
    </div>
  )
}

function LogProgressModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    weightKg: '', steps: '', sleepHours: '', moodScore: 7,
    energyLevel: 7, activeMinutes: '', notes: ''
  })

  const { mutate: log, loading } = useMutation(
    () => trackingAPI.logProgress({
      date: getToday(),
      body: form.weightKg ? { weightKg: Number(form.weightKg) } : undefined,
      lifestyle: {
        steps: Number(form.steps) || undefined,
        sleepHours: Number(form.sleepHours) || undefined,
        moodScore: form.moodScore,
        energyLevel: form.energyLevel,
        activeMinutes: Number(form.activeMinutes) || undefined,
      },
      notes: form.notes || undefined,
    }),
    { successMessage: 'Progress logged!', onSuccess }
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Log Today&apos;s Progress</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'weightKg', label: 'Weight (kg)', type: 'number', placeholder: '70.5' },
              { key: 'steps', label: 'Steps', type: 'number', placeholder: '8000' },
              { key: 'sleepHours', label: 'Sleep (hrs)', type: 'number', placeholder: '7.5' },
              { key: 'activeMinutes', label: 'Active Minutes', type: 'number', placeholder: '45' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ key: 'moodScore', label: 'Mood (1-10)' }, { key: 'energyLevel', label: 'Energy (1-10)' }].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium">{label}: {form[key]}</label>
                <input type="range" min="1" max="10" value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                  className="w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="How are you feeling today?" rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none" />
          </div>
          <button onClick={log} disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
      </div>
    </div>
  )
}
