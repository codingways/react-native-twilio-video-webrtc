const { withInfoPlist, withAndroidManifest } = require('@expo/config-plugins');

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
    const permissions = [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS'
    ];
    const features = [
      'android.hardware.camera',
      'android.hardware.camera.autofocus',
      'android.hardware.microphone'
    ];

    const usesPermissions = config.modResults.manifest['uses-permission'] || [];
    const usesFeatures = config.modResults.manifest['uses-feature'] || [];

    permissions.forEach((permission) => {
      usesPermissions.push({
        $: {
          'android:name': permission
        }
      });
    });
    features.forEach((feature) => {
      usesFeatures.push({
        $: {
          'android:name': feature,
          'android:required': 'false'
        }
      });
    });

    config.modResults.manifest['uses-permission'] = usesPermissions;
    config.modResults.manifest['uses-feature'] = usesFeatures;

    return config;
  });

  // Add TwilioVideo to Podfile

  return config;
};

module.exports = withTwilioVideoWebRTC;