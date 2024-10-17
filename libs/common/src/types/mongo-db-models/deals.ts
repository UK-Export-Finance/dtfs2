import { AnyObject } from '../any-object';

/**
 * Type of the mongo db "deal" collection
 *
 * This type is incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = AnyObject & {
  ukefDealId: string;
};
