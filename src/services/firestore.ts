import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  Timestamp,
  collection,
  CollectionReference,
  DocumentData,
  doc,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  FirestoreError,
  QuerySnapshot,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

// This is just a helper to add the type to the db responses
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(firestore, collectionName) as CollectionReference<T>;
};

// Import all your model types
export interface Thing {
  created: Timestamp;
  content: string;
}

export type ThingWithId = Thing & {
  id: string;
};

// export all your collections
export const thingsCol = createCollection<Thing>('things');

export const getThings = () => {
  return getDocs(thingsCol);
};

export const onThingsUpdate = (
  onNext: (snapshot: QuerySnapshot<Thing>) => void,
  onError?: (error: FirestoreError) => void,
) => {
  const thingsQueryOrderedByDate = query(thingsCol, orderBy('created'));
  return onSnapshot(thingsQueryOrderedByDate, onNext, onError);
};

export const addThing = (thingText: string) => {
  addDoc(thingsCol, {
    content: thingText,
    created: serverTimestamp(),
  });
};

export const deleteThing = async (thingId: string) => {
  const thingReference = doc(thingsCol, thingId);
  await deleteDoc(thingReference);
};

const editThing = async (thingId: string, newThingContent: string) => {
  const thingReference = doc(thingsCol, thingId);
  await updateDoc(thingReference, { content: newThingContent });
};

export default {
  editThing,
};
