/**
 * Type use for user profile password attributes.
 * @property salt for storing password randonly generated salt as a string
 * @property hash for storing password hash as a string
 */
export type PasswordHash = {
  salt: string;
  hash: string;
};
