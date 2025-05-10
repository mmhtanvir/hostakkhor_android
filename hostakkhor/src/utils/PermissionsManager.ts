import { Platform, PermissionsAndroid } from 'react-native';

interface PermissionResult {
  granted: boolean;
  error?: string;
}

export class PermissionsManager {
  static async requestMediaPermissions(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return { granted: true };
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(results).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED
      );

      return {
        granted: allGranted,
        error: allGranted ? undefined : 'Some permissions were denied'
      };
    } catch (error) {
      return {
        granted: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async requestAudioPermissions(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return { granted: true };
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Audio Recording Permission',
          message: 'App needs access to your microphone to record audio.',
          buttonPositive: 'Grant Permission',
        }
      );

      return {
        granted: granted === PermissionsAndroid.RESULTS.GRANTED,
        error: granted === PermissionsAndroid.RESULTS.GRANTED ? undefined : 'Audio permission denied'
      };
    } catch (error) {
      return {
        granted: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}