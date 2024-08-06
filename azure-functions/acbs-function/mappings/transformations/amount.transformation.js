import { to2Decimals } from '../../helpers/currency';

/**
 * @param amount Maximum liability when making an amendment, maps to targetAmount
 */
export const amountTransformation = (amount) => amount && { targetAmount: to2Decimals(amount) };
