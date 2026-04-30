export type Availability = 'ok' | 'maybe' | 'no';

export interface ParticipantResponse {
  id: string;
  name: string;
  responses: Record<string, Availability>; // date -> availability
  comment: string;
  updatedAt: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  dates: string[]; // ISO date strings
  participants: ParticipantResponse[];
  createdAt: string;
}
