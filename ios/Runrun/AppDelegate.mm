#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import "RNSplashScreen.h"  
#import <React/RCTLinkingManager.h> //deeplinking
#import <Firebase.h>
#import <GoogleMaps/GoogleMaps.h>
#import <GooglePlaces/GooglePlaces.h>
#import <CodePush/CodePush.h>
// AppDelegate.m
 
@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Runrun";
  if ([FIRApp defaultApp] == nil) {
     [FIRApp configure];
   }
     // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  //Pick xconfig values into Objective C files
  NSString *googlePlacesKey = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"PROJECT_GOOGLE_PLACE_KEY"];
  [GMSPlacesClient provideAPIKey:googlePlacesKey];
  [GMSServices provideAPIKey:googlePlacesKey];
  
//  [self documentsPathForFileName];
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

 - (BOOL)application:(UIApplication *)application
             openURL:(NSURL *)url
             options:(nonnull NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
 {
   [[FBSDKApplicationDelegate sharedInstance] application:application
                                                  openURL:url
                                                  options:options]
   || [RCTLinkingManager application:application openURL:url options:options];
   return YES;
 }

- (void)applicationWillEnterForeground:(UIApplication *)application{
  UIPasteboard *pb = [UIPasteboard generalPasteboard];
  [pb setValue:@"" forPasteboardType:UIPasteboardNameGeneral];
}


- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}
 
- (NSURL *)bundleURL
{
#if DEBUG
   return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
return [CodePush bundleURL];
#endif
}

//deeplinking

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}
@end
