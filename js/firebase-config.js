// Firebase Configuration for Tracepad
const firebaseConfig = {
  apiKey: "AIzaSyD-QHNtfjvo45pFnOOxZIiSUjLeT6mwBxo",
  authDomain: "tracepad.firebaseapp.com",
  projectId: "tracepad",
  storageBucket: "tracepad.firebasestorage.app",
  messagingSenderId: "44609346302",
  appId: "1:44609346302:web:bbf087d8be2066c47b63af"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence for Firestore
db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
  if (err.code === "failed-precondition") {
    console.warn("Multiple tabs open, persistence enabled in primary tab only.");
  } else if (err.code === "unimplemented") {
    console.warn("Browser doesn't support offline persistence.");
  }
});
