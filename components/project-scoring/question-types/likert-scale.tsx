"use client";

import { ScoringCriterion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface LikertScaleProps {
  criterion: ScoringCriterion;
  value: number;
  onChange: (value: number) => void;
}

export function LikertScale({ criterion, value, onChange }: LikertScaleProps) {
  // Default to 5-point scale if not specified
  const scalePoints = criterion.likertScale || 5;
  
  return (
    <FormItem className="space-y-3">
      <FormLabel>{criterion.name}</FormLabel>
      <FormControl>
        <div className="flex items-center justify-between space-x-2">
          <span className="text-sm text-muted-foreground">Strongly Disagree</span>
          <div className="flex space-x-1">
            {Array.from({ length: scalePoints }, (_, i) => i + 1).map((point) => (
              <Button
                key={point}
                type="button"
                variant={value === point ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => onChange(point)}
              >
                {point}
              </Button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">Strongly Agree</span>
        </div>
      </FormControl>
      {criterion.description && (
        <p className="text-sm text-muted-foreground">{criterion.description}</p>
      )}
    </FormItem>
  );
} 