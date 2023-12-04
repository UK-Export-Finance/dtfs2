const express = require('express');
const { validationErrorHandler } = require('../../helpers');

const router = express.Router();

router.get('/activity', async (req, res) => res.render('activity/generate-activity-report.njk', { user: req.session.user }));

router.post('/activity', async (req, res) => {
  const { usersSearchTerm } = req.body;

  if (!usersSearchTerm) {
    return res.render('activity/generate-activity-report.njk', {
      user: req.session.user,
      errors: validationErrorHandler([
        {
          errMsg: 'Enter the name or email address of the user you wish to be featured in the report',
          errRef: 'usersSearchTerm',
        },
      ]),
    });
  }

  return res.redirect(`/activity/${usersSearchTerm}`);
});

router.get('/activity/:searchTerm', async (req, res) => {
  const { searchTerm } = req.params;
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

  res.render('activity/select-user.njk', { searchTerm, user: req.session.user, usersRadioButtonItems });
});

module.exports = router;
