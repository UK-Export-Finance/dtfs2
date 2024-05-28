export interface SignInLinkGenerator {
  createSignInToken(): string;
  createUserFacingSignInTokenFromSignInToken(signInToken: string): string;
  getSignInLinkEmailTemplateId(): string;
}
