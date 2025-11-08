// Capacitor Permissions Utility
// This file handles camera and microphone permissions for both web and mobile

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    // For web browsers
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      // Stop the stream after checking permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    // For web browsers
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      // Stop the stream after checking permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Microphone permission error:', error);
    return false;
  }
};

export const requestAllPermissions = async (): Promise<{
  camera: boolean;
  microphone: boolean;
}> => {
  const cameraGranted = await requestCameraPermission();
  const microphoneGranted = await requestMicrophonePermission();

  console.log('Camera permission:', cameraGranted ? 'Granted' : 'Denied');
  console.log('Microphone permission:', microphoneGranted ? 'Granted' : 'Denied');

  return {
    camera: cameraGranted,
    microphone: microphoneGranted
  };
};

// For Capacitor mobile apps, you can extend this with:
/*
import { Camera } from '@capacitor/camera';
import { Microphone } from '@capacitor/microphone';

export const requestCapacitorPermissions = async () => {
  try {
    const cameraPermission = await Camera.checkPermissions();
    if (cameraPermission.camera !== 'granted') {
      await Camera.requestPermissions();
    }

    // Note: Microphone permission is handled by getUserMedia in Capacitor
    
    return true;
  } catch (error) {
    console.error('Capacitor permission error:', error);
    return false;
  }
};
*/
