import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"

let splashHidden = false

/**
 * Ensures the Expo splash screen is dismissed once the JavaScript
 * runtime has mounted. This prevents the native splash from overlapping
 * our custom navigation-based splash UX.
 */
export const useFrameworkReady = () => {
  useEffect(() => {
    const hideSplash = async () => {
      if (splashHidden) return

      try {
        await SplashScreen.hideAsync()
      } catch {
        // On web or older runtimes hideAsync can throw when the splash
        // screen API is unavailable – we can safely ignore that scenario.
      } finally {
        splashHidden = true
      }
    }

    hideSplash()
  }, [])
}

