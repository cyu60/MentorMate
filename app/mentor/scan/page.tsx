import dynamic from 'next/dynamic'

const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
})

export default function MentorScanPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Scan Project QR Code</h1>
      <QRScanner />
    </div>
  )
}

