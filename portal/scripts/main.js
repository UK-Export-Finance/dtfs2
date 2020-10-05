import showHideElement from './show-hide-element';
import maskedInputs from './masked-inputs';
import changeIndustryClasses from './change-industry-classes';
import number from './number';
import '../styles/styles.scss';

const run = () => {
  showHideElement();
  maskedInputs();
  changeIndustryClasses();
  number();
};

run();

export default run;
