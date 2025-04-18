'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateProjectInviteHash } from '@/lib/utils/invite-links';
import { supabase } from '@/lib/supabase';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ErrorScreen } from '@/components/ui/error-screen';

interface JoinProjectClientProps {
  projectId: string;
  hash: string;
}

export default function JoinProjectClient({ projectId, hash }: JoinProjectClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const joinProject = async () => {
      try {
        if (!validateProjectInviteHash(projectId, hash)) {
          setError('Invalid invite link');
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/login?returnUrl=/join-project/${projectId}/${hash}`);
          return;
        }

        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('teammates')
          .eq('id', projectId)
          .single();

        if (projectError || !project) {
          setError('Project not found');
          setLoading(false);
          return;
        }

        const teammates = project.teammates || [];
        if (teammates.includes(user.email)) {
          router.push(`/events/${projectId}/projects/public/${projectId}`);
          return;
        }

        const { error: updateError } = await supabase
          .from('projects')
          .update({
            teammates: [...teammates, user.email],
          })
          .eq('id', projectId);

        if (updateError) {
          setError('Failed to join project');
          setLoading(false);
          return;
        }

        router.push(`/events/${projectId}/projects/public/${projectId}`);
      } catch {
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    joinProject();
  }, [projectId, hash, router]);

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return null;
}