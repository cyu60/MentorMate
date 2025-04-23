"use client";

import { Mic, Square } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState, Dispatch, SetStateAction } from "react";

interface VoiceInputProps {
  setText: Dispatch<SetStateAction<string>>;
}

export default function VoiceInput({ setText }: VoiceInputProps) {
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: { error: string }) => void;
    start: () => void;
    stop: () => void;
    abort: () => void;
  }

  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      type SpeechRecognitionWindow = {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
      };

      const SpeechRecognitionConstructor = ((window as SpeechRecognitionWindow)
        .SpeechRecognition ||
        (window as SpeechRecognitionWindow)
          .webkitSpeechRecognition) as new () => SpeechRecognition;

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const lastResult = event.results[event.results.length - 1];
          const transcript = (lastResult[0] as SpeechRecognitionAlternative)
            .transcript;

          if (lastResult.isFinal) {
            setText((prev: string) => {
              const newText = transcript.trim();
              return prev ? `${prev} ${newText}` : newText;
            });
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: { error: string }) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }
  }, [setText]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };
  
  return (
    <Button
      type="button"
      onClick={toggleListening}
      className={`mt-2 sm:mt-0 self-start sm:self-auto p-2 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-2 z-10 shadow-sm border border-blue-100 ${
        isListening ? "bg-blue-100" : "bg-blue-50"
      }`}
      title={isListening ? "Stop recording" : "Start voice input"}
    >
      {isListening ? (
        <Square className="h-5 w-5 text-red-500 animate-pulse" />
      ) : (
        <Mic className="h-5 w-5 text-blue-500" />
      )}
    </Button>
  );
}
