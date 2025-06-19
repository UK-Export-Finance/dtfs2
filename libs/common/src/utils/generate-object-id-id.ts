import { ObjectId } from 'mongodb';

/**
 * Generates a new MongoDB ObjectId.
 * @returns A new ObjectId instance.
 */
export const generateObjectIdId = () => new ObjectId();
