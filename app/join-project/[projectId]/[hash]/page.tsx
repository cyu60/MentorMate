import { Metadata } from 'next';
import JoinProjectClient from './join-project-client';

export const metadata: Metadata = {
  title: 'Join Project',
  description: 'Join a project team',
};

interface Props {
  params: Promise<{
    projectId: string;
    hash: string;
  }>;
}

export default async function JoinProjectPage({ params }: Props) {
  const resolvedParams = await params;
  return <JoinProjectClient projectId={resolvedParams.projectId} hash={resolvedParams.hash} />;
}