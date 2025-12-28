import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hairpro360.contentcalendar',
  appName: 'Content Calendar',
  webDir: 'dist/public',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true
    }
  }
};

export default config;
