import { salt } from './salt';
import { hash } from './hash';
import { PasswordHash } from '../../types';

/**
 * This function generates salt and hash from a string password.
 * Password should never be stored in any storage (databases or session) rather should hashed with a random salt.
 * @param password Password to use to create hash
 * @returns object containing both salt and hash as strings
 */
export const generatePasswordHash = (password: string): PasswordHash => {
  try {
    const generatedSalt = salt().toString('hex');
    const generatedHash = hash(password, generatedSalt);

    return {
      salt: generatedSalt,
      hash: generatedHash.toString('hex'),
    };
  } catch (error) {
    console.error('An error has occurred while generating password %o', error);
    return {
      salt: '',
      hash: '',
    };
  }
};
