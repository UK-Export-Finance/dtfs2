document.body.className = document.body.className ? `${document.body.className} js-enabled` : 'js-enabled';

const element = document.getElementById('tasks-filters');
if (element) {
  element.className = 'js-enabled';
}
