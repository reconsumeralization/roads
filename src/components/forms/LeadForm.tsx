import { DateInput } from './DateInput'

export function LeadForm() {
  const handleDateChange = (date: string) => {
    // Handle valid date changes
    console.log('Valid date selected:', date)
  }

  return (
    <form>
      <DateInput
        name="appointmentDate"
        label="Appointment Date"
        value=""
        onChange={handleDateChange}
        required
        min={new Date().toISOString().split('T')[0]} // Today
        max="2025-12-31"
      />
    </form>
  )
}
