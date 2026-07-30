import { requestApi } from './httpClient';

export type FormationSport = 'SOCCER' | 'FUTSAL' | 'BASKETBALL';

export interface FormationPlayerPayload {
  positionName: string;
  playerName: string;
  x: number;
  y: number;
  displayOrder: number;
}

export interface FormationPlayerResponse extends FormationPlayerPayload {
  id: number;
}

export interface FormationResponse {
  teamId: number;
  teamName: string;
  sport: FormationSport;
  version: number;
  updatedAt: string | null;
  updatedBy: {
    userId: number;
    nickname: string;
  } | null;
  players: FormationPlayerResponse[];
}

export interface FormationSavePayload {
  version: number;
  players: FormationPlayerPayload[];
}

export function getFormation(
  teamId: number,
  sport: FormationSport,
): Promise<FormationResponse> {
  return requestApi<FormationResponse>(`/api/teams/${teamId}/formations/${sport}`);
}

export function saveFormation(
  teamId: number,
  sport: FormationSport,
  payload: FormationSavePayload,
): Promise<FormationResponse> {
  return requestApi<FormationResponse>(
    `/api/teams/${teamId}/formations/${sport}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}
