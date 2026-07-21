import { useAuth } from '../context/AuthContext';
import { MY_TEAMS } from '../data/teams';

export type TeamRole = 'guest' | 'user' | 'member' | 'owner';

export function useTeamRole(teamId: number): TeamRole {
  const { user } = useAuth();
  if (!user) return 'guest';
  const entry = MY_TEAMS.find((t) => t.teamId === teamId);
  if (!entry) return 'user';
  return entry.role === '팀장' ? 'owner' : 'member';
}
