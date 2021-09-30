import $ from 'jquery';
import MOJFrontend, { initAll } from '@ministryofjustice/frontend';

const init = () => {
  window.$ = $;

  initAll();

  window.MOJFrontend = MOJFrontend;
};

export default init();
