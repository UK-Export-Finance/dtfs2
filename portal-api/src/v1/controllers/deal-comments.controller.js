const api = require('../api');

exports.addComment = async (_id, commentToAdd, user) => {
  const commentToInsert = {
    user,
    text: commentToAdd,
  };

  const value = await api.addDealComment(_id, 'comments', commentToInsert);
  return value;
};

exports.addUkefComment = async (_id, commentToAdd, user) => {
  if (!commentToAdd) {
    return false;
  }

  const commentToInsert = {
    user,
    text: commentToAdd,
  };

  const value = await api.addDealComment(_id, 'ukefComments', commentToInsert);
  return value;
};
