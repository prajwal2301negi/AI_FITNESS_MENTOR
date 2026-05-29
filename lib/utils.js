// lib/utils.js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })
}

export const getToday = () => new Date().toISOString().split('T')[0]

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ') : ''

export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.details?.[0]?.message ||
    error?.message ||
    'Something went wrong'
  )
}

export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null
  const h = heightCm / 100
  return (weightKg / (h * h)).toFixed(1)
}

export const getBMICategory = (bmi) => {
  if (!bmi) return null
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-500' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' }
  return { label: 'Obese', color: 'text-red-500' }
}

export const getMacroPercentages = (protein, carbs, fat) => {
  const total = protein * 4 + carbs * 4 + fat * 9
  if (!total) return { protein: 0, carbs: 0, fat: 0 }
  return {
    protein: Math.round((protein * 4 / total) * 100),
    carbs: Math.round((carbs * 4 / total) * 100),
    fat: Math.round((fat * 9 / total) * 100),
  }
}
