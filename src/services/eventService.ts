import { nanoid } from 'nanoid';
import type { EventData, ParticipantResponse, EventDate } from '../types';

const STORAGE_KEY = 'rainbow_booking_events';

export const eventService = {
  // Create a new event
  async createEvent(title: string, description: string, dates: EventDate[]): Promise<EventData> {
    const newEvent: EventData = {
      id: nanoid(10),
      title,
      description,
      dates: dates.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '').localeCompare(b.time || '');
      }),
      participants: [],
      createdAt: new Date().toISOString(),
    };

    const events = this._getAllEvents();
    events[newEvent.id] = newEvent;
    this._saveAllEvents(events);

    return newEvent;
  },

  // Get event by ID
  async getEvent(id: string): Promise<EventData | null> {
    const events = this._getAllEvents();
    return events[id] || null;
  },

  // Add or update participant response
  async submitResponse(eventId: string, response: Omit<ParticipantResponse, 'id' | 'updatedAt'>): Promise<EventData> {
    const events = this._getAllEvents();
    const event = events[eventId];
    if (!event) throw new Error('Event not found');

    const participant: ParticipantResponse = {
      ...response,
      id: nanoid(6),
      updatedAt: new Date().toISOString(),
    };

    event.participants.push(participant);
    this._saveAllEvents(events);
    return event;
  },

  // Internal helpers for localStorage
  _getAllEvents(): Record<string, EventData> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  _saveAllEvents(events: Record<string, EventData>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
};
