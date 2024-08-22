const util = require('util');
const { HttpStatusCode } = require('axios');
const { validationResult } = require('express-validator');

/**
 * Validation middleware, used on a per route basis to handle result of validations that are run on the inputs of an API route.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const handleExpressValidatorResult = (req, res, next) => {
  console.info(util.inspect({ stepDescription: 'handleExpressValidatorResult' }, { showHidden: false, depth: null, colors: true }));

  const validationResults = validationResult(req);
  console.info(util.inspect({ validationResults }, { showHidden: false, depth: null, colors: true }));

  if (!validationResults.isEmpty()) {
    console.info(
      util.inspect(
        { stepDescription: 'handleExpressValidatorResult has validation result', validationResults },
        { showHidden: false, depth: null, colors: true },
      ),
    );

    console.info(
      util.inspect(
        {
          stepDescription: 'handleExpressValidatorResult',
          response: {
            status: HttpStatusCode.BadRequest,
            body: { status: HttpStatusCode.BadRequest, errors: validationResults.array() },
          },
        },
        { showHidden: false, depth: null, colors: true },
      ),
    );
    return res.status(HttpStatusCode.BadRequest).json({ status: HttpStatusCode.BadRequest, errors: validationResults.array() });
  }
  console.info({ stepDescription: 'handleExpressValidatorResult calling next' });
  return next();
};

module.exports = handleExpressValidatorResult;
