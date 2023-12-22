// const api = require('../../api');
// const { getUserRoles, validationErrorHandler } = require('../../helpers');
// const CONSTANTS = require('../../constants');
// const { FEATURE_FLAGS } = require('../../config/feature-flag.config');

// const redirectUserAfterSuccessfulLogIn = (user, res) => {
//   const { isMaker, isChecker, isAdmin, isPaymentReportOfficer } = getUserRoles(user.roles);

//   if (isMaker || isChecker || isAdmin) {
//     return res.redirect('/dashboard/deals/0');
//   }
//   if (isPaymentReportOfficer) {
//     return res.redirect('/utilisation-report-upload');
//   }
//   return res.redirect('/dashboard/deals/0');
// };

// // TODO FN-XXX fix redirect logic with new 2FA login
// const login = async (req, res) => {
//   const { email, password } = req.body;
//   const loginErrors = [];

//   const emailError = {
//     errMsg: 'Enter an email address in the correct format, for example, name@example.com',
//     errRef: 'email',
//   };
//   const passwordError = {
//     errMsg: 'Enter a valid password',
//     errRef: 'password',
//   };

//   if (!email || !password) {
//     if (!email) loginErrors.push(emailError);
//     if (!password) loginErrors.push(passwordError);

//     return res.render('login/index.njk', {
//       errors: validationErrorHandler(loginErrors),
//     });
//   }

//   if (!FEATURE_FLAGS.MAGIC_LINK) {
//     const loginResponse = await api.login(email, password);

//     if (!loginResponse.success) {
//       loginErrors.push(emailError);
//       loginErrors.push(passwordError);

//       return res.render('login/index.njk', {
//         errors: validationErrorHandler(loginErrors),
//       });
//     }

//     const { token, user } = loginResponse;
//     req.session.userToken = token;
//     req.session.user = user;
//     req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;

//     return redirectUserAfterSuccessfulLogIn(user, res);
//   }

//   try {
//     const loginResponse = await api.login(email, password);

//     const {
//       token,
//       loginStatus,
//       user: { email: userEmail },
//     } = loginResponse;
//     req.session.userToken = token;
//     req.session.loginStatus = loginStatus;

//     req.session.userEmail = userEmail;
//     try {
//       const {
//         data: { numberOfSendSignInLinkAttemptsRemaining },
//       } = await api.sendSignInLink(req.session.userToken);
//       req.session.numberOfSendSignInLinkAttemptsRemaining = numberOfSendSignInLinkAttemptsRemaining;
//     } catch (sendSignInLinkError) {
//       if (sendSignInLinkError.response?.status === 403) {
//         return res.render('login/temporarily-suspended.njk');
//       }
// console.warn('Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was: %O', sendSignInLinkError);
//     }
//     return res.redirect('/login/check-your-email');
//   } catch (loginError) {
//     console.warn('Failed to login: %O', loginError);

//     if (loginError.response?.status === 403) {
//       return res.render('login/temporarily-suspended.njk');
//     }

//     loginErrors.push(emailError);
//     loginErrors.push(passwordError);

//     return res.render('login/index.njk', {
//       errors: validationErrorHandler(loginErrors),
//     });
//   }
// };

// module.exports = {
//   login,
//   redirectUserAfterSuccessfulLogIn,
// };
