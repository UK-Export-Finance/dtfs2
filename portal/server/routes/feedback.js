import express from 'express';
import api from '../api';
import {
  requestParams,
  generateErrorSummary,
} from '../helpers';

const router = express.Router();

const errorHref = (id) => `#${id}`;

router.get('/feedback', (req, res) => res.render('feedback/feedback-form.njk'));

router.post('/feedback', async (req, res) => {
  const { userToken } = requestParams(req);

  const response = await api.createFeedback(req.body, userToken);

  const validationErrors = generateErrorSummary(
    response.validationErrors,
    errorHref,
  );

  // TODO
  // if NO validation errors, redirect to thank you

  return res.render('feedback/feedback-form.njk', {
    feedback: response.feedback,
    validationErrors,
  });
});

// TODO: only get to this page if submitted the form.
router.get('/feedback/thank-you', (req, res) => res.render('feedback/feedback-thankyou.njk'));

export default router;
