import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Estore } from '../../interfaces';

/**
 * A type that extends the {@link CustomExpressRequest} type to include a specific request body.
 *
 * This type specifies that the request body (`reqBody`) should conform to the {@link Estore} interface.
 */
export type EstoreRequest = CustomExpressRequest<{
  reqBody: Estore;
}>;

/**
 * Represents a category in the e-store.
 *
 * Possible values for this type are:
 * - 'sites'
 * - 'buyer'
 * - 'deals'
 * - 'terms/facilities'
 * - 'documents'
 *
 * This type is used to specify valid categories within the e-store.
 */
export type Category = 'sites' | 'buyer' | 'deals' | 'terms/facilities' | 'documents';
