export type Availability = 'ok' | 'maybe' | 'no';

export interface ParticipantResponse {
  id: string;
  name: string;
  responses: Record<string, Availability>; // date -> availability
  comment: string;
  updatedAt: string;
}

export interface EventDate {
  date: string; // ISO date string (YYYY-MM-DD)
  time?: string; // Time string (HH:mm)
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  dates: EventDate[];
  participants: ParticipantResponse[];
  createdAt: string;
}
