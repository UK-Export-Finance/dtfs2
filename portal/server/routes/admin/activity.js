const express = require('express');
const { validationErrorHandler } = require('../../helpers');

const router = express.Router();

router.get('/activity/search', async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.render('admin/activity/search-users.njk', { user: req.session.user, primaryNav: 'activity' });
  }

  if (searchTerm.length < 3) {
    return res.render('admin/activity/search-users.njk', {
      user: req.session.user,
      errors: validationErrorHandler([
        {
          errMsg: 'The name or email address of the user must contain at least 3 characters',
          errRef: 'usersSearchTerm',
        },
      ]),
      primaryNav: 'activity',
    });
  }

  const usersRadioButtonItems = [
    {
      value: {
        username: 'test',
        bank: {
          name: 'UKEF',
        },
        email: 'test@example.com',
      },
      text: 'test (UKEF, test@example.com )',
    },
    {
      value: {
        username: 'test2',
        bank: {
          name: 'Barclays',
        },
        email: 'test2@example.com',
      },
      text: 'test2 (Barclays, test2@example.com )',
    },
  ];

  return res.render('admin/activity/select-user.njk', {
    searchTerm,
    user: req.session.user,
    usersRadioButtonItems,
    primaryNav: 'activity',
  });
});

router.post('/activity/search', async (req, res) => {
  const { usersSearchTerm } = req.body;

  if (!usersSearchTerm) {
    return res.render('admin/activity/search-users.njk', {
      user: req.session.user,
      errors: validationErrorHandler([
        {
          errMsg: 'Enter the name or email address of the user you wish to be featured in the report',
          errRef: 'usersSearchTerm',
        },
      ]),
      primaryNav: 'activity',
    });
  }
  if (usersSearchTerm.length < 3) {
    return res.render('admin/activity/search-users.njk', {
      user: req.session.user,
      errors: validationErrorHandler([
        {
          errMsg: 'The name or email address of the user must contain at least 3 characters',
          errRef: 'usersSearchTerm',
        },
      ]),
      primaryNav: 'activity',
    });
  }

  return res.redirect(301, `?q=${encodeURIComponent(usersSearchTerm)}`);
});

module.exports = router;
