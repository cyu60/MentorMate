import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import UserSearch from "@/components/utils/UserSearch";
import { ProjectSubmissionFormData } from "../schema/ProjectSubmissionSchema";

interface TeamContactStepProps {
  form: UseFormReturn<ProjectSubmissionFormData>;
  allUsers: string[];
  leadName?: string;
  userEmail?: string;
  onTeammatesChange: (tags: string[]) => void;
}

export function TeamContactStep({ 
  form, 
  allUsers, 
  leadName, 
  userEmail, 
  onTeammatesChange 
}: TeamContactStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="leadName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base flex items-center gap-2">
                Name
                {leadName && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Auto-filled
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  {...field}
                  className={`text-base p-3 ${
                    leadName ? "bg-gray-100" : ""
                  }`}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="leadEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base flex items-center gap-2">
                Email
                {userEmail && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Auto-filled
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="johndoe@example.com"
                  {...field}
                  className={`text-base p-3 ${
                    userEmail ? "bg-gray-100" : ""
                  }`}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="teammates"
        render={() => (
          <FormItem>
            <FormLabel className="text-base">Teammates</FormLabel>
            <FormControl>
              <UserSearch
                allTags={allUsers}
                onTagsChange={onTeammatesChange}
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
}