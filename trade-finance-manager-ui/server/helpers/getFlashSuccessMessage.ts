import { CustomExpressRequest } from '../types/custom-express-request';

/**
 * Retrieves the first success message from flash storage
 * @param req the request object
 * @return the first success message in flash storage
 */
export const getFlashSuccessMessage = (req: CustomExpressRequest<any>) => req.flash('successMessage')[0];
