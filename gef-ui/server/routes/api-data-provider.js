import api from '../api';

const INDUSTRY_SECTORS = 'industrySectors';
const COUNTRIES = 'countries';
const CURRENCIES = 'currencies';
const MANDATORY_CRITERIA = 'mandatoryCriteria';
const APPLICATION = 'application';
const APPLICATION_VALIDATION = 'applicationValidation';


const get = async (dataType, req) => {
  const token = req.session.userToken;

  if (APPLICATION === dataType) {
    const applicationId = req.params._id;// eslint-disable-line no-underscore-dangle
    const { application, validationErrors } = await api.getApplication(applicationId, token).catch(
      (err) => {
        console.log(`api-data-provider: querying for deal(${applicationId}) => ${err}`);
        return { application: {}, validationErrors: {} };
      },
    );

    req.apiData[APPLICATION_VALIDATION] = validationErrors || { count: 0, errorList: [] };
    req.apiData[APPLICATION] = application;
    return;
  } if (INDUSTRY_SECTORS === dataType) {
    const { industrySectors } = await api.getIndustrySectors(token).catch(
      (err) => {
        console.log(`api-data-provider: querying for industry sectors => ${err}`);
        return { industrySectors: [] };
      },
    );
    req.apiData[INDUSTRY_SECTORS] = industrySectors;
    return;
  } if (COUNTRIES === dataType) {
    const { countries } = await api.getCountries(token).catch(
      (err) => {
        console.log(`api-data-provider: querying for countries => ${err}`);
        return { countries: [] };
      },
    );
    req.apiData[COUNTRIES] = countries;
    return;
  } if (CURRENCIES === dataType) {
    const { currencies } = await api.getCurrencies(token).catch(
      (err) => {
        console.log(`api-data-provider: querying for currencies => ${err}`);
        return { currencies: [] };
      },
    );
    req.apiData[CURRENCIES] = currencies;
    return;
  } if (MANDATORY_CRITERIA === dataType) {
    const { mandatoryCriteria } = await api.getMandatoryCriteria(token).catch(
      (err) => {
        console.log(`api-data-provider: querying for mandatory criteria => ${err}`);
        return { mandatoryCriteria: [] };
      },
    );

    req.apiData[MANDATORY_CRITERIA] = mandatoryCriteria;
    return;
  }
  console.log(`api-data-provider has been asked to provide ${dataType} but doesn't know how...`);
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

export {
  INDUSTRY_SECTORS,
  COUNTRIES,
  CURRENCIES,
  MANDATORY_CRITERIA,
  APPLICATION,
  APPLICATION_VALIDATION,
  provide,
};
