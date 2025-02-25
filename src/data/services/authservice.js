import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider 
} from "firebase/auth";
import { addUserToDb } from "./firestore";

const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
export const auth = getAuth();

export const signUp = async (email, password, name, userName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await addUserToDb(user, name, userName);
  await sendEmailVerification(user);
  await signOut(auth);
};
export const signIn = async (email, password) =>
  await signInWithEmailAndPassword(auth, email, password);


export const resetPassword = async (email) => {
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
};

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.warn(error);
    alert(error.code.replace("auth/", ""));
  }
};

export const signWithMicrosoft = async () => {
  try {
    await signInWithPopup(auth, microsoftProvider);
  } catch (error) {
    console.warn(error);
    alert(error.code.replace("auth/", ""));
  }
};

export const logOut = () => signOut(auth);
