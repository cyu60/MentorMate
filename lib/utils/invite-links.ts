import { createHash } from 'crypto';

export function generateProjectInviteHash(projectId: string): string {
  const hash = createHash('sha256')
    .update(projectId + process.env.NEXT_PUBLIC_SUPABASE_URL!)
    .digest('hex')
    .slice(0, 16);
  
  return hash;
}

export function generateProjectInviteLink(projectId: string): string {
  const hash = generateProjectInviteHash(projectId);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/join-project/${projectId}/${hash}`;
}

export function validateProjectInviteHash(projectId: string, hash: string): boolean {
  const expectedHash = generateProjectInviteHash(projectId);
  return hash === expectedHash;
}