package com.codebrew
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ContentResolver
import android.media.AudioAttributes
import android.net.Uri
import android.os.Bundle

import androidx.core.app.NotificationCompat

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.FacebookSdk
import com.facebook.appevents.AppEventsLogger
import org.devio.rn.splashscreen.SplashScreen // here

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this)
    super.onCreate(savedInstanceState)
  }
  override fun getMainComponentName(): String = "Runrun"
    /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
  DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
