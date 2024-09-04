import { isNonEmptyString, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { orderNumber } from '../../../utils/error-list-order-number';

const facilityType = (facility, errorList) => {
  const newErrorList = { ...errorList };
  const type = facility?.type;

  if (!isNonEmptyString(type)) {
    newErrorList.type = {
      order: orderNumber(newErrorList),
      text: 'Enter the Facility type',
    };
  }

  if (isNonEmptyString(type)) {
    if (type !== FACILITY_TYPE.BOND && type !== FACILITY_TYPE.LOAN) {
      newErrorList.type = {
        order: orderNumber(newErrorList),
        text: 'Facility type must be Bond or Loan',
      };
    }
  }

  return newErrorList;
};

export default facilityType;
