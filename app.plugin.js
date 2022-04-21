/*
iOS

 - Add this package to your Podfile

  pod 'react-native-twilio-video-webrtc', path: '../node_modules/react-native-twilio-video-webrtc'

 - To enable camera usage and microphone usage you will need to add the following entries to your Info.plist file:

  <key>NSCameraUsageDescription</key>
  <string>Your message to user when the camera is accessed for the first time</string>
  <key>NSMicrophoneUsageDescription</key>
  <string>Your message to user when the microphone is accessed for the first time</string>

Android

  - Add the library to your settings.gradle file:

  include ':react-native-twilio-video-webrtc'
  project(':react-native-twilio-video-webrtc').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-twilio-video-webrtc/android')

  - And include the library in your dependencies in android/app/build.gradle:

  dependencies {
      .....
      .....
      .....
      compile project(':react-native-twilio-video-webrtc')
  }

  - Now you're ready to load the package in MainApplication.java. In the imports section, add this:

  import com.twiliorn.library.TwilioPackage;

  - Then update the getPackages() method:

  protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          ...
          new TwilioPackage()
      );
  }

  - Permissions
  - For most applications, you'll want to add camera and audio permissions to your AndroidManifest.xml file:

  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
  <uses-feature android:name="android.hardware.microphone" android:required="false" />

  - Additional Tips
  - Under default settings, the Android build will fail if the total number of symbols exceeds a certain threshold. If you should encounter this issue when adding this library (e.g., if your build fails with com.android.dex.DexIndexOverflowException), you can turn on jumbo mode by editing your app/build.gradle:

  android {
    ...
    dexOptions {
      jumboMode true
    }
  }
  
  - If you are using proguard (very likely), you will also need to ensure that the symbols needed by this library are not stripped. To do that, add these two lines to proguard-rules.pro:

  -keep class org.webrtc.** { *; }
  -keep class com.twilio.** { *; }
  -keep class tvi.webrtc.** { *; }
*/

const {
  withInfoPlist,
  withAndroidManifest,
  withAppBuildGradle,
  withSettingsGradle,
  withDangerousMod,
} = require('@expo/config-plugins');
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");
const fs = require("fs");
const path = require("path");

const CAMERA_USAGE = 'Allow $(PRODUCT_NAME) to use the camera';
const MIC_USAGE = 'Allow $(PRODUCT_NAME) to use the microphone';

// Helper function to replace text in AppDelegate etc. by target anchors in the text, making it more robust
// when new native modules are installed as the text is always inserted as specified before / after the anchors
function InsertLinesHelper(insert, target, contents, offset = 1, replace = 0) {
  // Check that what you want to insert does not already exist
  if (!contents.includes(insert)) {
    const array = contents.split("\n");

    let newArray = [];

    if (target == "start") {
      newArray = [...array.slice(0, 1), insert, ...array.slice(1)];
    } else if (target == "end") {
      newArray = [...array, insert];
    } else {
      // Find the index of the target text you want to anchor your insert on
      let index = array.findIndex((str) => {
        return str.includes(target);
      });

      // Insert the wanted text around this anchor (i.e. offset / replace options)
      newArray = [
        ...array.slice(0, index + offset),
        insert,
        ...array.slice(index + offset + replace),
      ];
    }

    return newArray.join("\n");
  } else {
    return contents;
  }
}

const withTwilioVideoWebRTC = (
  config,
  { cameraUsagePermission, micUsagePermission, addJumboMode } = {},
) => {
  // Add package to Podfile
  /*config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      const contents = fs.readFileSync(filePath, "utf-8");

      const addTwilioVideo = mergeContents({
        tag: "react-native-twilio-video-webrtc",
        src: contents,
        newSrc: `  pod 'react-native-twilio-video-webrtc', path: '../node_modules/react-native-twilio-video-webrtc'`,
        anchor: /use_react_native!\(/i,
        offset: 0,
        comment: "#",
      });

      if (!addTwilioVideo.didMerge) {
        console.log(
          "ERROR: Cannot add react-native-twilio-video-webrtc to the project's ios/Podfile because it's malformed. Please report this with a copy of your project Podfile."
        );
        return config;
      }

      fs.writeFileSync(filePath, addTwilioVideo.contents);

      return config;
    },
  ]);*/

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

  // Add package to settings.gradle
  /*config = withSettingsGradle(config, (config) => {
    const addTwilioVideo = mergeContents({
      tag: "react-native-twilio-video-webrtc",
      src: config.modResults.contents,
      newSrc: "\ninclude ':react-native-twilio-video-webrtc'\nproject(':react-native-twilio-video-webrtc').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-twilio-video-webrtc/android')\n",
      anchor: "include ':app'",
      offset: 0,
      comment: "//",
    });

    if (!addTwilioVideo.didMerge) {
      console.log(
        `ERROR: Cannot add react-native-twilio-video-webrtc to the project's ${config.modResults.path} because it's malformed. Please report this with a copy of your project ${config.modResults.path}.` 
      );
      return config;
    }

    config.modResults.contents = addTwilioVideo.contents;

    return config;
  });*/

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

  // Add jumboMode to build.gradle
  /*if(addJumboMode) {
    config = withAppBuildGradle(config, (config) => {
      const buildGradle = config.modResults.buildGradle;
      const jumboMode = `
        jumboMode {
          enabled = true
        }
      `;

      buildGradle.push(jumboMode);

      return config;
    });
  }*/

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