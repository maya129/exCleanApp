/**
 * TypeScript interface for the EventKitModule native bridge.
 * Native implementation: ios/ExEraser/EventKitModule.swift
 * Uses EKEventStore, EKEvent, EKParticipant
 */

import { NativeModules } from 'react-native';

export interface CalendarEvent {
  eventId: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string | null;
  attendees: string[];
  calendarName: string;
}

export interface EventKitBridgeInterface {
  /**
   * Search calendar events that match the ex's name or phone number.
   */
  searchEvents(
    name: string,
    phoneNumber: string,
    fromDate: string,
    toDate: string,
  ): Promise<CalendarEvent[]>;

  /**
   * Delete a calendar event by ID.
   */
  deleteEvent(eventId: string): Promise<void>;

  /**
   * Export event data as JSON (for vault storage).
   */
  exportEvent(eventId: string): Promise<string>;

  /**
   * Recreate a previously deleted event from exported JSON.
   * @returns New event ID
   */
  restoreEvent(eventJson: string): Promise<string>;

  /**
   * Request calendar access.
   */
  requestAccess(): Promise<boolean>;

  /**
   * Check current calendar authorization status without prompting.
   * Returns: 'authorized' | 'limited' | 'denied' | 'notDetermined'
   */
  getAuthorizationStatus(): Promise<string>;
}

const { EventKitModule } = NativeModules;

export default EventKitModule as EventKitBridgeInterface;
