"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from 'lucide-react'

const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  ssr: false,
  loading: () => <Loader2 className="h-12 w-12 animate-spin text-blue-400" />,
})

export default function MentorScanPage() {
  const [isScanning, setIsScanning] = useState(true)

  const handleToggleScanner = () => {
    setIsScanning((prev) => !prev)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80 p-10">
      <div className="relative z-10 container mx-auto">
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Scan Project QR Code
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <Card className="bg-white backdrop-blur-md border-blue-200/20">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">QR Scanner</CardTitle>
              <CardDescription className="text-blue-900"> Scan the project QR code to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
                {isScanning ? (
                  <QRScanner />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Scanner paused</p>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleToggleScanner}
                className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Pause Scanner
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resume Scanner
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

