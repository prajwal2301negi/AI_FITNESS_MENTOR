"use client";
import { useState } from "react";
import { useFetch, useMutation } from "@/hooks/useApi";
import { capitalize, formatDate } from "@/lib/utils";
import {
  Plus,
  Play,
  CheckCircle,
  Clock,
  Flame,
  X,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { workoutAPI, aiAPI } from '@/lib/api'
import useAppStore from '@/store/appStore'

const WORKOUT_TYPES = [
  "strength",
  "cardio",
  "hiit",
  "yoga",
  "pilates",
  "crossfit",
  "swimming",
  "cycling",
  "running",
  "custom",
];
const LOCATIONS = ["gym", "home", "outdoor", "pool", "studio"];

export default function WorkoutsPage() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("history");

  const {
    data: sessionsData,
    loading,
    refetch,
  } = useFetch(() => workoutAPI.getSessions({ limit: 20 }), []);
  const { data: stats } = useFetch(workoutAPI.getStats);

  const sessions = sessionsData?.data || sessionsData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">💪 Workouts</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> New Workout
        </button>
      </div>

      {/* Stats */}
      {stats?.last30Days && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Workouts"
            value={stats.last30Days.totalWorkouts || 0}
            unit="sessions"
          />
          <StatCard
            label="Total Time"
            value={Math.round((stats.last30Days.totalDurationMin || 0) / 60)}
            unit="hrs"
          />
          <StatCard
            label="Calories Burned"
            value={Math.round(stats.last30Days.totalCaloriesBurned || 0)}
            unit="kcal"
          />
          <StatCard
            label="Avg Duration"
            value={Math.round(stats.last30Days.avgDuration || 0)}
            unit="min"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        {["history", "plans"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {loading && (
            <p className="text-muted-foreground text-sm">Loading...</p>
          )}
          {!loading && !sessions.length && (
            <div className="border rounded-lg p-8 text-center text-muted-foreground bg-card">
              <p>No workouts logged yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-primary text-sm hover:underline"
              >
                Start your first workout
              </button>
            </div>
          )}
          {sessions.map?.((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onDelete={refetch}
              onClick={() => router.push(`/workouts/${session._id}`)}
            />
          ))}
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && <PlansTab />}

      {/* Create Workout Modal */}
      {showCreateForm && (
        <CreateWorkoutModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={(session) => {
            setShowCreateForm(false);
            refetch();
            router.push(`/workouts/${session._id}`);
          }}
        />
      )}
    </div>
  );
}

// function SessionCard({ session, onClick }) {
//   const statusColors = {
//     completed: 'text-green-500',
//     in_progress: 'text-blue-500',
//     planned: 'text-muted-foreground',
//     skipped: 'text-red-500',
//   }
function SessionCard({ session, onClick, onDelete }) {
  const { mutate: deleteSession } = useMutation(
    () => workoutAPI.deleteSession(session._id),
    { successMessage: "Workout deleted", onSuccess: onDelete },
  );

  const statusColors = {
    completed: "text-green-500",
    in_progress: "text-blue-500",
    planned: "text-muted-foreground",
    skipped: "text-red-500",
  };

  return (
    <div className="border rounded-lg p-4 bg-card hover:bg-accent cursor-pointer transition-colors">
      <div className="flex items-center justify-between" onClick={onClick}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{session.title}</span>
            <span
              className={`text-xs capitalize ${statusColors[session.status]}`}
            >
              • {session.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="capitalize">{session.workoutType}</span>
            {session.durationMin && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {session.durationMin} min
              </span>
            )}
            {session.caloriesBurned && (
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3" />
                {session.caloriesBurned} kcal
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {formatDate(session.scheduledAt)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this workout?")) deleteSession();
            }}
            className="p-1 hover:text-destructive text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function PlansTab() {
  const [filters, setFilters] = useState({ level: '', goal: '' })
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const { data: publicPlansData, loading: publicLoading } = useFetch(
    () => workoutAPI.getPublicPlans(filters), [filters]
  )
  const { data: myPlansData, loading: myLoading, refetch } = useFetch(
    () => workoutAPI.getMyPlans(), []
  )

  const publicPlans = publicPlansData?.data || publicPlansData || []
  const myPlans = myPlansData?.data || myPlansData || []
  const allPlans = [...myPlans, ...publicPlans]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <select value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm bg-background">
            <option value="">All Levels</option>
            {['beginner', 'intermediate', 'advanced'].map(l => <option key={l} value={l}>{capitalize(l)}</option>)}
          </select>
          <select value={filters.goal} onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm bg-background">
            <option value="">All Goals</option>
            {['weight_loss', 'muscle_gain', 'strength', 'endurance'].map(g => <option key={g} value={g}>{capitalize(g)}</option>)}
          </select>
        </div>
        <button onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
          ✨ Generate AI Plan
        </button>
      </div>

      {(publicLoading || myLoading) && <p className="text-sm text-muted-foreground">Loading plans...</p>}

      {!publicLoading && !myLoading && !allPlans.length && (
        <div className="text-center text-muted-foreground py-12 border rounded-lg bg-card space-y-3">
          <p className="text-lg">No plans yet</p>
          <p className="text-sm">Generate a personalized AI workout plan</p>
          <button onClick={() => setShowGenerateModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
            ✨ Generate AI Plan
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {allPlans.map?.((plan) => (
          <div key={plan._id} className="border rounded-lg p-4 bg-card space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-medium">{plan.title}</h3>
              <div className="flex items-center gap-2">
                {plan.isAiGenerated && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">AI</span>}
                <span className="text-xs border rounded px-2 py-0.5 capitalize">{plan.level}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{plan.durationWeeks} weeks</span>
              <span>{plan.daysPerWeek} days/week</span>
              <span className="capitalize">{plan.goal?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {showGenerateModal && (
        <GenerateAIPlanModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => { setShowGenerateModal(false); refetch() }}
        />
      )}
    </div>
  )
}

function CreateWorkoutModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    workoutType: "strength",
    location: "gym",
  });
  const { mutate: createSession, loading } = useMutation(
    workoutAPI.createSession,
    {
      successMessage: "Workout created!",
      onSuccess,
    },
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">New Workout</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Morning Chest Day"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Type</label>
            <select
              value={form.workoutType}
              onChange={(e) =>
                setForm({ ...form, workoutType: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            >
              {WORKOUT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {capitalize(t)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Location</label>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {capitalize(l)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => createSession(form)}
            disabled={!form.title || loading}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create & Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <div className="border rounded-lg p-3 bg-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">
        {value}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          {unit}
        </span>
      </p>
    </div>
  );
}


function GenerateAIPlanModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ goal: 'weight_loss', daysPerWeek: 4, level: 'beginner', equipment: [] })
  const [loading, setLoading] = useState(false)
  const { toast } = useAppStore()

  const equipmentOptions = ['none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench']

  const toggleEquipment = (item) => {
    setForm(f => ({
      ...f,
      equipment: f.equipment.includes(item)
        ? f.equipment.filter(e => e !== item)
        : [...f.equipment, item]
    }))
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const aiRes = await aiAPI.generateWorkoutPlan({
        goal: form.goal,
        daysPerWeek: form.daysPerWeek,
        equipment: form.equipment,
        profile: { level: form.level },
      })
      const plan = aiRes.data.data
      await workoutAPI.createPlan({
        title: plan.title || `${capitalize(form.goal)} Plan`,
        level: plan.level || form.level,
        goal: form.goal,
        durationWeeks: plan.durationWeeks || 4,
        daysPerWeek: form.daysPerWeek,
        weeks: plan.weeks || [],
        equipment: form.equipment,
        isAiGenerated: true,
        description: `AI-generated ${form.goal.replace(/_/g, ' ')} plan`,
      })
      toast.success('AI workout plan created!')
      onSuccess()
    } catch (err) {
      toast.error('Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">✨ Generate AI Workout Plan</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Goal</label>
            <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              {['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'].map(g =>
                <option key={g} value={g}>{g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {['beginner', 'intermediate', 'advanced'].map(l => <option key={l} value={l}>{capitalize(l)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Days/Week</label>
              <select value={form.daysPerWeek} onChange={(e) => setForm({ ...form, daysPerWeek: Number(e.target.value) })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {[3, 4, 5, 6].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Equipment Available</label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map(item => (
                <button key={item} onClick={() => toggleEquipment(item)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    form.equipment.includes(item)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}>
                  {item.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50">
            {loading ? '✨ Generating...' : '✨ Generate Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}