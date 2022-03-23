/**
 * Add an emailSent flag to the first task.
 * This prevents multiple emails from being sent.
*/
const addFirstTaskEmailSentFlag = (emailResponse, tasks) => {
  const modifiedTasks = tasks;

  if (emailResponse.content) {
    modifiedTasks.map((g) => {
      const group = g;

      if (group.id === 1) {
        group.groupTasks[0].emailSent = true;
      }

      return group;
    });
  }

  return modifiedTasks;
};

module.exports = addFirstTaskEmailSentFlag;
