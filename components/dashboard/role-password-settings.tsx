import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { EventRole } from '@/lib/types';

interface RolePasswordSettingsProps {
  eventId: string;
}

export function RolePasswordSettings({ eventId }: RolePasswordSettingsProps) {
  const [judgePassword, setJudgePassword] = useState('');
  const [organizerPassword, setOrganizerPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPassword = async (role: EventRole) => {
    try {
      setIsLoading(true);
      const password = role === EventRole.Judge ? judgePassword : organizerPassword;

      const response = await fetch('/api/roles/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          role,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast({
          title: "Error",
          description: data.message || "Failed to set password",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `${role} password updated successfully`,
      });

      // Clear password input
      if (role === EventRole.Judge) {
        setJudgePassword('');
      } else {
        setOrganizerPassword('');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      toast({
        title: "Error",
        description: "Failed to set password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Judge Password</label>
        <div className="flex gap-2">
          <Input
            type="password"
            value={judgePassword}
            onChange={(e) => setJudgePassword(e.target.value)}
            placeholder="Set judge password"
          />
          <Button
            onClick={() => handleSetPassword(EventRole.Judge)}
            disabled={isLoading || !judgePassword}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Organizer Password</label>
        <div className="flex gap-2">
          <Input
            type="password"
            value={organizerPassword}
            onChange={(e) => setOrganizerPassword(e.target.value)}
            placeholder="Set organizer password"
          />
          <Button
            onClick={() => handleSetPassword(EventRole.Organizer)}
            disabled={isLoading || !organizerPassword}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
} 