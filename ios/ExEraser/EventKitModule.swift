import Foundation
import EventKit

/// Native module for calendar access via EventKit.
/// Handles searching, deleting, exporting, and restoring calendar events.
@objc(EventKitModule)
class EventKitModule: NSObject {

  private let eventStore = EKEventStore()

  private let dateFormatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime]
    return formatter
  }()

  /// Search calendar events matching the ex's name or phone number.
  /// Searches title, notes, location, and attendee names/URLs (case-insensitive).
  @objc func searchEvents(
    _ name: String,
    phoneNumber: String,
    fromDate: String,
    toDate: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let start = dateFormatter.date(from: fromDate),
          let end = dateFormatter.date(from: toDate) else {
      NSLog("[ExEraser][EventKit] searchEvents: invalid date format — from=\(fromDate), to=\(toDate)")
      reject("EVENTKIT_ERROR", "Invalid date format. Use ISO 8601.", nil)
      return
    }

    NSLog("[ExEraser][EventKit] searchEvents: name=<redacted>, phone=<redacted>, \(fromDate) → \(toDate)")

    let predicate = eventStore.predicateForEvents(withStart: start, end: end, calendars: nil)
    let events = eventStore.events(matching: predicate)

    let lowercaseName = name.lowercased()
    let normalizedPhone = phoneNumber.replacingOccurrences(of: "[^0-9+]", with: "", options: .regularExpression)

    var results: [[String: Any]] = []

    for event in events {
      var isMatch = false

      // Check title
      if let title = event.title, title.lowercased().contains(lowercaseName) {
        isMatch = true
      }

      // Check notes
      if !isMatch, let notes = event.notes, notes.lowercased().contains(lowercaseName) {
        isMatch = true
      }

      // Check location
      if !isMatch, let location = event.location, location.lowercased().contains(lowercaseName) {
        isMatch = true
      }

      // Check attendees by name and URL (phone number)
      if !isMatch, let attendees = event.attendees {
        for attendee in attendees {
          // Check attendee name
          if let attendeeName = attendee.name, attendeeName.lowercased().contains(lowercaseName) {
            isMatch = true
            break
          }

          // Check attendee URL for phone number
          if !normalizedPhone.isEmpty {
            let urlString = attendee.url.absoluteString.lowercased()
            let normalizedURL = urlString.replacingOccurrences(of: "[^0-9+]", with: "", options: .regularExpression)
            if normalizedURL.contains(normalizedPhone) {
              isMatch = true
              break
            }
          }
        }
      }

      if isMatch {
        let attendeeNames = event.attendees?.compactMap { $0.name } ?? []

        results.append([
          "eventId": event.eventIdentifier ?? "",
          "title": event.title ?? "",
          "startDate": dateFormatter.string(from: event.startDate),
          "endDate": dateFormatter.string(from: event.endDate),
          "location": event.location as Any,
          "attendees": attendeeNames,
          "calendarName": event.calendar.title,
        ])
      }
    }

    NSLog("[ExEraser][EventKit] searchEvents: found \(results.count) matching events out of \(events.count) total")
    resolve(results)
  }

  /// Delete a calendar event by ID.
  @objc func deleteEvent(
    _ eventId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    NSLog("[ExEraser][EventKit] deleteEvent: \(eventId)")

    guard let event = eventStore.event(withIdentifier: eventId) else {
      NSLog("[ExEraser][EventKit] deleteEvent: event not found — \(eventId)")
      reject("EVENTKIT_ERROR", "Event not found: \(eventId)", nil)
      return
    }

    do {
      try eventStore.remove(event, span: .thisEvent, commit: true)
      NSLog("[ExEraser][EventKit] deleteEvent: successfully deleted \(eventId)")
      resolve(nil)
    } catch {
      NSLog("[ExEraser][EventKit] deleteEvent: failed — \(error.localizedDescription)")
      reject("EVENTKIT_ERROR", "Failed to delete event: \(error.localizedDescription)", error)
    }
  }

  /// Export event data as JSON for vault storage.
  @objc func exportEvent(
    _ eventId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    NSLog("[ExEraser][EventKit] exportEvent: \(eventId)")

    guard let event = eventStore.event(withIdentifier: eventId) else {
      NSLog("[ExEraser][EventKit] exportEvent: event not found — \(eventId)")
      reject("EVENTKIT_ERROR", "Event not found: \(eventId)", nil)
      return
    }

    let attendeeNames = event.attendees?.compactMap { $0.name } ?? []
    let attendeeEmails = event.attendees?.compactMap { participant -> String? in
      let url = participant.url.absoluteString
      return url.hasPrefix("mailto:") ? String(url.dropFirst(7)) : nil
    } ?? []

    let eventData: [String: Any] = [
      "eventId": event.eventIdentifier ?? "",
      "title": event.title ?? "",
      "startDate": dateFormatter.string(from: event.startDate),
      "endDate": dateFormatter.string(from: event.endDate),
      "location": event.location ?? "",
      "notes": event.notes ?? "",
      "url": event.url?.absoluteString ?? "",
      "isAllDay": event.isAllDay,
      "calendarName": event.calendar.title,
      "attendeeNames": attendeeNames,
      "attendeeEmails": attendeeEmails,
      "recurrenceRules": event.recurrenceRules?.map { $0.description } ?? [],
      "timeZone": event.timeZone?.identifier ?? TimeZone.current.identifier,
    ]

    do {
      let jsonData = try JSONSerialization.data(withJSONObject: eventData, options: .prettyPrinted)
      guard let jsonString = String(data: jsonData, encoding: .utf8) else {
        reject("EVENTKIT_ERROR", "Failed to encode event JSON", nil)
        return
      }
      NSLog("[ExEraser][EventKit] exportEvent: exported \(eventId) — \(jsonData.count) bytes")
      resolve(jsonString)
    } catch {
      NSLog("[ExEraser][EventKit] exportEvent: JSON serialization failed — \(error.localizedDescription)")
      reject("EVENTKIT_ERROR", "Failed to serialize event: \(error.localizedDescription)", error)
    }
  }

  /// Recreate a previously deleted event from exported JSON.
  @objc func restoreEvent(
    _ eventJson: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // TODO: Phase 4 — deserialize JSON, create EKEvent
    NSLog("[ExEraser][EventKit] restoreEvent called — stub")
    resolve("")
  }

  /// Request calendar access.
  @objc func requestAccess(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    if #available(iOS 17.0, *) {
      eventStore.requestFullAccessToEvents { granted, error in
        if let error = error {
          NSLog("[ExEraser][EventKit] Access error: \(error.localizedDescription)")
          reject("CALENDAR_ERROR", error.localizedDescription, error)
          return
        }
        NSLog("[ExEraser][EventKit] Access granted: \(granted)")
        resolve(granted)
      }
    } else {
      eventStore.requestAccess(to: .event) { granted, error in
        if let error = error {
          reject("CALENDAR_ERROR", error.localizedDescription, error)
          return
        }
        resolve(granted)
      }
    }
  }

  /// Check current calendar authorization status without prompting the user.
  @objc func getAuthorizationStatus(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let status: String
    if #available(iOS 17.0, *) {
      let ekStatus = EKEventStore.authorizationStatus(for: .event)
      switch ekStatus {
      case .fullAccess: status = "authorized"
      case .writeOnly: status = "limited"
      case .denied: status = "denied"
      case .restricted: status = "denied"
      case .notDetermined: status = "notDetermined"
      @unknown default: status = "notDetermined"
      }
    } else {
      let ekStatus = EKEventStore.authorizationStatus(for: .event)
      switch ekStatus {
      case .authorized: status = "authorized"
      case .denied: status = "denied"
      case .restricted: status = "denied"
      case .notDetermined: status = "notDetermined"
      @unknown default: status = "notDetermined"
      }
    }
    NSLog("[ExEraser][EventKit] Authorization status: \(status)")
    resolve(status)
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
