"use client";

import React, { useState } from "react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/hooks/use-toast";

export default function QRScanner() {
  const router = useRouter();
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      try {
        const rawValue = detectedCodes[0].rawValue;
        const projectId = rawValue.split("/").pop();

        if (!projectId) {
          throw new Error("Invalid QR code format");
        }

        toast({
          title: "QR Code Scanned",
          description: "Redirecting to project page...",
        });
        router.push(`/my-project-gallery/${projectId}`);
      } catch (error) {
        console.error("Error parsing QR code:", error);
        setScanError("Invalid QR code format. Please try scanning again.");
      }
    }
  };

  const handleError = (error: unknown) => {
    console.error(error);
    setScanError("Failed to scan QR code. Please try again.");
  };

  const handleRetry = () => {
    setScanError(null);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Scanner
        onScan={handleScan}
        onError={handleError}
        constraints={{ facingMode: "environment" }}
        styles={{ container: { width: "300px" }, video: { width: "100%" } }}
        allowMultiple={false}
        scanDelay={500}
      />
      {scanError && (
        <div className="mt-2 text-center">
          <p className="text-red-500">{scanError}</p>
          <Button onClick={handleRetry} className="mt-2">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
