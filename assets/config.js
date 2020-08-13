(() => {
  window.bellScheduleConfig = {
    schoolName: "Dublin High School",
    appName: "DHS Bell Schedule App",
    schoolColour: "#14415B",
    schoolIdentifier: "dublinHS",
  };
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyC6-1dfBuSDjhruDasTl5vExqOXcFHEfww",
    authDomain: "ubsa-fb.firebaseapp.com",
    databaseURL: "https://ubsa-fb.firebaseio.com",
    projectId: "ubsa-fb",
    storageBucket: "ubsa-fb.appspot.com",
    messagingSenderId: "295845474213",
    appId: "1:295845474213:web:7b008bb6a1f19580a7824c",
    measurementId: "G-64RLY1YP5M"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
})();
