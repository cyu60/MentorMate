"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventRole } from "@/lib/types";
import { Loader2, Copy, Check, Link } from "lucide-react";

interface GenerateInviteLinkProps {
  eventId: string;
  eventName: string;
}

export function GenerateInviteLink({
  eventId,
}: GenerateInviteLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<EventRole>(
    EventRole.Participant
  );
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateLink = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/invite/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          role: selectedRole,
          email: email.trim() !== "" ? email : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate invite link");
      }

      setInviteLink(data.inviteLink);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-medium mb-4">Generate Invite Link</h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as EventRole)}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EventRole.Participant}>Participant</SelectItem>
              <SelectItem value={EventRole.Mentor}>Mentor</SelectItem>
              <SelectItem value={EventRole.Judge}>Judge</SelectItem>
              <SelectItem value={EventRole.Organizer}>Organizer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email (Optional)
          </label>
          <Input
            id="email"
            type="email"
            placeholder="For specific user (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave blank to create a link anyone can use
          </p>
        </div>

        <Button
          onClick={handleGenerateLink}
          disabled={isLoading}
          className="w-full bg-blue-900 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4" />
              Generate Invite Link
            </>
          )}
        </Button>

        {error && (
          <div className="text-sm text-red-600 mt-2 text-center">{error}</div>
        )}

        {inviteLink && (
          <div className="mt-4">
            <label
              htmlFor="inviteLink"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Invite Link
            </label>
            <div className="flex">
              <Input
                id="inviteLink"
                value={inviteLink}
                readOnly
                className="flex-grow rounded-r-none"
              />
              <Button
                onClick={handleCopyLink}
                className="rounded-l-none bg-blue-900 hover:bg-blue-700"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This link will expire in 1 day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 