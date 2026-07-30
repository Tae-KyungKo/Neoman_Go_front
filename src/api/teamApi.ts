import { requestApi } from './httpClient';

export interface TeamApplicationPayload {
  message: string | null;
}

export interface TeamApplicationResponse {
  applicationId: number;
  teamId: number;
  teamName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  message: string | null;
}

export interface TeamApplicationSummaryResponse {
  applicationId: number;
  teamId: number;
  teamName: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  message: string | null;
  createdAt: string;
}

export interface TeamApplicationOwnerResponse {
  applicationId: number;
  applicantId: number;
  applicantNickname: string;
  teamId: number;
  teamName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  message: string | null;
  createdAt: string;
}

export interface TeamMemberListResponse {
  teamMemberId: number;
  userId: number;
  nickname: string;
  role: 'OWNER' | 'MEMBER';
  status: string;
}

export interface TeamMemberResponse {
  userId: number;
  nickname: string;
  role: 'OWNER' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}

export interface TeamDetailResponse {
  id: number;
  name: string;
  description: string;
  category: string;
  level: 'CASUAL' | 'COMPETITIVE';
  location: string;
  activityTime: string;
  memberCount: number;
  status: 'RECRUITING' | 'CLOSED';
  owner: TeamMemberResponse;
  members: TeamMemberResponse[];
  createdAt: string;
}

export interface TeamSummaryResponse {
  id: number;
  name: string;
  category: string;
  level: 'CASUAL' | 'COMPETITIVE';
  location: string;
  activityTime: string;
  memberCount: number;
  status: 'RECRUITING' | 'CLOSED';
  ownerId: number;
  ownerNickname: string;
  createdAt: string;
}

export interface TeamPageResponse {
  content: TeamSummaryResponse[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface MyTeamSummaryResponse {
  id: number;
  name: string;
  category: string;
  level: 'CASUAL' | 'COMPETITIVE';
  location: string;
  activityTime: string;
  memberCount: number;
  status: 'RECRUITING' | 'CLOSED';
  myRole: 'OWNER' | 'MEMBER';
}

export type TeamCategory =
  | 'LOL'
  | 'VALORANT'
  | 'PUBG'
  | 'FIFA'
  | 'SOCCER_FUTSAL'
  | 'BASKETBALL';

export interface TeamCreatePayload {
  name: string;
  description: string | null;
  category: TeamCategory;
  level: 'CASUAL' | 'COMPETITIVE';
  location: string;
  activityTime: string;
}

export interface TeamCreateResponse {
  id: number;
  name: string;
  description: string | null;
  category: TeamCategory;
  level: 'CASUAL' | 'COMPETITIVE';
  location: string;
  activityTime: string;
  status: 'RECRUITING' | 'CLOSED';
}

export function createTeam(
  payload: TeamCreatePayload,
): Promise<TeamCreateResponse> {
  return requestApi<TeamCreateResponse>(
    '/api/teams',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getTeam(teamId: number): Promise<TeamDetailResponse> {
  return requestApi<TeamDetailResponse>(`/api/teams/${teamId}`);
}

export function getTeams(
  category: string | null,
  level: 'CASUAL' | 'COMPETITIVE' | null,
  page: number,
  size = 6,
): Promise<TeamPageResponse> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: 'createdAt,desc',
  });
  if (category) {
    query.set('category', category);
  }
  if (level) {
    query.set('level', level);
  }
  return requestApi<TeamPageResponse>(`/api/teams?${query.toString()}`);
}

export function createTeamApplication(
  teamId: number,
  payload: TeamApplicationPayload,
): Promise<TeamApplicationResponse> {
  return requestApi<TeamApplicationResponse>(
    `/api/teams/${teamId}/applications`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getMyTeamApplications(
  includeRead = false,
): Promise<TeamApplicationSummaryResponse[]> {
  const query = includeRead ? '?includeRead=true' : '';
  return requestApi<TeamApplicationSummaryResponse[]>(
    `/api/me/team-applications${query}`,
  );
}

export function markTeamApplicationAsRead(
  applicationId: number,
): Promise<void> {
  return requestApi<void>(
    `/api/me/team-applications/${applicationId}/read`,
    { method: 'PATCH' },
  );
}

export function markAllTeamApplicationsAsRead(): Promise<void> {
  return requestApi<void>(
    '/api/me/team-applications/read-all',
    { method: 'PATCH' },
  );
}

export function getMyTeams(): Promise<MyTeamSummaryResponse[]> {
  return requestApi<MyTeamSummaryResponse[]>('/api/me/teams');
}

export function cancelTeamApplication(
  applicationId: number,
): Promise<TeamApplicationResponse> {
  return requestApi<TeamApplicationResponse>(
    `/api/team-applications/${applicationId}/cancel`,
    { method: 'PATCH' },
  );
}

export function getTeamApplicationsForOwner(
  teamId: number,
): Promise<TeamApplicationOwnerResponse[]> {
  return requestApi<TeamApplicationOwnerResponse[]>(
    `/api/teams/${teamId}/applications`,
  );
}

export function approveTeamApplication(
  applicationId: number,
): Promise<TeamApplicationResponse> {
  return requestApi<TeamApplicationResponse>(
    `/api/team-applications/${applicationId}/approve`,
    { method: 'POST' },
  );
}

export function rejectTeamApplication(
  applicationId: number,
): Promise<TeamApplicationResponse> {
  return requestApi<TeamApplicationResponse>(
    `/api/team-applications/${applicationId}/reject`,
    { method: 'POST' },
  );
}

export function getTeamMembers(
  teamId: number,
): Promise<TeamMemberListResponse[]> {
  return requestApi<TeamMemberListResponse[]>(
    `/api/teams/${teamId}/members`,
  );
}

export function kickTeamMember(
  teamId: number,
  teamMemberId: number,
): Promise<void> {
  return requestApi<void>(
    `/api/teams/${teamId}/members/${teamMemberId}/kick`,
    { method: 'POST' },
  );
}

export function leaveTeam(
  teamId: number,
): Promise<void> {
  return requestApi<void>(
    `/api/teams/${teamId}/members/me/leave`,
    { method: 'POST' },
  );
}

export function delegateTeamOwner(
  teamId: number,
  targetTeamMemberId: number,
): Promise<void> {
  return requestApi<void>(
    `/api/teams/${teamId}/owner/delegate`,
    {
      method: 'POST',
      body: JSON.stringify({ targetTeamMemberId }),
    },
  );
}

export function closeTeam(
  teamId: number,
): Promise<void> {
  return requestApi<void>(
    `/api/teams/${teamId}/close`,
    { method: 'PATCH' },
  );
}

export function reopenTeam(
  teamId: number,
): Promise<void> {
  return requestApi<void>(
    `/api/teams/${teamId}/reopen`,
    { method: 'PATCH' },
  );
}

export function deleteTeam(
  teamId: number,
): Promise<void> {
  return requestApi<void>(
    `/api/teams/${teamId}`,
    { method: 'DELETE' },
  );
}
