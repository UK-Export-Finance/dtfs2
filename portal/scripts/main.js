import { initAll } from 'govuk-frontend';
import showHideElement from './show-hide-element';
import numericFloatInputs from './numeric-float-inputs';
import changeIndustryClasses from './change-industry-classes';
import number from './number';
import '../styles/styles.scss';

const run = () => {
  initAll();
  showHideElement();
  numericFloatInputs();
  changeIndustryClasses();
  number();
};

run();

export default run;
