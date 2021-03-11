const utils = require('../../utils/array');
const INDUSTRY_SECTORS = require('../../reference-data/industry-sectors');
const api = require('../api');

const sortIndustrySectors = (industrySectors) => utils.sortArrayAlphabetically(industrySectors, 'name').map((sector) => ({
  ...sector,
  classes: utils.sortArrayAlphabetically(sector.classes, 'name'),
}));

const findOneIndustrySector = (findCode) => INDUSTRY_SECTORS.find(({ code }) => code === findCode);

exports.findAll = (req, res) => (
  res.status(200).send({
    count: INDUSTRY_SECTORS.length,
    industrySectors: sortIndustrySectors(INDUSTRY_SECTORS),
  })
);

exports.findOne = (req, res) => {
  const industrySector = findOneIndustrySector(req.params.code);
  const status = industrySector ? '200' : '404';
  res.status(status).send(industrySector);
};

exports.getACBSIndustrySector = async (req, res) => {
  const { code } = req.params;

  const { status, data } = await api.findACBSIndustrySector(code);

  return res.status(status).send(data[0]);
};
