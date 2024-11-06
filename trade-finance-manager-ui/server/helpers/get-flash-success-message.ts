import { Request } from 'express';

/**
 * Retrieves the first success message from flash storage
 * @param req the express request object
 * @return the first success message in flash storage
 */
export const getFlashSuccessMessage = (req: Request): string | undefined => req.flash('successMessage')[0];
