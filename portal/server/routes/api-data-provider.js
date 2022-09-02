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
    const { deal, validationErrors } = await api.getDeal(dealId, token).catch((err) => {
      console.error(`api-data-provider: querying for deal(${dealId}) => ${err}`);
      return { deal: {}, validationErrors: {} };
    });

    req.apiData[DEAL_VALIDATION] = validationErrors || { count: 0, errorList: [] };
    req.apiData[DEAL] = deal;
    return;
  }
  if (INDUSTRY_SECTORS === dataType) {
    const { industrySectors } = await api.getIndustrySectors(token).catch((err) => {
      console.error(`api-data-provider: querying for industry sectors => ${err}`);
      return { industrySectors: [] };
    });
    req.apiData[INDUSTRY_SECTORS] = industrySectors;
    return;
  }
  if (COUNTRIES === dataType) {
    const { countries } = await api.getCountries(token).catch((err) => {
      console.error(`api-data-provider: querying for countries => ${err}`);
      return { countries: [] };
    });
    req.apiData[COUNTRIES] = countries;
    return;
  }
  if (CURRENCIES === dataType) {
    const { currencies } = await api.getCurrencies(token).catch((err) => {
      console.error(`api-data-provider: querying for currencies => ${err}`);
      return { currencies: [] };
    });
    req.apiData[CURRENCIES] = currencies;
    return;
  }
  if (MANDATORY_CRITERIA === dataType) {
    const mandatoryCriteria = await api.getLatestMandatoryCriteria(token).catch((err) => {
      console.error(`api-data-provider: querying for latest mandatory criteria => ${err}`);
      return {};
    });

    req.apiData[MANDATORY_CRITERIA] = mandatoryCriteria;
    return;
  }
  if (LOAN === dataType) {
    const { _id, loanId } = req.params;

    const loan = await api.getLoan(_id, loanId, token).catch((err) => {
      console.error(`api-data-provider: querying for loan => ${err}`);
      return { loan: {} };
    });
    req.apiData[LOAN] = loan;
    return;
  }
  if (BOND === dataType) {
    const { _id, bondId } = req.params;

    const bond = await api.contractBond(_id, bondId, token).catch((err) => {
      console.error(`api-data-provider: querying for bond => ${err}`);
      return { bond: {} };
    });
    req.apiData[BOND] = bond;
    return;
  }
  console.info(`api-data-provider has been asked to provide ${dataType} but doesn't know how...`);
};

const provide = (listOfDataTypes) => async (req, res, next) => {
  if (!req.apiData) {
    req.apiData = {};
  }

  const promises = [];
  listOfDataTypes.forEach((dataType) => {
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
