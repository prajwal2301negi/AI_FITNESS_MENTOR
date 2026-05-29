'use client'
import { useState } from 'react'
import { nutritionAPI } from '@/lib/api'
import { useFetch, useMutation } from '@/hooks/useApi'
import { getToday, capitalize } from '@/lib/utils'
import { Plus, Trash2, Search, X } from 'lucide-react'

const MEAL_TYPES = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack', 'pre_workout', 'post_workout']

export default function MealsPage() {
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [showLogForm, setShowLogForm] = useState(false)
  const { data: dailyLog, loading, refetch } = useFetch(
    () => nutritionAPI.getDailyLog(selectedDate),
    [selectedDate]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🥗 Nutrition</h1>
        <button
          onClick={() => setShowLogForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Log Meal
        </button>
      </div>

      {/* Date Selector */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm bg-background"
      />

      {/* Daily Totals */}
      {dailyLog?.dailyTotals && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['calories', 'protein', 'carbs', 'fat', 'fiber'].map((key) => (
            <div key={key} className="border rounded-lg p-3 bg-card text-center">
              <p className="text-xs text-muted-foreground capitalize">{key}</p>
              <p className="text-lg font-bold">{Math.round(dailyLog.dailyTotals[key] || 0)}</p>
              <p className="text-xs text-muted-foreground">{key === 'calories' ? 'kcal' : 'g'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Meals List */}
      <div className="space-y-3">
        {loading && <p className="text-muted-foreground text-sm">Loading...</p>}
        {!loading && (!dailyLog?.meals?.length) && (
          <div className="border rounded-lg p-8 text-center text-muted-foreground bg-card">
            <p>No meals logged for this date</p>
            <button onClick={() => setShowLogForm(true)} className="mt-2 text-primary text-sm hover:underline">
              Log your first meal
            </button>
          </div>
        )}
        {dailyLog?.meals?.map((meal) => (
          <MealCard key={meal._id} meal={meal} onDelete={refetch} />
        ))}
      </div>

      {/* Log Meal Modal */}
      {showLogForm && (
        <LogMealModal
          onClose={() => setShowLogForm(false)}
          onSuccess={() => { setShowLogForm(false); refetch() }}
        />
      )}
    </div>
  )
}

function MealCard({ meal, onDelete }) {
  const { mutate: deleteMeal } = useMutation(
    () => nutritionAPI.deleteMeal(meal._id),
    { successMessage: 'Meal deleted', onSuccess: onDelete }
  )

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{capitalize(meal.mealType)}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{meal.totals.calories} kcal</span>
          <button onClick={deleteMeal} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {meal.foods.map((food, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{food.name} ({food.quantity}{food.unit})</span>
            <span className="text-muted-foreground">{food.calories} kcal</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>P: {meal.totals.protein}g</span>
        <span>C: {meal.totals.carbs}g</span>
        <span>F: {meal.totals.fat}g</span>
      </div>
    </div>
  )
}

function LogMealModal({ onClose, onSuccess }) {
  const [mealType, setMealType] = useState('breakfast')
  const [foods, setFoods] = useState([{ name: '', calories: '', protein: '', carbs: '', fat: '', quantity: 100, unit: 'g' }])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const { mutate: logMeal, loading } = useMutation(nutritionAPI.logMeal, {
    successMessage: 'Meal logged!',
    onSuccess,
  })

  const handleSearch = async () => {
    if (searchQuery.length < 2) return
    setSearching(true)
    try {
      const res = await nutritionAPI.searchFood(searchQuery)
      setSearchResults(res.data.data || [])
    } catch (_) {}
    setSearching(false)
  }

  const addFoodFromSearch = (food) => {
    setFoods([...foods, {
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      quantity: food.servingSize || 100,
      unit: food.servingUnit || 'g',
    }])
    setSearchResults([])
    setSearchQuery('')
  }

  const updateFood = (i, field, value) => {
    const updated = [...foods]
    updated[i][field] = value
    setFoods(updated)
  }

  const removeFood = (i) => setFoods(foods.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    const validFoods = foods.filter(f => f.name && f.calories)
    if (!validFoods.length) return
    await logMeal({ mealType, foods: validFoods.map(f => ({ ...f, calories: Number(f.calories), protein: Number(f.protein) || 0, carbs: Number(f.carbs) || 0, fat: Number(f.fat) || 0, quantity: Number(f.quantity) || 100 })) })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Log Meal</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Meal Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Meal Type</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              {MEAL_TYPES.map(t => <option key={t} value={t}>{capitalize(t)}</option>)}
            </select>
          </div>

          {/* Food Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Food</label>
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search food..."
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
              />
              <button onClick={handleSearch} className="border rounded-md px-3 py-2 hover:bg-accent">
                <Search className="h-4 w-4" />
              </button>
            </div>
            {searching && <p className="text-xs text-muted-foreground">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                {searchResults.slice(0, 8).map((food, i) => (
                  <button key={i} onClick={() => addFoodFromSearch(food)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent">
                    <span className="font-medium">{food.name}</span>
                    <span className="text-muted-foreground ml-2">{food.calories} kcal</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Foods */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Foods</label>
            {foods.map((food, i) => (
              <div key={i} className="border rounded-md p-3 space-y-2">
                <div className="flex gap-2">
                  <input value={food.name} onChange={(e) => updateFood(i, 'name', e.target.value)}
                    placeholder="Food name" className="flex-1 border rounded px-2 py-1 text-sm bg-background" />
                  <button onClick={() => removeFood(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['calories', 'protein', 'carbs', 'fat'].map(field => (
                    <input key={field} type="number" value={food[field]}
                      onChange={(e) => updateFood(i, field, e.target.value)}
                      placeholder={field} className="border rounded px-2 py-1 text-xs bg-background" />
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => setFoods([...foods, { name: '', calories: '', protein: '', carbs: '', fat: '', quantity: 100, unit: 'g' }])}
              className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus className="h-3 w-3" /> Add food
            </button>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50">
            {loading ? 'Logging...' : 'Log Meal'}
          </button>
        </div>
      </div>
    </div>
  )
}
