const express = require('express');
const api = require('../../api');
const { getApiData, requestParams, errorHref, generateErrorSummary, constructPayload } = require('../../helpers');
const { ALL_BANKS_ID, PRIMARY_NAV_KEY } = require('../../constants');

const router = express.Router();

const getOptionsForRenderingEditUser = async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { user } = req.session;

  const banks = await getApiData(api.banks(userToken), res);
  const userToEdit = await getApiData(api.user(_id, userToken), res);

  return {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    _id,
    banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    displayedUser: userToEdit,
    user,
  };
};

router.get('/users', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const userList = await getApiData(api.users(userToken), res);

  const banks = await getApiData(api.banks(userToken), res);

  return res.render('admin/dashboard.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    _id,
    users: userList.users,
    banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    user: req.session.user,
  });
});

// Admin - user create
router.get('/users/create', async (req, res) => {
  const { userToken } = requestParams(req);

  const banks = await getApiData(api.banks(userToken), res);

  return res.render('admin/user-edit.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    user: req.session.user,
    displayedUser: { roles: [] },
  });
});

// roles are fed in = require(checkboxes, so we either get a string or an array.).
// -so if we don't get an array, put it into an array..
const handleRoles = (roles) => (Array.isArray(roles) ? [...roles] : [roles]);

// Admin - user create
router.post('/users/create', async (req, res) => {
  const { email, bank } = req.body;

  const { userToken } = requestParams(req);
  const user = {
    ...req.body,
    username: email,
    roles: handleRoles(req.body.roles),
  };

  // inflate the bank object
  const banks = await getApiData(api.banks(userToken), res);

  // `fi` stands for `financial institution`
  if (bank === 'all') {
    user.bank = {
      id: ALL_BANKS_ID,
      name: 'All',
      hasGefAccessOnly: false,
    };
  } else {
    const selectedBank = banks.find((fi) => fi.id === user.bank);
    user.bank = selectedBank;
  }

  const { status, data } = await api.createUser(user, userToken);

  if (status === 200) {
    return res.redirect('/admin/users/');
  }

  const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);

  return res.render('admin/user-edit.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    user: req.session.user,
    displayedUser: user,
    validationErrors: formattedValidationErrors,
  });
});

// Admin - user edit
router.get('/users/edit/:_id', async (req, res) => {
  const options = await getOptionsForRenderingEditUser(req, res);

  return res.render('admin/user-edit.njk', options);
});

// Admin - user edit
router.post('/users/edit/:_id', async (req, res) => {
  const payloadProperties = ['firstname', 'surname', 'user-status', 'roles'];
  const payload = constructPayload(req.body, payloadProperties);
  const { _id, userToken } = requestParams(req);

  const update = {
    ...payload,
    roles: handleRoles(payload.roles),
  };

  const { status, data } = await api.updateUser(_id, update, userToken);

  if (status === 200) {
    return res.redirect('/admin/users');
  }

  const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);

  const options = await getOptionsForRenderingEditUser(req, res);

  const editedUser = {
    ...options.displayedUser,
    ...update,
  };

  return res.render('admin/user-edit.njk', {
    ...options,
    displayedUser: editedUser,
    validationErrors: formattedValidationErrors,
  });
});

router.get('/users/disable/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const user = await getApiData(api.user(_id, userToken), res);

  return res.render('admin/user-disable.njk', {
    _id,
    user,
  });
});

router.get('/users/enable/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const user = await getApiData(api.user(_id, userToken), res);

  return res.render('admin/user-enable.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    _id,
    user,
  });
});

// Admin - Change user password
router.get('/users/change-password/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const user = await getApiData(api.user(_id, userToken), res);

  return res.render('admin/user-change-password.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    _id,
    user,
  });
});

// Admin - Change user password
router.post('/users/change-password/:_id', async (req, res) => {
  const payloadProperties = ['password', 'passwordConfirm'];
  const payload = constructPayload(req.body, payloadProperties);
  const { _id, userToken } = requestParams(req);

  // Get user information
  const user = await getApiData(api.user(_id, userToken), res);
  // Update user password
  const { status, data } = await api.updateUser(_id, payload, userToken);

  // Successful
  if (status === 200) {
    return res.redirect(`/admin/users/edit/${_id}`);
  }

  const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);
  // Re-direct upon error(s)
  return res.render('admin/user-change-password.njk', {
    primaryNav: PRIMARY_NAV_KEY.USERS,
    _id,
    user,
    validationErrors: formattedValidationErrors,
  });
});

module.exports = router;
