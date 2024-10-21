document.body.className += ` js-enabled${'noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : ''}`;

const element = document.getElementById('tasks-filters');

if (element) {
  element.className = 'js-enabled';
}
