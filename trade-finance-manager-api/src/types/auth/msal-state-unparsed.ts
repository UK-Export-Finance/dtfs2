/**
 * Represents the unparsed state parameter for MSAL.
 * This is a base 64 encoded string that contains the state information.
 * When parsed, returns an object.
 * Used to pass state through the MSAL authentication process.
 */
export type MsalStateUnparsed = string;
