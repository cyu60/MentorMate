"use client";

import { useState } from "react";
import { OnResultFunction, QrReader } from "react-qr-reader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function QRScanner() {
  const [data, setData] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showScanner, setShowScanner] = useState(true);

  const handleScan = (result: { text: string } | null, error: Error | null) => {
    if (result) {
      setData(result.text);
      setShowScanner(false);
    }

    if (error) {
      console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log("Feedback submitted:", feedback);
    toast({
      title: "Feedback Submitted",
      description: "Your feedback has been submitted successfully.",
    });
    setFeedback("");
    setShowScanner(true);
    setData("");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {showScanner ? (
        <div className="w-full max-w-md">
          <QrReader
            onResult={handleScan as OnResultFunction}
            constraints={{ facingMode: "environment" }}
            containerStyle={{ width: "100%" }}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-gray-700"
            >
              Feedback for project: {data}
            </label>
            <Input
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback here"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Submit Feedback
          </Button>
        </form>
      )}
    </div>
  );
}
