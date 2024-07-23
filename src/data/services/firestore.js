import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  serverTimestamp,
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

export const userInfoRef = (user) => doc(db, "users", user.uid);


// save filters
export const writeFiltersToDB = async (user, folderId, filters) => {
  await setDoc(doc(db, "users", user.uid, "folders", folderId, "filters", "selected"), {
    filters,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

// read filters
export const readFiltersFromDB = async (user, folderId) => {
  const docRef = doc(db, "users", user.uid, "folders", folderId, "filters", "selected");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().filters;
  } else {
    return { "customRegex": "", "searchInTitle": false, "searchKeywords": [], "excludeKeywords": [], "useRegex": false, "exactMatch": false };
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






// Function to add folder to DB
export const addFolderToDB = async (user, folder) => {
  const foldersCollection = collection(db, `users/${user.uid}/folders`);
  const docRef = await addDoc(foldersCollection, { ...folder, isSelected: true });
  return docRef.id; // Returns the id of the created document
};

// Function to update folder selection status in DB
export const updateFolderInDB = async (user, folderId, isSelected) => {
  const folderDoc = doc(db, `users/${user.uid}/folders/${folderId}`);
  await updateDoc(folderDoc, { isSelected });
};

// Function to get folders from DB
export const getFoldersFromDB = async (user) => {
  const foldersCollection = collection(db, `users/${user.uid}/folders`);
  const folderSnapshot = await getDocs(foldersCollection);
  return folderSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})); // Returns array of folders
};

// Function to delete folder from DB
export const deleteFolderFromDB = async (user, folderId) => {
  const folderDocRef = doc(db, `users/${user.uid}/folders/${folderId}`);

  // Attempt to delete all documents in the specified subcollections
  for (const subCollection of ['filters', 'feeds']) {
    const subCollectionRef = collection(folderDocRef, subCollection);
    const subCollectionSnapshot = await getDocs(subCollectionRef);
    await Promise.all(subCollectionSnapshot.docs.map(doc => deleteDoc(doc.ref)));
  }

  // Delete the root folder document
  await deleteDoc(folderDocRef);
};









// save selected feeds id
export const writeSelectedFeedsToDB = async (user, folderId, id_list) => {
  await setDoc(doc(db, "users", user.uid, "folders", folderId, "feeds", "selected"), {
    id_list: id_list,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

// read selected feeds id
export const readSelectedFeedsFromDB = async (user, folderId) => {
  const docRef = doc(db, "users", user.uid, "folders", folderId, "feeds", "selected");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().id_list;
  } else {
    return [];
  }
}

// write custom feeds
export const writeCustomFeedsToDB = async (user, folderId, feeds) => {
  await setDoc(doc(db, "users", user.uid, "folders", folderId, "feeds", "custom"), {
    feeds,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

// read custom feeds
export const readCustomFeedsFromDB = async (user, folderId) => {
  const docRef = doc(db, "users", user.uid, "folders", folderId, "feeds", "custom");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().feeds;
  } else {
    return [];
  }
};









// admin paying users
export const fetchUsers = async () => {
  const userCollection = collection(db, 'paying-users-info');
  const userSnapshot = await getDocs(userCollection);
  return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}));
};
export const toggleUserStatus = async (email, isPayingUser) => {
  const userDoc = doc(db, 'paying-users-info', email);
  await updateDoc(userDoc, { isPayingUser: !isPayingUser });
};
export const addUser = async (newEmail) => {
  const userDoc = doc(db, 'paying-users-info', newEmail);
  await setDoc(userDoc, { email: newEmail, isPayingUser: true });
};
export const deleteUser = async (email) => {
  const userDoc = doc(db, 'paying-users-info', email);
  await deleteDoc(userDoc);
};
// admin email domains
export const fetchDomains = async () => {
  const docRef = doc(db, 'email-domains-access', 'email-domains-access');
  const docSnap = await getDoc(docRef);
  return docSnap.data().domains;
}
export const addDomain = async (domains, newDomain) => {
  const docRef = doc(db, 'email-domains-access', 'email-domains-access');
  await updateDoc(docRef, { domains: [...domains, newDomain] });
};
export const deleteDomain = async (domains, domain) => {
  const docRef = doc(db, 'email-domains-access', 'email-domains-access');
  await updateDoc(docRef, { domains: domains.filter(d => d !== domain) });
};