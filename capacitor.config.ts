import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.hackernews.pg',
  appName: 'HN by PG',
  webDir: 'dist',
  backgroundColor: '#0a0a0a',
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0a',
      overlaysWebView: false,
    },
  },
}

export default config
