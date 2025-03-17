import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MentorRegistrationModalProps {
  isOpen: boolean;
  onClose: (mentorInfo?: { id: string; name: string; email: string }) => void;
}

export function MentorRegistrationModal({
  isOpen,
  onClose,
}: MentorRegistrationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, check if mentor exists
      const { data: existingMentor, error: searchError } = await supabase
        .from("mentors")
        .select("*")
        .eq("email", email)
        .single();

      if (searchError && searchError.code !== "PGRST116") {
        // PGRST116 is "not found" error
        throw searchError;
      }

      let mentorInfo;

      if (existingMentor) {
        // Update existing mentor's name if different
        if (existingMentor.name !== name) {
          const { error: updateError } = await supabase
            .from("mentors")
            .update({ name })
            .eq("id", existingMentor.id);

          if (updateError) throw updateError;
        }
        mentorInfo = existingMentor;
        toast({
          title: "Welcome Back!",
          description: "You have been logged in successfully.",
        });
      } else {
        // Create new mentor
        const { data: newMentor, error: insertError } = await supabase
          .from("mentors")
          .insert({ name, email })
          .select();

        if (insertError) throw insertError;
        if (!newMentor?.[0])
          throw new Error("No data returned from mentor registration");

        mentorInfo = newMentor[0];
        toast({
          title: "Registration Successful",
          description: "You have been registered as a mentor.",
        });
      }

      onClose(mentorInfo);
    } catch (error) {
      console.error("Error in mentor registration:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mentor Registration</DialogTitle>
          <DialogDescription>
            Please enter your details to provide feedback.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
