import * as jose from 'jose'

window.handleCredentialResponse = (response) => {
  try {
    const decoded = jose.decodeJwt(response.credential);
    console.log(decoded);

  } catch (error) {
      console.error('Error decoding token:', error);
  }
}
