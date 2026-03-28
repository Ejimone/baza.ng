import Constants from "expo-constants";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { Platform } from "react-native";
import { auth } from "../config/firebase";

const WEB_CLIENT_ID =
  "30504101922-dh38e0b7qk1jllfud4k5hfeg7vqufam9.apps.googleusercontent.com";

const IOS_CLIENT_ID =
  "30504101922-hsleh13ueea8ve44nbndq7q3t9s9bjp0.apps.googleusercontent.com";

/** True when running in Expo Go. Google Sign-In requires a dev build. */
const isExpoGo =
  Constants.executionEnvironment === "storeClient" ||
  Constants.appOwnership === "expo";

/**
 * Google Sign-In requires native code — does not work in Expo Go.
 * In Expo Go, we throw immediately without importing the module to avoid crash.
 */
export async function signInWithGoogle(): Promise<User> {
  if (isExpoGo) {
    throw new Error(
      "GOOGLE_SIGNIN_EXPO_GO: " +
        "Google Sign-In requires a development build. Use Email or Phone sign-in, or run: npx expo run:android",
    );
  }

  const { GoogleSignin } =
    await import("@react-native-google-signin/google-signin");

  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    offlineAccess: true,
  });

  // Ensure chooser appears on every attempt instead of silently reusing a cached Google account.
  try {
    const hasPrevious = await GoogleSignin.hasPreviousSignIn();
    if (hasPrevious) {
      await GoogleSignin.signOut();
    }
  } catch {
    // Best effort only; continue to sign-in flow.
  }

  // hasPlayServices is Android-specific; skip on iOS to avoid native issues.
  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices();
  }
  const signInResult = await GoogleSignin.signIn();
  const idToken =
    (signInResult as any)?.data?.idToken ?? (signInResult as any)?.idToken;
  if (!idToken) {
    throw new Error("Google sign-in was cancelled or failed");
  }
  const credential = GoogleAuthProvider.credential(idToken);
  const { user } = await signInWithCredential(auth, credential);
  return user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function getIdToken(user: User): Promise<string> {
  return user.getIdToken();
}

export async function signOut(): Promise<void> {
  await auth.signOut();

  // Also clear native Google session so next sign-in shows account picker.
  if (isExpoGo) {
    return;
  }

  try {
    const { GoogleSignin } =
      await import("@react-native-google-signin/google-signin");

    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
      offlineAccess: true,
    });

    await GoogleSignin.signOut();
    try {
      await GoogleSignin.revokeAccess();
    } catch {
      // Revoke may fail if there is no active Google session.
    }
  } catch {
    // Ignore Google native sign-out failures; Firebase sign-out already happened.
  }
}
