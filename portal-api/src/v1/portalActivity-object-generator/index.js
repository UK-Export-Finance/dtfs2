const { getUnixTime } = require('date-fns');

const portalActivityGenerator = (applicationType, user, activityType, activityText) => {
  const userToAdd = {
    firstName: user.firstname,
    lastName: user.surname,
    _id: user._id,
  };

  const portalActivityObj = {
    type: activityType,
    timestamp: getUnixTime(new Date()),
    author: userToAdd,
    text: activityText,
    label: applicationType,
  };

  return portalActivityObj;
};

module.exports = portalActivityGenerator;
