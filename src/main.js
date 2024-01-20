import './style.css';
import BaseScene from './core/base-scene';
import { inject } from '@vercel/analytics';

inject();


// gapi.load('auth2', function() {
//   gapi.auth2.init({
//       client_id: '291331590559-g1o0cv5vmn15c4b6src0e8a5gugbd2e4.apps.googleusercontent.com',
//   }).then(() => {
//       // After the library is initialized, set up the sign-in button
//       // setUpSignInButton();
//   });
// });



const baseScene = new BaseScene();

document.addEventListener('onLoad', () => {
  baseScene.createGameScene();

  setTimeout(() => baseScene.afterAssetsLoaded(), 300);
});


window.handleCredentialResponse = (response) => {
  console.log(response);

}

function onSignIn(googleUser) {
  // Get user profile information
  var profile = googleUser.getBasicProfile();
  console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log("Name: " + profile.getName());
  console.log("Image URL: " + profile.getImageUrl());
  console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.

  // Display the name in your HTML
  // document.getElementById('name').innerText = "Hello, " + profile.getName();
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
}