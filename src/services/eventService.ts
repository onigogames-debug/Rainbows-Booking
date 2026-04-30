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
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        
        if (data) {
          return {
            id: data.id,
            title: data.title,
            description: data.description,
            dates: data.dates,
            participants: data.participants || [],
            createdAt: data.created_at || data.createdAt, // handle both cases
          };
        }
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
          console.error('Supabase fetch error:', error);
        }
      } catch (err) {
        console.error('Supabase connection failed:', err);
      }
    }

    // Fallback to localStorage
    const events = this._getAllEvents();
    return events[id] || null;
  },

  // Add or update participant response
  async submitResponse(eventId: string, response: Omit<ParticipantResponse, 'id' | 'updatedAt'>, participantId?: string): Promise<{ event: EventData, participantId: string }> {
    const id = participantId || nanoid(8);
    const participant: ParticipantResponse = {
      ...response,
      id,
      updatedAt: new Date().toISOString(),
    };

    if (supabase) {
      const { data: event, error: fetchError } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (fetchError || !event) throw new Error('Event not found');

      let updatedParticipants = [...(event.participants || [])];
      const existingIndex = updatedParticipants.findIndex(p => p.id === id);
      
      if (existingIndex >= 0) {
        updatedParticipants[existingIndex] = participant;
      } else {
        updatedParticipants.push(participant);
      }

      const { error: updateError } = await supabase.from('events').update({ participants: updatedParticipants }).eq('id', eventId);
      if (updateError) throw updateError;
      
      return { 
        event: { ...event, participants: updatedParticipants, createdAt: event.created_at || event.createdAt },
        participantId: id
      };
    } else {
      const events = this._getAllEvents();
      const event = events[eventId];
      if (!event) throw new Error('Event not found');

      const existingIndex = event.participants.findIndex(p => p.id === id);
      if (existingIndex >= 0) {
        event.participants[existingIndex] = participant;
      } else {
        event.participants.push(participant);
      }
      
      this._saveAllEvents(events);
      return { event, participantId: id };
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
