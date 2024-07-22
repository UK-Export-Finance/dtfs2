import { to2Decimals } from '../../helpers/currency';
import { Amount } from '../types';

/**
 * @param amount Maximum liability when making an amendment, maps to targetAmount
 */
export const amountTransformation = (amount: Amount | undefined) => amount && { targetAmount: to2Decimals(amount) };
