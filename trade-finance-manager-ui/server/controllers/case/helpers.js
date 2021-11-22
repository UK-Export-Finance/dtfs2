const getGroup = (groupId, allTasks) =>
  allTasks.find((group) => group.id === groupId);

const getTask = (groupId, taskId, tasks) => {
  const group = getGroup(groupId, tasks);

  if (group) {
    const task = group.groupTasks.find((t) => t.id === taskId);

    if (!task) {
      return null;
    }

    return task;
  }

  return null;
};


// Checks to see if an element is an object or not
const isObject = (el) => typeof el === 'object' && el !== null && !(el instanceof Array);

/*
  Maps through validation errors = require( the server and returns i)t
  so both Summary Error component and field component
  can display the error messages correctly.
*/
const validationErrorHandler = (errs, href = '') => {
  const errorSummary = [];
  const fieldErrors = {};

  if (!errs) { return false; }

  const errors = isObject(errs) ? [errs] : errs;

  errors.forEach((el) => {
    errorSummary.push({
      text: el.errMsg,
      href: `${href}#${el.errRef}`,
    });
    fieldErrors[el.errRef] = {
      text: el.errMsg,
    };
  });

  return {
    errorSummary,
    fieldErrors,
  };
};

module.exports = {
  getGroup,
  getTask,
  validationErrorHandler
};
