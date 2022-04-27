const {
  withInfoPlist,
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require("fs");
const path = require("path");

const CAMERA_USAGE = 'Allow $(PRODUCT_NAME) to use the camera';
const MIC_USAGE = 'Allow $(PRODUCT_NAME) to use the microphone';

const withTwilioVideoWebRTC = (
  config,
  { cameraUsagePermission, micUsagePermission } = {},
) => {
  // Add permissions to Info.plist
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
  });

  // Add permissions to AndroidManifest
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

    const existentPermissions = usesPermissions.map(permission => permission['$']['android:name']);
    const existentFeatures = usesFeatures.map(feature => feature['$']['android:name']);

    permissions.filter(permission => !existentPermissions.includes(permission)).forEach((permission) => {
      usesPermissions.push({
        $: {
          'android:name': permission
        }
      });
    });
    features.filter(feature => !existentFeatures.includes(feature)).forEach((feature) => {
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

  // Add rules to proguard-rules.pro
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "app/proguard-rules.pro"
      );
      const contents = fs.readFileSync(filePath, "utf-8");

      const rulesToAdd = [
        "-keep class org.webrtc.** { *; }",
        "-keep class com.twilio.** { *; }",
        "-keep class tvi.webrtc.** { *; }",
      ].filter(rule => !contents.includes(rule)).join("\n");

      if(rulesToAdd.length > 0) {
        fs.writeFileSync(filePath, `${contents}\n${rulesToAdd}\n`);
      }

      return config;
    },
  ]);

  return config;
};

module.exports = withTwilioVideoWebRTC;