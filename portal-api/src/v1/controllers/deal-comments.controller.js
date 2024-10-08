const api = require('../api');

exports.addComment = async (_id, commentToAdd, user, auditDetails) => {
  const commentToInsert = {
    user,
    text: commentToAdd,
  };

  const value = await api.addDealComment(_id, 'comments', commentToInsert, auditDetails);
  return value;
};
