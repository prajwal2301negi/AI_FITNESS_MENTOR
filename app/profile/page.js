'use client'
import { useState } from 'react'
import { profileAPI, authAPI } from '@/lib/api'
import { useFetch, useMutation } from '@/hooks/useApi'
import useAuthStore from '@/store/authStore'
import { calculateBMI, getBMICategory } from '@/lib/utils'
import { User, Lock, Activity } from 'lucide-react'

const ACTIVITY_LEVELS = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']
const FITNESS_GOALS = ['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'flexibility', 'general_fitness']
const DIETARY_TYPES = ['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean']
const GENDERS = ['male', 'female', 'non_binary', 'prefer_not_to_say']

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const { data: profile, loading, refetch } = useFetch(profileAPI.getProfile)

  const bmi = calculateBMI(profile?.weight_kg, profile?.height_cm)
  const bmiCategory = getBMICategory(bmi)

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">👤 Profile</h1>

      {/* BMI Card */}
      {bmi && (
        <div className="border rounded-lg p-4 bg-card flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{bmi}</p>
            <p className={`text-sm font-medium ${bmiCategory?.color}`}>{bmiCategory?.label}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Height: {profile.height_cm} cm</p>
            <p>Weight: {profile.weight_kg} kg</p>
            {profile.target_weight_kg && <p>Target: {profile.target_weight_kg} kg</p>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'fitness', label: 'Fitness', icon: Activity },
          { key: 'security', label: 'Security', icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {activeTab === 'profile' && profile && (
        <PersonalForm profile={profile} user={user} onSuccess={refetch} />
      )}

      {activeTab === 'fitness' && profile && (
        <FitnessForm profile={profile} onSuccess={refetch} />
      )}

      {activeTab === 'security' && <SecurityForm />}
    </div>
  )
}

function PersonalForm({ profile, user, onSuccess }) {
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    gender: profile?.gender || '',
    dateOfBirth: profile?.date_of_birth?.split('T')[0] || '',
    heightCm: profile?.height_cm || '',
    weightKg: profile?.weight_kg || '',
    targetWeightKg: profile?.target_weight_kg || '',
    timezone: profile?.timezone || 'Asia/Kolkata',
  })

  const { mutate: saveProfile, loading } = useMutation(profileAPI.updateProfile, {
    successMessage: 'Profile updated!',
    onSuccess,
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
        <Field label="Last Name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Gender" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })}
          options={GENDERS} />
        <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => setForm({ ...form, dateOfBirth: v })} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Height (cm)" type="number" value={form.heightCm} onChange={(v) => setForm({ ...form, heightCm: v })} />
        <Field label="Weight (kg)" type="number" value={form.weightKg} onChange={(v) => setForm({ ...form, weightKg: v })} />
        <Field label="Target Weight (kg)" type="number" value={form.targetWeightKg} onChange={(v) => setForm({ ...form, targetWeightKg: v })} />
      </div>
      <button onClick={() => saveProfile(form)} disabled={loading}
        className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}

function FitnessForm({ profile, onSuccess }) {
  const [form, setForm] = useState({
    activityLevel: profile?.activity_level || 'moderately_active',
    fitnessGoal: profile?.fitness_goal || 'general_fitness',
    dietaryType: profile?.dietary_type || 'omnivore',
    medicalNotes: profile?.medical_notes || '',
  })

  const { mutate: saveProfile, loading } = useMutation(profileAPI.updateProfile, {
    successMessage: 'Fitness profile updated!',
    onSuccess,
  })

  return (
    <div className="space-y-4">
      <SelectField label="Activity Level" value={form.activityLevel}
        onChange={(v) => setForm({ ...form, activityLevel: v })} options={ACTIVITY_LEVELS} />
      <SelectField label="Fitness Goal" value={form.fitnessGoal}
        onChange={(v) => setForm({ ...form, fitnessGoal: v })} options={FITNESS_GOALS} />
      <SelectField label="Dietary Type" value={form.dietaryType}
        onChange={(v) => setForm({ ...form, dietaryType: v })} options={DIETARY_TYPES} />
      <div className="space-y-1">
        <label className="text-sm font-medium">Medical Notes</label>
        <textarea value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
          placeholder="Any medical conditions or injuries..." rows={3}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none" />
      </div>
      <button onClick={() => saveProfile(form)} disabled={loading}
        className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}

function SecurityForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const { mutate: changePassword, loading } = useMutation(authAPI.changePassword, {
    successMessage: 'Password changed! Please login again.',
  })

  const handleSubmit = async () => {
    setError('')
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Field label="Current Password" type="password" value={form.currentPassword}
        onChange={(v) => setForm({ ...form, currentPassword: v })} />
      <Field label="New Password" type="password" value={form.newPassword}
        onChange={(v) => setForm({ ...form, newPassword: v })} />
      <Field label="Confirm New Password" type="password" value={form.confirmPassword}
        onChange={(v) => setForm({ ...form, confirmPassword: v })} />
      <button onClick={handleSubmit} disabled={loading}
        className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50">
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </div>
  )
}

// Reusable field components
function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm bg-background">
        {options.map(o => (
          <option key={o} value={o}>{o.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
        ))}
      </select>
    </div>
  )
}
