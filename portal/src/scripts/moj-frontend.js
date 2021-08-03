import $ from 'jquery';
import { initAll } from '@ministryofjustice/frontend';

const init = () => {
  window.$ = $;

  initAll();
};

export default init();
