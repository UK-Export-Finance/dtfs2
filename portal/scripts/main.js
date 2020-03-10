import { initAll } from 'govuk-frontend'
import numericFloatInputs from './numeric-float-inputs';
import '../styles/styles.scss';

const run = () => {
  initAll();
  numericFloatInputs();
}

run();

export default run;
