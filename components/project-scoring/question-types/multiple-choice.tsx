"use client";

import { ScoringCriterion } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/custom-radio-group";
import { Label } from "@/components/ui/label";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface MultipleChoiceProps {
  criterion: ScoringCriterion;
  value: string | number;
  onChange: (value: string | number) => void;
}

export function MultipleChoice({
  criterion,
  value,
  onChange,
}: MultipleChoiceProps) {
  if (!criterion.options || criterion.options.length === 0) {
    return (
      <div className="text-red-500">
        No options configured for this question
      </div>
    );
  }

  return (
    <FormItem className="space-y-3 pb-6 border-b border-gray-200 last:border-b-0">
      <FormLabel>
        <h3 className="text-lg font-semibold">{criterion.name}</h3>
      </FormLabel>
      <FormControl>
        <RadioGroup
          value={value ? String(value) : undefined}
          onValueChange={(newValue) => {
            onChange(newValue);
          }}
          className="flex flex-col space-y-2"
        >
          {criterion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={String(option)}
                id={`${criterion.id}-${index}`}
              />
              <Label
                htmlFor={`${criterion.id}-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FormControl>
      {criterion.description && (
        <p className="text-sm text-muted-foreground">{criterion.description}</p>
      )}
    </FormItem>
  );
}
