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

exports.findAll = async (req, res) => {
  const { status, industrySectors } = await findIndustrySectors();
  res.status(status).send({
    count: industrySectors.length,
    industrySectors: sortIndustrySectors(industrySectors),
  });
};

exports.findOne = async (req, res) => {
  const { status, industrySector } = await findOneIndustrySector(req.params.code);
  res.status(status).send(industrySector);
};
