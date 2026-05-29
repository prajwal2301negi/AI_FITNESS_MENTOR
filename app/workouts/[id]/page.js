'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { workoutAPI } from '@/lib/api'
import { useFetch, useMutation } from '@/hooks/useApi'
import { capitalize } from '@/lib/utils'
import { Play, CheckCircle, Plus, ArrowLeft, X } from 'lucide-react'

export default function WorkoutSessionPage() {
  const { id } = useParams()
  const router = useRouter()
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)

  const { data: session, loading, refetch } = useFetch(() => workoutAPI.getSession(id), [id])

  const { mutate: startWorkout, loading: starting } = useMutation(
    () => workoutAPI.startWorkout(id),
    { successMessage: 'Workout started!', onSuccess: refetch }
  )

  if (loading) return <div className="text-muted-foreground text-sm">Loading...</div>
  if (!session) return <div className="text-muted-foreground text-sm">Session not found</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 rounded-md hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{session.title}</h1>
          <p className="text-sm text-muted-foreground capitalize">{session.workoutType} • {session.status}</p>
        </div>
      </div>

      {/* Actions */}
      {session.status === 'planned' && (
        <button onClick={startWorkout} disabled={starting}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
          <Play className="h-4 w-4" />
          {starting ? 'Starting...' : 'Start Workout'}
        </button>
      )}

      {session.status === 'in_progress' && (
        <div className="flex gap-3">
          <button onClick={() => setShowAddExercise(true)}
            className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm font-medium hover:bg-accent">
            <Plus className="h-4 w-4" /> Add Exercise
          </button>
          <button onClick={() => setShowCompleteForm(true)}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium">
            <CheckCircle className="h-4 w-4" /> Complete
          </button>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        {!session.exercises?.length && (
          <div className="border rounded-lg p-6 text-center text-muted-foreground bg-card">
            No exercises added yet
          </div>
        )}
        {session.exercises?.map((exercise, idx) => (
          <ExerciseCard
            key={idx}
            exercise={exercise}
            exerciseIndex={idx}
            sessionId={id}
            isActive={session.status === 'in_progress'}
            onSetLogged={refetch}
          />
        ))}
      </div>

      {/* Summary for completed */}
      {session.status === 'completed' && (
        <div className="border rounded-lg p-4 bg-card space-y-3">
          <h2 className="font-semibold">Session Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{session.durationMin} min</p></div>
            <div><p className="text-muted-foreground">Calories</p><p className="font-medium">{session.caloriesBurned} kcal</p></div>
            <div><p className="text-muted-foreground">Mood</p><p className="font-medium">{session.mood}/10</p></div>
            <div><p className="text-muted-foreground">Difficulty</p><p className="font-medium">{session.difficulty}/10</p></div>
          </div>
          {session.notes && <p className="text-sm text-muted-foreground">{session.notes}</p>}
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteForm && (
        <CompleteWorkoutModal
          sessionId={id}
          onClose={() => setShowCompleteForm(false)}
          onSuccess={() => { setShowCompleteForm(false); refetch() }}
        />
      )}

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <AddExerciseModal
          sessionId={id}
          session={session}
          onClose={() => setShowAddExercise(false)}
          onSuccess={() => { setShowAddExercise(false); refetch() }}
        />
      )}
    </div>
  )
}

function ExerciseCard({ exercise, exerciseIndex, sessionId, isActive, onSetLogged }) {
  const [showAddSet, setShowAddSet] = useState(false)
  const [setForm, setSetForm] = useState({ reps: '', weightKg: '', restSec: 60, rpe: 7 })

  const { mutate: logSet, loading } = useMutation(
    () => workoutAPI.logSet(sessionId, { exerciseIndex, set: { ...setForm, reps: Number(setForm.reps), weightKg: Number(setForm.weightKg) } }),
    { successMessage: 'Set logged!', onSuccess: onSetLogged }
  )

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{exercise.name}</h3>
          <p className="text-xs text-muted-foreground capitalize">{exercise.category} • {exercise.muscleGroups?.join(', ')}</p>
        </div>
        {isActive && (
          <button onClick={() => setShowAddSet(!showAddSet)}
            className="text-xs border rounded px-2 py-1 hover:bg-accent flex items-center gap-1">
            <Plus className="h-3 w-3" /> Log Set
          </button>
        )}
      </div>

      {/* Sets */}
      {exercise.sets?.length > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-4 text-xs text-muted-foreground font-medium">
            <span>Set</span><span>Weight</span><span>Reps</span><span>RPE</span>
          </div>
          {exercise.sets.map((set, i) => (
            <div key={i} className="grid grid-cols-4 text-sm">
              <span>{set.setNumber}</span>
              <span>{set.weightKg}kg</span>
              <span>{set.reps}</span>
              <span>{set.rpe}/10</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Set Form */}
      {showAddSet && (
        <div className="border-t pt-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs">Weight (kg)</label>
              <input type="number" value={setForm.weightKg} onChange={(e) => setSetForm({ ...setForm, weightKg: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm bg-background" />
            </div>
            <div className="space-y-1">
              <label className="text-xs">Reps</label>
              <input type="number" value={setForm.reps} onChange={(e) => setSetForm({ ...setForm, reps: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm bg-background" />
            </div>
            <div className="space-y-1">
              <label className="text-xs">RPE (1-10)</label>
              <input type="number" min="1" max="10" value={setForm.rpe} onChange={(e) => setSetForm({ ...setForm, rpe: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm bg-background" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={logSet} disabled={loading}
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm disabled:opacity-50">
              {loading ? 'Logging...' : 'Log Set'}
            </button>
            <button onClick={() => setShowAddSet(false)} className="border px-3 py-1.5 rounded text-sm hover:bg-accent">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CompleteWorkoutModal({ sessionId, onClose, onSuccess }) {
  const [form, setForm] = useState({ caloriesBurned: '', mood: 8, energyLevel: 7, difficulty: 6, notes: '' })
  const { mutate: complete, loading } = useMutation(
    () => workoutAPI.completeWorkout(sessionId, { ...form, caloriesBurned: Number(form.caloriesBurned) }),
    { successMessage: '🎉 Workout completed!', onSuccess }
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Complete Workout</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Calories Burned</label>
            <input type="number" value={form.caloriesBurned} onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })}
              placeholder="350" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['mood', 'energyLevel', 'difficulty'].map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-xs font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')} (1-10)</label>
                <input type="number" min="1" max="10" value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Great session!" rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none" />
          </div>
          <button onClick={complete} disabled={loading}
            className="w-full bg-green-500 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50">
            {loading ? 'Completing...' : '🎉 Complete Workout'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddExerciseModal({ sessionId, session, onClose, onSuccess }) {
  const [exercise, setExercise] = useState({ name: '', category: 'strength', muscleGroups: '' })
  // const { mutate: update, loading } = useMutation(
  //   () => workoutAPI.createSession({
  //     ...session,
  //     exercises: [...(session.exercises || []), {
  //       ...exercise,
  //       muscleGroups: exercise.muscleGroups.split(',').map(s => s.trim()).filter(Boolean),
  //       order: (session.exercises?.length || 0) + 1,
  //     }]
  //   }),
  //   { successMessage: 'Exercise added!', onSuccess }
  // )
  const { mutate: update, loading } = useMutation(
  () => workoutAPI.updateSession(sessionId, {
    exercises: [...(session.exercises || []), {
      ...exercise,
      muscleGroups: exercise.muscleGroups.split(',').map(s => s.trim()).filter(Boolean),
      order: (session.exercises?.length || 0) + 1,
    }]
  }),
  { successMessage: 'Exercise added!', onSuccess }
)


  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Add Exercise</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Exercise Name</label>
            <input value={exercise.name} onChange={(e) => setExercise({ ...exercise, name: e.target.value })}
              placeholder="Bench Press"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <select value={exercise.category} onChange={(e) => setExercise({ ...exercise, category: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              {['strength', 'cardio', 'flexibility', 'calisthenics', 'plyometrics'].map(c =>
                <option key={c} value={c}>{capitalize(c)}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Muscle Groups (comma separated)</label>
            <input value={exercise.muscleGroups} onChange={(e) => setExercise({ ...exercise, muscleGroups: e.target.value })}
              placeholder="chest, triceps"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
          </div>
          <button onClick={update} disabled={!exercise.name || loading}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Exercise'}
          </button>
        </div>
      </div>
    </div>
  )
}
