import { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK } from '../../../constants';
import { SignInLinkGenerator } from './sign-in-link-generator.interface';
import CryptographicallyStrongGenerator from '../../../crypto/cryptographically-strong-generator';
import { PORTAL_UI_URL } from '../../../config/sign-in-link.config';
import { FailedToCreateSignInTokenError } from '../../errors';

export class EmailSignInLinkGenerator implements SignInLinkGenerator {
  #randomGenerator: CryptographicallyStrongGenerator;
  constructor({ randomGenerator }: { randomGenerator: CryptographicallyStrongGenerator }) {
    this.#randomGenerator = randomGenerator;
  }

  createSignInToken() {
    try {
      return this.#randomGenerator.randomHexString(SIGN_IN_LINK.TOKEN_BYTE_LENGTH);
    } catch (error) {
      throw new FailedToCreateSignInTokenError();
    }
  }

  createUserFacingSignInTokenFromSignInToken(signInToken: string) {
    return `${PORTAL_UI_URL}/login/sign-in-link?t=${signInToken}`;
  }

  getSignInLinkEmailTemplateId() {
    return EMAIL_TEMPLATE_IDS.SIGN_IN_LINK_EMAIL_LINK;
  }
}
