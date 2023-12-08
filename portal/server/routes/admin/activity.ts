import { Request, Router } from 'express';
import { validationErrorHandler } from '../../helpers';

const router = Router();

type ActivitySearchPostRequestBody = {
  usersSearchTerm?: string;
}

router.get('/activity/search', (req, res) => res.render('admin/activity/search-users.njk', { user: req.session.user, primaryNav: 'activity' }));

router.post('/activity/search', (req: Request<unknown, unknown, ActivitySearchPostRequestBody>, res) => {
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

  return res.redirect(`/admin/activity/search-results?q=${encodeURIComponent(usersSearchTerm)}`);
});

router.get('/activity/search-results', (req, res) => {
  const searchTerm = req.query.q as string | undefined;

  if (!searchTerm || searchTerm.length < 3) {
    return res.redirect('/admin/activity/search');
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

export default router;
