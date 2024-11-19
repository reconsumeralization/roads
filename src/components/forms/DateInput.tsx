import React, { useEffect, useState } from 'react'
import { useToastStore } from '@/stores/useToastStore'

interface DateInputProps {
  name: string
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  min?: string
  max?: string
}

export function DateInput({
  name,
  value,
  onChange,
  label,
  required = false,
  min,
  max,
}: DateInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isTouched, setIsTouched] = useState(false)
  const addToast = useToastStore((state) => state.addToast)

  // Validate date and show toast for errors
  const validateDate = (dateStr: string): boolean => {
    if (!dateStr && required) {
      addToast({
        title: 'Date Required',
        description: `Please enter a date for ${label || name}`,
        variant: 'ERROR',
        priority: 'HIGH',
        duration: 5000,
      })
      return false
    }

    if (!dateStr) return true // Empty is ok if not required

    const date = new Date(dateStr)

    // Basic date validity check
    if (isNaN(date.getTime())) {
      addToast({
        title: 'Invalid Date',
        description: 'Please enter a valid date in YYYY-MM-DD format',
        variant: 'ERROR',
        priority: 'HIGH',
        duration: 5000,
      })
      return false
    }

    // Check min date
    if (min && date < new Date(min)) {
      addToast({
        title: 'Date Too Early',
        description: `Date must be after ${new Date(min).toLocaleDateString()}`,
        variant: 'ERROR',
        priority: 'HIGH',
        duration: 5000,
      })
      return false
    }

    // Check max date
    if (max && date > new Date(max)) {
      addToast({
        title: 'Date Too Late',
        description: `Date must be before ${new Date(max).toLocaleDateString()}`,
        variant: 'ERROR',
        priority: 'HIGH',
        duration: 5000,
      })
      return false
    }

    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Only validate if field has been touched
    if (isTouched && validateDate(newValue)) {
      onChange(newValue)
    }
  }

  const handleBlur = () => {
    setIsTouched(true)
    if (validateDate(inputValue)) {
      onChange(inputValue)
    }
  }

  // Validate initial value
  useEffect(() => {
    if (value && !validateDate(value)) {
      setInputValue('')
      onChange('')
    }
  }, [])

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type="date"
        id={name}
        name={name}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        required={required}
      />
    </div>
  )
}
