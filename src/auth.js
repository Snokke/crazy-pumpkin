import * as jose from 'jose'
import SaveManager from './core/save-manager';

window.handleCredentialResponse = (response) => {
  try {
    const decoded = jose.decodeJwt(response.credential);
    console.log(decoded);

    SaveManager.getInstance().emailData = decoded.email;

  } catch (error) {
      console.error('Error decoding token:', error);
  }
}
