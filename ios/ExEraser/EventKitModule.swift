import Foundation
import EventKit

/// Native module for calendar access via EventKit.
/// Handles searching, deleting, exporting, and restoring calendar events.
@objc(EventKitModule)
class EventKitModule: NSObject {

  private let eventStore = EKEventStore()

  /// Search calendar events matching the ex's name or phone number.
  @objc func searchEvents(
    _ name: String,
    phoneNumber: String,
    fromDate: String,
    toDate: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // TODO: Phase 2 — EKEventStore predicateForEvents + filter by attendee/title
    NSLog("[ExEraser][EventKit] searchEvents called — stub")
    resolve([])
  }

  /// Delete a calendar event by ID.
  @objc func deleteEvent(
    _ eventId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // TODO: Phase 2 — eventStore.remove(event, span: .thisEvent)
    NSLog("[ExEraser][EventKit] deleteEvent called — stub")
    resolve(nil)
  }

  /// Export event data as JSON for vault storage.
  @objc func exportEvent(
    _ eventId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // TODO: Phase 2 — serialize EKEvent to JSON
    NSLog("[ExEraser][EventKit] exportEvent called — stub")
    resolve("{}")
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

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
