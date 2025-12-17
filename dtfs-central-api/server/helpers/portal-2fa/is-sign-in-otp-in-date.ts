export const isSignInOtpInDate = (expiry: number): boolean => Date.now() <= expiry;
