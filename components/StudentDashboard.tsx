'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'

const mockFeedback = [
  { id: 1, text: "Great project idea! Consider expanding on the user experience.", judge: "Judge A" },
  { id: 2, text: "The technical implementation is solid. Think about scalability.", judge: "Judge B" },
  { id: 3, text: "Impressive presentation. Work on clarifying the problem statement.", judge: "Judge C" },
]

export default function StudentDashboard() {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCode value="https://example.com/student-project" size={200} />
      </div>
      
      <Button 
        onClick={() => setShowFeedback(!showFeedback)}
        className="w-full max-w-md"
      >
        {showFeedback ? 'Hide Feedback' : 'See Feedback'}
      </Button>

      {showFeedback && (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Feedback</h2>
          <ul className="space-y-4">
            {mockFeedback.map((item) => (
              <li key={item.id} className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-800">{item.text}</p>
                <p className="text-sm text-gray-600 mt-2">- {item.judge}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

