import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import type { EventData, ParticipantResponse, EventDate } from '../types';

const STORAGE_KEY = 'rainbow_booking_events';

export const eventService = {
  // Create a new event
  async createEvent(title: string, description: string, dates: EventDate[]): Promise<EventData> {
    const id = nanoid(10);
    const sortedDates = dates.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || '').localeCompare(b.time || '');
    });

    const newEvent: EventData = {
      id,
      title,
      description,
      dates: sortedDates,
      participants: [],
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      const { error } = await supabase.from('events').insert([
        { id, title, description, dates: sortedDates, participants: [], created_at: newEvent.createdAt }
      ]);
      if (error) console.error('Supabase error:', error);
    } else {
      const events = this._getAllEvents();
      events[id] = newEvent;
      this._saveAllEvents(events);
    }

    return newEvent;
  },

  // Get event by ID
  async getEvent(id: string): Promise<EventData | null> {
    if (supabase) {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error || !data) return null;
      return {
        ...data,
        createdAt: data.created_at // handle field naming difference
      };
    }
    const events = this._getAllEvents();
    return events[id] || null;
  },

  // Add or update participant response
  async submitResponse(eventId: string, response: Omit<ParticipantResponse, 'id' | 'updatedAt'>): Promise<EventData> {
    const participant: ParticipantResponse = {
      ...response,
      id: nanoid(6),
      updatedAt: new Date().toISOString(),
    };

    if (supabase) {
      // Get current event data
      const { data: event, error: fetchError } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (fetchError || !event) throw new Error('Event not found');

      const updatedParticipants = [...(event.participants || []), participant];
      const { error: updateError } = await supabase.from('events').update({ participants: updatedParticipants }).eq('id', eventId);
      
      if (updateError) throw updateError;
      return { ...event, participants: updatedParticipants, createdAt: event.created_at };
    } else {
      const events = this._getAllEvents();
      const event = events[eventId];
      if (!event) throw new Error('Event not found');

      event.participants.push(participant);
      this._saveAllEvents(events);
      return event;
    }
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
