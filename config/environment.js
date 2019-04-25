var environments = {
  staging: {
    FIREBASE_API_KEY: "AIzaSyA-VKLx_nxiHbNjMZN1DLVJmoAppreNSN0",
    FIREBASE_AUTH_DOMAIN: "compact-env-236520.firebaseapp.com",
    FIREBASE_DATABASE_URL: "https://compact-env-236520.firebaseio.com",
    FIREBASE_PROJECT_ID: "compact-env-236520",
    FIREBASE_STORAGE_BUCKET: "compact-env-236520.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "144414055124",
  },
  production: {
    // Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
  }
};
function getReleaseChannel() {
  let releaseChannel = Expo.Constants.manifest.releaseChannel;
  if (releaseChannel === undefined) {
    return "staging";
  } else if (releaseChannel === "staging") {
    return "staging";
  } else {
    return "staging";
  }
}
function getEnvironment(env) {
  console.log("Release Channel: ", getReleaseChannel());
  return environments[env];
}
var Environment = getEnvironment(getReleaseChannel());
export default Environment;