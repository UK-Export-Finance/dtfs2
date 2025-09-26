const express = require('express');
const api = require('../../api');
const { requestParams, generateErrorSummary, errorHref, validationErrorHandler } = require('../../helpers');
const { renderCheckYourEmailPage, sendNewSignInLink } = require('../../controllers/login/check-your-email');
const { loginWithSignInLink } = require('../../controllers/login/login-with-sign-in-link');
const { validatePartialAuthToken } = require('../middleware/validatePartialAuthToken');
const { LANDING_PAGES } = require('../../constants');

const router = express.Router();

/**
 * @openapi
 * /login:
 *   get:
 *     summary: Get login page
 *     tags: [Portal]
 *     description: Get login page
 *     responses:
 *       200:
 *         description: Ok
 *
 */
router.get(LANDING_PAGES.LOGIN, (req, res) => {
  const { passwordreset, passwordupdated } = req.query;
  return res.render('login/index.njk', {
    passwordreset,
    passwordupdated,
    user: req.session.user,
  });
});

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Post login
 *     tags: [Portal]
 *     description: Post login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: password
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 *
 */
router.post(LANDING_PAGES.LOGIN, async (req, res) => {
  const { email, password } = req.body;
  const loginErrors = [];

  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const passwordError = {
    errMsg: 'Enter a valid password',
    errRef: 'password',
  };

  if (!email || !password) {
    if (!email) loginErrors.push(emailError);
    if (!password) loginErrors.push(passwordError);

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  try {
    const loginResponse = await api.login(email, password);

    const {
      token,
      loginStatus,
      user: { email: userEmail },
    } = loginResponse;
    req.session.userToken = token;
    req.session.loginStatus = loginStatus;
    // We do not store this in the user object to avoid existing logic using the existence of a `user` object to draw elements
    req.session.userEmail = userEmail;
    try {
      const {
        data: { numberOfSendSignInLinkAttemptsRemaining },
      } = await api.sendSignInLink(req.session.userToken);
      req.session.numberOfSendSignInLinkAttemptsRemaining = numberOfSendSignInLinkAttemptsRemaining;
    } catch (sendSignInLinkError) {
      if (sendSignInLinkError.response?.status === 403) {
        req.session.numberOfSendSignInLinkAttemptsRemaining = -1;
        return res.status(403).render('login/temporarily-suspended.njk');
      }
      console.info('Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was %o', sendSignInLinkError);
    }
    return res.redirect('/login/check-your-email');
  } catch (loginError) {
    console.info('Failed to login %o', loginError);

    if (loginError.response?.status === 403) {
      return res.status(403).render('login/temporarily-suspended.njk');
    }

    loginErrors.push(emailError);
    loginErrors.push(passwordError);

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }
});

/**
 * @openapi
 * /logout:
 *   get:
 *     summary: Logout and redirect to login page
 *     tags: [Portal]
 *     description: Logout and redirect to login page
 *     responses:
 *       301:
 *         description: Resource moved permanently
 */
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect(LANDING_PAGES.LOGIN);
  });
});

/**
 * @openapi
 * /reset-password:
 *   get:
 *     summary: Get reset password page
 *     tags: [Portal]
 *     description: Get reset password page
 *     responses:
 *       200:
 *         description: Ok
 *
 */
router.get('/reset-password', (req, res) => {
  const { passwordreseterror } = req.query;
  return res.render('reset-password.njk', {
    passwordreseterror,
  });
});

/**
 * @openapi
 * /reset-password:
 *   post:
 *     summary: Post reset password
 *     tags: [Portal]
 *     description: Post reset password
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad Request
 */
router.post('/reset-password', async (req, res) => {
  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const loginErrors = [];
  const { email } = req.body;

  if (!email) {
    loginErrors.push(emailError);
    return res.render('reset-password.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  const { success } = await api.resetPassword(email);

  if (success) {
    return res.redirect('/login?passwordreset=1');
  }

  // If all of the above fails
  return res.redirect('/reset-password?passwordreseterror=1');
});

/**
 * @openapi
 * /reset-password/:pwdResetToken:
 *   get:
 *     summary: Get change password page
 *     tags: [Portal]
 *     description: Get change password page
 *     responses:
 *       200:
 *         description: Ok
 *
 */
router.get('/reset-password/:pwdResetToken', (req, res) => {
  res.render('user/change-password.njk', { requireCurrentPassword: false });
});

/**
 * @openapi
 * /reset-password/:pwdResetToken:
 *   get:
 *     summary: Post change password
 *     tags: [Portal]
 *     description:  Post change password
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad Request
 *
 *
 */
router.post('/reset-password/:pwdResetToken', async (req, res) => {
  const { pwdResetToken } = requestParams(req);
  const { data } = await api.resetPasswordFromToken(pwdResetToken, req.body);

  const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);

  if (formattedValidationErrors && formattedValidationErrors.count > 0) {
    return res.render('user/change-password.njk', {
      requireCurrentPassword: false,
      validationErrors: formattedValidationErrors,
    });
  }

  return res.redirect('/login?passwordupdated=1');
});

/**
 * @openapi
 * /login/check-your-email:
 *   get:
 *     summary: Render check your email page
 *     tags: [Portal]
 *     description: Render check your email page
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *
 */
router.get('/login/check-your-email', validatePartialAuthToken, renderCheckYourEmailPage);

/**
 * @openapi
 * /login/check-your-email:
 *   post:
 *     summary: Get new sign-in link
 *     tags: [Portal]
 *     description: Get new sign-in link
 *     responses:
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *
 */
router.post('/login/check-your-email', validatePartialAuthToken, sendNewSignInLink);

/**
 * @openapi
 * /login/sign-in-link-expired:
 *   get:
 *     summary: Render sign in link expired page
 *     tags: [Portal]
 *     description: Render sign in link expired page
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *
 *
 */
router.get('/login/sign-in-link-expired', validatePartialAuthToken, (req, res) => {
  res.render('login/sign-in-link-expired.njk');
});

/**
 * @openapi
 * /login/sign-in-link-expired:
 *   post:
 *     summary: Get new sign-in link
 *     tags: [Portal]
 *     description: Get new sign-in link
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 */
router.post('/login/sign-in-link-expired', validatePartialAuthToken, sendNewSignInLink);

/**
 * @openapi
 * /login/sign-in-link:
 *   get:
 *     summary: Render post login redirect page
 *     tags: [Portal]
 *     description: Render post login redirect page
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.get('/login/sign-in-link', loginWithSignInLink);

module.exports = router;
