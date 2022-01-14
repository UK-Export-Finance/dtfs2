const { getUnixTime } = require('date-fns');

const portalActivityGenerator = (activityParams) => {
  const {
    type,
    user,
    activityType,
    activityText,
    activityHTML,
  } = activityParams;

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
    label: type,
    html: activityHTML,
  };

  return portalActivityObj;
};

module.exports = portalActivityGenerator;
