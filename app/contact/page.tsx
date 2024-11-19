import { FormWithErrorHandling } from '@/components/FormWithErrorHandling'

export default function ContactPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <p className="mb-6 text-gray-600">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
        <FormWithErrorHandling />
      </div>
    </div>
  )
}
