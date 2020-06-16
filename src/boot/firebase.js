import { firebase } from '@firebase/app';
import Vue from 'vue'
import VueFirestore from 'vue-firestore'

import "@firebase/firestore";
import '@firebase/storage'
import '@firebase/auth'


Vue.use(VueFirestore)

var firebaseConfig = {
  apiKey: "AIzaSyBi7jIQx3_8dtMPVDorzpas0e_xvq-yJYY",
  authDomain: "gsis-coop.firebaseapp.com",
  databaseURL: "https://gsis-coop.firebaseio.com",
  projectId: "gsis-coop",
  storageBucket: "gsis-coop.appspot.com",
  messagingSenderId: "888140950968",
  appId: "1:888140950968:web:ace39f50b75557ba22f34d",
  measurementId: "G-RXN150GV38"
}

// var firebaseConfig = {
//   apiKey: "AIzaSyD0gmGQfKy8A4QKEj-rlyUNkyabzXsCMm0",
//   authDomain: "new-gsis-cooperative.firebaseapp.com",
//   databaseURL: "https://new-gsis-cooperative.firebaseio.com",
//   projectId: "new-gsis-cooperative",
//   storageBucket: "new-gsis-cooperative.appspot.com",
//   messagingSenderId: "521222059409",
//   appId: "1:521222059409:web:454082d24204f860585630",
//   measurementId: "G-EDNPCJRJF2"
// }



// export const db = firebaseApp.firestore();

//  Initialize Firebase
 let firebaseApp = firebase.initializeApp(firebaseConfig);
 let firebaseAuth = firebaseApp.auth();
 let firebaseDb = firebaseApp.firestore();
 let firebaseSto = firebaseApp.storage();
 let firefirestore = firebase.firestore;


 //2nd app
//  let secondaryApp = firebase.initializeApp(firebaseConfig, "secondary");
//  let Auth2 = secondaryApp.auth();]

Vue.prototype.$firebase = firebase

 export { firebaseAuth, firebaseDb, firebaseSto, firefirestore, firebaseApp }
