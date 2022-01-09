const api = require('../../api');
const { STATUS } = require('../../constants');
const {
  dashboardFilters,
  selectedDashboardFilters,
} = require('./dashboardFilters');
const {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
  isSuperUser,
} = require('../../helpers');

const PAGESIZE = 20;
const primaryNav = 'home';

const getRoles = (roles) => {
  const isMaker = roles.includes('maker');
  const isChecker = roles.includes('checker');

  return {
    isMaker,
    isChecker,
  };
};

const submittedFiltersArray = (allSubmittedFilters) => {
  // this functon transforms e.g:
  // { field: 'value', secondField: ['a', 'b'] }
  // into:
  // { field: ['value'], secondField: ['a', 'b'] }

  // only use the filters that could have multiple values.
  const {
    createdByYou,
    keyword,
    ...submittedFilters
  } = allSubmittedFilters;

  let consistentArray = [];

  const filtersArray = Object.keys(submittedFilters);

  if (filtersArray.length) {
    filtersArray.forEach((field) => {
      const submittedValue = submittedFilters[field];
      const fieldHasMultipleValues = Array.isArray(submittedValue);

      if (fieldHasMultipleValues) {
        consistentArray = [
          ...consistentArray,
          { [field]: [ ...submittedValue ] },
        ];
      } else {
        consistentArray = [
          ...consistentArray,
          { [field]: [ submittedValue ] },
        ];
      }
    });
  }

  return consistentArray;
};

const dashboardFiltersQuery = (
  createdByYou,
  filters,
  user,
) => {
  const { isMaker, isChecker } = getRoles(user.roles);
  const filtersQuery = [];

  if (!isSuperUser(user)) {
    filtersQuery.push({
      field: 'bank.id',
      value: user.bank.id,
    });
  }

  if (createdByYou) {
    filtersQuery.push({
      field: 'maker._id',
      value: user._id,
    });
  }

  if (isChecker && !isMaker) {
    filtersQuery.push({
      field: 'status',
      value: STATUS.READY_FOR_APPROVAL,
    });
  }

  // const submittedFiltersArray = Object.keys(submittedFilters);

  // if (submittedFiltersArray.length) {
  //   submittedFiltersArray.forEach((field) => {
  //     const submittedValue = submittedFilters[field];
  //     const fieldHasMultipleValues = Array.isArray(submittedValue);

  //     if (fieldHasMultipleValues) {
  //       submittedValue.forEach((value) => {
  //         allFilters.push({
  //           field,
  //           value,
  //         });
  //       });
  //     } else {
  //       allFilters.push({
  //         field,
  //         value: submittedValue,
  //       });
  //     }
  //   });
  // }

  filters.forEach((filterObj) => {
    const fieldName = Object.keys(filterObj)[0];

    filterObj[fieldName].forEach((filterValue) => {
      filtersQuery.push({
        field: fieldName,
        value: filterValue,
      });
    });
  });

  return filtersQuery;
};

exports.allDeals = async (req, res) => {
  const tab = 'deals';
  const { userToken } = requestParams(req);

  const filtersArray = submittedFiltersArray(req.body);

  const filtersQuery = dashboardFiltersQuery(
    req.body.createdByYou,
    filtersArray,
    req.session.user,
  );

  console.log('---- filtersQuery\n', filtersQuery);

  const { count, deals } = await getApiData(api.allDeals(
    req.params.page * PAGESIZE,
    PAGESIZE,
    filtersQuery,
    userToken,
  ), res);

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };


  const cleanFiltersObj = {};
  
  filtersArray.forEach((filterObj) => {
    const filterName = Object.keys(filterObj)[0];

    cleanFiltersObj[filterName] = filterObj[filterName];
  });

  return res.render('dashboard/deals.njk', {
    deals,
    pages,
    filters: dashboardFilters(cleanFiltersObj),
    selectedFilters: selectedDashboardFilters(cleanFiltersObj),
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    tab,
    user: req.session.user,
    createdByYou: req.body.createdByYou,
  });
};
