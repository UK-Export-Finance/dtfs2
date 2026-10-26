import $ from 'jquery';
import * as MOJFrontend from '@ministryofjustice/frontend';

const init = () => {
  window.$ = $;

  MOJFrontend.initAll();

  window.MOJFrontend = MOJFrontend;
};

export default init();
