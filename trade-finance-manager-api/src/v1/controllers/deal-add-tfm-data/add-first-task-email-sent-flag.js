/**
 * Add an emailSent flag to the first task.
 * This prevents multiple emails from being sent.
*/
const addFirstTaskEmailSentFlag = (emailResponse, tasks) => {
  const modifiedTasks = tasks;
  try {
    if (!emailResponse.errors) {
      modifiedTasks.map((g) => {
        const group = g;

        if (group.id === 1) {
          group.groupTasks[0].emailSent = true;
        }

        return group;
      });
    }
  } catch (e) {
    console.error('Error adding first task email');
  }

  return modifiedTasks;
};

module.exports = addFirstTaskEmailSentFlag;
