const utils = require('../../utils/array');
const externalApi = require('../../external-api/api');

const sortIndustrySectors = (industrySectors) =>
  utils.sortArrayAlphabetically(industrySectors, 'name').map((sector) => ({
    ...sector,
    classes: utils.sortArrayAlphabetically(sector.classes, 'name'),
  }));

const findIndustrySectors = async () => externalApi.industrySectors.getIndustrySectors();

const findOneIndustrySector = async (code) => {
  const { status, data } = await externalApi.industrySectors.getIndustrySector(code);
  return {
    status,
    industrySector: data,
  };
};

/**
 * Retrieves and sorts industry sectors from an external API.
 * @param {Object} req - The request object containing information about the HTTP request.
 * @param {Object} res - The response object used to send the HTTP response.
 * @returns {Promise<Response<object<number, string>>>} - An object containing the count of industry sectors and the sorted industry sectors,
 *                    or an error response object with a status code of 500 and a message indicating the error.
 */
exports.findAll = async (req, res) => {
  try {
    const { status, industrySectors } = await findIndustrySectors();

    if (!industrySectors) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid industry sectors returned',
      });
    }

    return res.status(status).send({
      count: industrySectors.length,
      industrySectors: sortIndustrySectors(industrySectors),
    });
  } catch (error) {
    console.error('Error getting all industry sectors %o', error);

    return res.status(500).send({
      status: 500,
      message: 'Unable to fetch all industry sectors',
    });
  }
};

/**
 * Finds and returns a specific industry sector based on a given code.
 * @param {Object} req - The request object containing information about the HTTP request.
 * @param {Object} res - The response object used to send the HTTP response.
 * @returns {Promise<Response<any, object<number, string>>>} - A promise that resolves with the industry sector data or rejects with an error.
 */
exports.findOne = async (req, res) => {
  try {
    const { code } = req.params;
    const { status, industrySector } = await findOneIndustrySector(code);

    return res.status(status).send(industrySector);
  } catch (error) {
    console.error('Error getting an industry sector %o', error);
    return res.status(500).send({
      status: 500,
      message: 'Unable to fetch an industry sector',
    });
  }
};
