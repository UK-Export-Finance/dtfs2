import api from '../api';

const INDUSTRY_SECTORS = 'industrySectors';
const COUNTRIES = 'countries';
const CURRENCIES = 'currencies';
const MANDATORY_CRITERIA = 'mandatoryCriteria';
const DEAL = 'deal';
const LOAN = 'loan';

const get = async (dataType, req) => {
  const token = req.session.userToken;

  if (DEAL === dataType) {
    const dealId = req.params._id;// eslint-disable-line no-underscore-dangle
    const { deal } = await api.getDeal(dealId, token).catch(
      (err) => {
        console.log(`api-data-provider: querying for deal(${dealId}) => ${err}`);
        return { deal: null };
      },
    );
    return deal;
  } if (INDUSTRY_SECTORS === dataType) {
    const { industrySectors } = await api.getIndustrySectors(token).catch(
      (err) => {
        console.log(`api-data-provider: querying for industry sectors => ${err}`);
        return { industrySectors: [] };
      },
    );
    return industrySectors;
  } if (COUNTRIES === dataType) {
    const { countries } = await api.getCountries(token).catch(
      (err) => {
        console.log(`api-data-provider: querying for countries => ${err}`);
        return { countries: [] };
      },
    );
    return countries;
  } if (CURRENCIES === dataType) {
    const { currencies } = await api.getCurrencies(token).catch(
      (err) => {
        console.log(`api-data-provider: querying for currencies => ${err}`);
        return { currencies: [] };
      },
    );
    return currencies;
  } if (MANDATORY_CRITERIA === dataType) {
    const { mandatoryCriteria } = await api.getMandatoryCriteria(token).catch(
      (err) => {
        console.log(`api-data-provider: querying for mandatory criteria => ${err}`);
        return { mandatoryCriteria: [] };
      },
    );

    return mandatoryCriteria;
  } if (LOAN === dataType) {
    const {
      _id, // eslint-disable-line no-underscore-dangle
      loanId,
    } = req.params;

    const loan = await api.getDealLoan(_id, loanId, token).catch(
      (err) => {
        console.log(`api-data-provider: querying for loan => ${err}`);
        return { loan: null };
      },
    );
    return loan;
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
  LOAN,
  provide,
};
