import { APIM_GIFT_INTEGRATION } from '../constants';
import { decreaseAmount } from './decrease-amount';
import { increaseAmount } from './increase-amount';
import { replaceExpiryDate } from './replace-expiry-date';

const {
  AMENDMENT_TYPE: { DECREASE_AMOUNT, INCREASE_AMOUNT, REPLACE_EXPIRY_DATE },
} = APIM_GIFT_INTEGRATION;

export const amendFacility = {
  [DECREASE_AMOUNT]: decreaseAmount,
  [INCREASE_AMOUNT]: increaseAmount,
  [REPLACE_EXPIRY_DATE]: replaceExpiryDate,
};
