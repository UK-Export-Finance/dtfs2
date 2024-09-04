import { orderNumber } from '../../../utils/error-list-order-number';

const makerObject = (deal, errorList) => {
  const newErrorList = { ...errorList };
  const { bank, maker } = deal;

  if (!maker || !maker._id || !bank) {
    newErrorList.makerObject = {
      order: orderNumber(newErrorList),
      text: 'deal.maker object with bank is required',
    };
  }

  return newErrorList;
};

export default makerObject;
