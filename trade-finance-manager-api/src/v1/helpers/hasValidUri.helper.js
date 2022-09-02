const Joi = require('joi');

exports.hasValidUri = (uri) => {
  const schema = Joi.string().uri({ scheme: ['http', 'https'] });
  const validate = schema.validate(uri);
  return !validate.error;
};
