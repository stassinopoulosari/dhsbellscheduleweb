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
    appId: "1:295845474213:web:21950cd5122bd97ea7824c",
    measurementId: "G-PMQ5VDKHPS"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
})();
