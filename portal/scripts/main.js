import '../styles/styles.scss';

import { decimalsCount } from '@ukef/dtfs2-common';

import { changeScreenVisibilityOfElement, showHideElement } from './show-hide-element';
import { changeIndustryClasses } from './change-industry-classes';
import { isNumeric, roundNumber } from './number';

export default {
  showHideElement,
  changeScreenVisibilityOfElement,
  isNumeric,
  decimalsCount,
  roundNumber,
  changeIndustryClasses,
};
