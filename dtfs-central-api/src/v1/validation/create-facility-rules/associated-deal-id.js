import { isNonEmptyString } from '@ukef/dtfs2-common';
import { orderNumber } from '../../../utils/error-list-order-number';

const associatedDealId = (facility, errorList) => {
  const newErrorList = { ...errorList };
  const dealId = facility?.dealId;

  if (!isNonEmptyString(dealId)) {
    newErrorList.dealId = {
      order: orderNumber(newErrorList),
      text: 'Enter the Associated deal id',
    };
  }

  return newErrorList;
};

export default associatedDealId;
