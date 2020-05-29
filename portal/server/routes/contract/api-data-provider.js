import api from '../../api';

const INDUSTRY_SECTORS = 'industrySectors';
const COUNTRIES = 'countries';
const CURRENCIES = 'currencies';
const MANDATORY_CRITERIA = 'mandatoryCriteria';
const DEAL = 'deal';

const get = async (dataType, req) => {
  const token = req.session.userToken;

  if (DEAL === dataType) {
    const dealId = req.params._id;// eslint-disable-line no-underscore-dangle
    const { status, deal } = await api.getDeal(dealId, token);

    if (status !== 200) {
      // TODO presumably it would be good to provide some feedback here?
      console.log(`api-data-provider: received status ${status} when quering for deal ${dealId}`);
    }
    return deal;
  } if (INDUSTRY_SECTORS === dataType) {
    const { status, industrySectors } = await api.getIndustrySectors(token);
    if (status !== 200) {
      // TODO presumably it would be good to provide some feedback here?
      console.log(`api-data-provider: received status ${status} when quering for industry sectors`);
    }
    return industrySectors;
  } if (COUNTRIES === dataType) {
    const { status, countries } = await api.getCountries(token);
    if (status !== 200) {
      // TODO presumably it would be good to provide some feedback here?
      console.log(`api-data-provider: received status ${status} when quering for countries`);
    }
    return countries;
  } if (CURRENCIES === dataType) {
    const { status, currencies } = await api.getCurrencies(token);
    if (status !== 200) {
      // TODO presumably it would be good to provide some feedback here?
      console.log(`api-data-provider: received status ${status} when quering for currencies`);
    }
    return currencies;
  } if (MANDATORY_CRITERIA === dataType) {
    const { status, mandatoryCriteria } = await api.getMandatoryCriteria(token);
    if (status !== 200) {
      // TODO presumably it would be good to provide some feedback here?
      console.log(`api-data-provider: received status ${status} when quering for mandatory criteria`);
    }
    return mandatoryCriteria;
  }
  console.log(`api-data-provider has been asked to provide ${dataType} but doesn't know how...`);
  return [];
};

const provide = (listOfDataTypes) => async (req, res, next) => {
  if (!req.apiData) {
    req.apiData = {};
  }

  const promises = [];
  listOfDataTypes.forEach(async (dataType) => {
    promises.push(get(dataType, req));
  });

  const resolvedData = await Promise.all(promises);

  for (let i = 0; i < listOfDataTypes.length; i += 1) {
    const dataType = listOfDataTypes[i];
    req.apiData[dataType] = resolvedData[i];
  }

  return next();
};

export {
  INDUSTRY_SECTORS,
  COUNTRIES,
  CURRENCIES,
  MANDATORY_CRITERIA,
  DEAL,
  provide,
};
