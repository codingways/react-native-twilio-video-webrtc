const { withEntitlementsPlist, withInfoPlist, withAndroidManifest } = require('@expo/config-plugins');

const CAMERA_USAGE = 'Allow $(PRODUCT_NAME) to use the camera';
const MIC_USAGE = 'Allow $(PRODUCT_NAME) to use the microphone';

const withTwilioVideoWebRTC = (
  config,
  { cameraUsagePermission, micUsagePermission, jumboMode, addProguardRules } = {},
) => {
  // Add permissions
  config = withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      cameraUsagePermission ||
      config.modResults.NSCameraUsageDescription ||
      CAMERA_USAGE;

    config.modResults.NSMicrophoneUsageDescription =
      micUsagePermission ||
      config.modResults.NSMicrophoneUsageDescription ||
      MIC_USAGE;

    return config;
  })

  config = withAndroidManifest(config, (config) => {
    config.modResults.usesPermissions = config.modResults.usesPermissions || [];
    config.modResults.usesPermissions.push('android.permission.CAMERA');
    config.modResults.usesPermissions.push('android.permission.MODIFY_AUDIO_SETTINGS');
    config.modResults.usesPermissions.push('android.permission.RECORD_AUDIO');

    config.modResults.usesFeatures = config.modResults.usesFeatures || [];
    config.modResults.usesFeatures.push({
      $: {
        'android:name': 'android.hardware.camera',
        'android:required': 'false',
      }
    });
    config.modResults.usesFeatures.push({
      $: {
        'android:name': 'android.hardware.camera.autofocus',
        'android:required': 'false',
      }
    });
    config.modResults.usesFeatures.push({
      $: {
        'android:name': 'android.hardware.microphone',
        'android:required': 'false',
      }
    });

    return config;
  });

  // Add TwilioVideo to Podfile

  return config;
};

module.exports = withTwilioVideoWebRTC;