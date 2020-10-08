import {
  changeScreenVisibilityOfElement as changeScreenVisibilityOfElementFunc,
  showHideElement as showHideElementFunc,
} from './show-hide-element';
import {
  changeIndustryClasses as changeIndustryClassesFunc,
} from './change-industry-classes';
import {
  isNumeric as isNumericFunc,
  decimalsCount as decimalsCountFunc,
  roundNumber as roundNumberFunc,
} from './number';
import '../styles/styles.scss';
import { maskedInputs as maskedInputsFunc } from './masked-inputs';

export const showHideElement = showHideElementFunc;
export const changeScreenVisibilityOfElement = changeScreenVisibilityOfElementFunc;

export const isNumeric = isNumericFunc;
export const decimalsCount = decimalsCountFunc;
export const roundNumber = roundNumberFunc;

export const changeIndustryClasses = changeIndustryClassesFunc;

export const maskedInputs = maskedInputsFunc;

// export changeIndustryClasses;

// export default attachToWindow;
// export const run = () => {
//   console.log('run from library');
// };

// export run;

// module.exports = {
//   run: () => {
//     console.log('run from library');
//   },
//   changeIndustryClassesFunc: theChangeIndustryClassesFunc,
// };
