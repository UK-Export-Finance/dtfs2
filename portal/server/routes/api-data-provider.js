const api = require('../api');

const INDUSTRY_SECTORS = 'industrySectors';
const COUNTRIES = 'countries';
const CURRENCIES = 'currencies';
const MANDATORY_CRITERIA = 'mandatoryCriteria';
const DEAL = 'deal';
const DEAL_VALIDATION = 'dealValidation';
const LOAN = 'loan';
const BOND = 'bond';

const get = async (dataType, req) => {
  const token = req.session.userToken;

  if (DEAL === dataType) {
    const dealId = req.params._id;
    const { deal, validationErrors } = await api.getDeal(dealId, token).catch((error) => {
      console.error('api-data-provider: querying for deal(%s) => %o', dealId, error);
      return { deal: {}, validationErrors: {} };
    });

    req.apiData[DEAL_VALIDATION] = validationErrors || { count: 0, errorList: [] };
    req.apiData[DEAL] = deal;
    return;
  }
  if (INDUSTRY_SECTORS === dataType) {
    const { industrySectors } = await api.getIndustrySectors(token).catch((error) => {
      console.error('api-data-provider: querying for industry sectors => %o', error);
      return { industrySectors: [] };
    });
    req.apiData[INDUSTRY_SECTORS] = industrySectors;
    return;
  }
  if (COUNTRIES === dataType) {
    const { countries } = await api.getCountries(token).catch((error) => {
      console.error('api-data-provider: querying for countries => %o', error);
      return { countries: [] };
    });
    req.apiData[COUNTRIES] = countries;
    return;
  }
  if (CURRENCIES === dataType) {
    const { currencies } = await api.getCurrencies(token).catch((error) => {
      console.error('api-data-provider: querying for currencies => %o', error);
      return { currencies: [] };
    });
    req.apiData[CURRENCIES] = currencies;
    return;
  }
  if (MANDATORY_CRITERIA === dataType) {
    const mandatoryCriteria = await api.getLatestMandatoryCriteria(token).catch((error) => {
      console.error('api-data-provider: querying for latest mandatory criteria => %o', error);
      return {};
    });

    req.apiData[MANDATORY_CRITERIA] = mandatoryCriteria;
    return;
  }
  if (LOAN === dataType) {
    const { _id, loanId } = req.params;

    const loan = await api.getLoan(_id, loanId, token).catch((error) => {
      console.error('api-data-provider: querying for loan => %o', error);
      return { loan: {} };
    });
    req.apiData[LOAN] = loan;
    return;
  }
  if (BOND === dataType) {
    const { _id, bondId } = req.params;

    const bond = await api.contractBond(_id, bondId, token).catch((error) => {
      console.error('api-data-provider: querying for bond => %o', error);
      return { bond: {} };
    });
    req.apiData[BOND] = bond;
    return;
  }
  console.info("api-data-provider has been asked to provide %s but doesn't know how...", dataType);
};

const provide = (listOfDataTypes) => async (req, res, next) => {
  if (!req.apiData) {
    req.apiData = {};
  }

  const promises = [];
  listOfDataTypes.forEach(async (dataType) => {
    promises.push(get(dataType, req));
  });

  await Promise.all(promises);
  return next();
};

module.exports = {
  INDUSTRY_SECTORS,
  COUNTRIES,
  CURRENCIES,
  MANDATORY_CRITERIA,
  DEAL,
  DEAL_VALIDATION,
  LOAN,
  BOND,
  provide,
};
