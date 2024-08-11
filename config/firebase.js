// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
  addDoc,
  collection,
  getDocs,
  getDoc,
  where,
  query,
  onSnapshot,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDpZTehJgdTVlOnhUuQ5fOUThw1Xl8gYH8",
  authDomain: "e-commerce-e8968.firebaseapp.com",
  projectId: "e-commerce-e8968",
  storageBucket: "e-commerce-e8968.appspot.com",
  messagingSenderId: "1085605288073",
  appId: "1:1085605288073:web:d59a9a4baadd66f30d4e58",
  measurementId: "G-4BJTR1ZXRV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Your Firebase functions here...


function signInFirebase(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

async function signUpFirebase(userInfo) {
  const { email, password } = userInfo;

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await addUserToDb(userInfo, userCredential.user.uid);
}
function addUserToDb(userInfo, uid) {
  const { email, fullName, age } = userInfo;

  return setDoc(doc(db, "users", uid), { email, fullName, age });
}

function postAdToDb(title, price,description, imageUrl) {
  const userId = auth.currentUser.uid;
  return addDoc(collection(db, "ads"), { title, price,description, imageUrl, userId });
}

async function uploadImage(image) {
  const storageRef = ref(storage, `image/${image.name}`);
  const snapshot = await uploadBytes(storageRef, image);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}
async function getAdsFromDb() {
  const querySnapshot = await getDocs(collection(db, "ads"));
  const ads = [];
  querySnapshot.forEach((doc) => {
    ads.push({ id: doc.id, ...doc.data() });
  });
  return ads;
}
function getFirebaseAd(id) {
  const docRef = doc(db, "ads", id);
  return getDoc(docRef);
}

function getRealTimeAds(callback) {
  onSnapshot(collection(db, "ads"), (querySnapshot) => {
    const ads = [];

    querySnapshot.forEach((doc) => {
      ads.push({ id: doc.id, ...doc.data() });
    });
    callback(ads);
  });
}

async function checkChatroom(adUserId) {
  const userId = auth.currentUser.uid;

  const q = query(
    collection(db, "Chatroom"),
    where(`users.${userId}`, "==", true),
    where(`users.${adUserId}`, "==", true)
  );

  const querySnapshot = await getDocs(q);

  let room;
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    room = { id: doc.id, ...doc.data() };
  });
  return room;
}

function createChatroom(adUserId) {
  const userId = auth.currentUser.uid;
  const obj = {
    users: {
      [userId]: true,
      [adUserId]: true,
    },
    createdAt: Date.now(),
  };
  return addDoc(collection(db, "Chatroom"), obj);
}

function sendMessageToDb(text, chatRoomId) {
  const userId = auth.currentUser.uid;
  const message = { text, createdAt: new Date(Date.now()), userId: userId };
  return addDoc(
    collection(db, "Chatroom", `${chatRoomId}`, "messages"),
    message
  );
}

function getRealtimeMessages(chatRoomId) {
  const q = query(
    collection(db, "Chatroom", `${chatRoomId}`, "messages"),
    orderBy("createdAt")
  );
  onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    const messagesElem = document.getElementById("sentMessages");

    messagesElem.innerHTML = "";
    for (let item of messages) {
      if (item.userId == auth.currentUser.uid) {
        messagesElem.innerHTML += `<div class="txt-msg-style"><h4>${item.text}</h4></div>`;
      } else {
        messagesElem.innerHTML += `<div class="txt-msg-style-left"><h4 >${item.text}</h4></div>`;
      }
    }
  });
}

export {
  signInFirebase,
  signUpFirebase,
  postAdToDb,
  uploadImage,
  getAdsFromDb,
  getRealTimeAds,
  getFirebaseAd,
  createChatroom,
  checkChatroom,
  sendMessageToDb,
  getRealtimeMessages,
};
