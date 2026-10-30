import jquery from 'jquery';
import MOJFrontend, { initAll } from '@ministryofjustice/frontend';

const init = () => {
  window.$ = jquery;

  initAll();

  window.MOJFrontend = MOJFrontend;
};

init();
