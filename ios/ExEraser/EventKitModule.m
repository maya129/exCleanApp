#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(EventKitModule, NSObject)

RCT_EXTERN_METHOD(searchEvents:(NSString *)name
                  phoneNumber:(NSString *)phoneNumber
                  fromDate:(NSString *)fromDate
                  toDate:(NSString *)toDate
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deleteEvent:(NSString *)eventId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(exportEvent:(NSString *)eventId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(restoreEvent:(NSString *)eventJson
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestAccess:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAuthorizationStatus:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
