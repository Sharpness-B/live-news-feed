import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { addProfile } from "./firebaseStorage";
const db = getFirestore();
export const addUserToDb = async (user, name, userName) => {
  await setDoc(doc(db, "users", user.uid), {
    created_At: serverTimestamp(),
    name: name,
    userName: userName,
  });
};

export const updateUser = async (user, name, userName, about, profile) => {
  let url;
  if (!!profile) {
    url = await addProfile(user, profile);
  }
  await setDoc(
    doc(db, "users", user.uid),
    url !== undefined
      ? {
          name: name,
          userName: userName,
          about: about,
          photoURL: url,
          updatedAt: serverTimestamp(),
        }
      : {
          name: name,
          userName: userName,
          about: about,
          updatedAt: serverTimestamp(),
        }
  );
};

export const updateNoteByNoteId = async (user, noteId, noteObj) => {
  await updateDoc(doc(db, "users", user.uid, "notes", noteId), noteObj);
};

export const removeNoteByNoteId = async (user, noteId) => {
  await deleteDoc(doc(db, "users", user.uid, "notes", noteId));
};

export const addNoteToDb = async (user, heading, note, tags) => {
  await addDoc(collection(db, "users", user.uid, "notes"), {
    heading: heading,
    note: note,
    tags: tags,
    createdAt: serverTimestamp(),
  });
};

export const notesRef = (user) =>
  query(
    collection(db, "users", user.uid, "notes"),
    orderBy("createdAt", "desc")
  );
export const noteDetailsRef = (user, noteId) =>
  doc(db, "users", user.uid, "notes", noteId);
export const userInfoRef = (user) => doc(db, "users", user.uid);


///////////////
// New stuff //
///////////////

// save selected feeds id
export const writeSelectedFeedsToDB = async (user, id_list) => {
  await setDoc(doc(db, "users", user.uid, "feeds", "selected"), {
    id_list: id_list,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

// read selected feeds id
export const readSelectedFeedsFromDB = async (user) => {
  const docRef = doc(db, "users", user.uid, "feeds", "selected");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().id_list;
  } else {
    return [];
  }
}





// write custom feeds
export const writeCustomFeedsToDB = async (user, feeds) => {
  await setDoc(doc(db, "users", user.uid, "feeds", "custom"), {
    feeds,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

// read custom feeds
export const readCustomFeedsFromDB = async (user) => {
  const docRef = doc(db, "users", user.uid, "feeds", "custom");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().feeds;
  } else {
    return [];
  }
};





// save filters
export const writeFiltersToDB = async (user, filters) => {
  await setDoc(doc(db, "users", user.uid, "filters", "selected"), {
    filters,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

// read filters
export const readFiltersFromDB = async (user) => {
  const docRef = doc(db, "users", user.uid, "filters", "selected");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().filters;
  } else {
    return { keywords: [], endDate: '' };
  }
};




// read if user is paying user
export const readIsPayingUser = async (user) => {
  const docRef = doc(db, "paying-users-info", user.email);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().isPayingUser;
  } else {
    return false;
  }
};