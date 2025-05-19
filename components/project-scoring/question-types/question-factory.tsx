"use client";

import { ScoringCriterion } from "@/lib/types";
import { MultipleChoice } from "./multiple-choice";
import { Slider } from "@/components/ui/slider";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";

interface QuestionFactoryProps {
  criterion: ScoringCriterion;
  value: number | string;
  onChange: (value: number | string) => void;
}

export function QuestionFactory({ criterion, value, onChange }: QuestionFactoryProps) {
  // Default to numeric if no type specified
  const questionType = criterion.type || "numeric";

  switch (questionType) {
    case "multiplechoice":
      return (
        <MultipleChoice 
          criterion={criterion} 
          value={value} 
          onChange={onChange} 
        />
      );
    
    case "likert":
    case "numeric":
    case "scale":
    default:
      // Default to a numeric slider
      const min = criterion.min !== undefined ? criterion.min : 1;
      const max = criterion.max !== undefined ? criterion.max : 10;
      const currentValue = Number(value) || min;
      
      return (
        <FormItem className="space-y-3 pb-6 border-b border-gray-200 last:border-b-0">
          <FormLabel>
            <h3 className="text-lg font-semibold">{criterion.name}</h3>
          </FormLabel>
          <FormControl>
            <div className="space-y-3">
              <Slider 
                value={[currentValue]}
                min={min}
                max={max}
                step={1}
                onValueChange={(values) => onChange(values[0])}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs">{min}</span>
                <span className="text-sm font-medium text-blue-500">{currentValue}</span>
                <span className="text-xs">{max}</span>
              </div>
            </div>
          </FormControl>
          {criterion.description && (
            <FormDescription>{criterion.description}</FormDescription>
          )}
        </FormItem>
      );
  }
} 