import { Request } from 'express';

/**
 * Retrieves the first success message from flash storage
 * @param flash the request flash method
 * @return the first success message in flash storage
 */
export const getFlashSuccessMessage = (flash: Request['flash']) => flash('successMessage')[0];
