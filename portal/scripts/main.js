import { initAll } from 'govuk-frontend';
import numericFloatInputs from './numeric-float-inputs';
import changeIndustryClasses from './change-industry-classes';
import '../styles/styles.scss';

const run = () => {
  initAll();
  numericFloatInputs();
  changeIndustryClasses();
};

run();

export default run;
