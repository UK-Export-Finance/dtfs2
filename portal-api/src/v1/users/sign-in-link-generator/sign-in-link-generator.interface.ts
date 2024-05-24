export interface SignInLinkGenerator {
  createSignInToken(): string;
  createSignInArtifactFromSignInToken(signInToken: string): string;
  getSignInLinkEmailTemplateId(): string;
}
