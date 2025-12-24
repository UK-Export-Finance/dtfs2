/**
 * checks if the sign in OTP is still valid based on its expiry time
 * @param expiry - the expiry time of the OTP
 * @returns boolean indicating if the OTP is still valid
 */
export const isSignInOtpInDate = (expiry: number): boolean => Date.now() <= expiry;
