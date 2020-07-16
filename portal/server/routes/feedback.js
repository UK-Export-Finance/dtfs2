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

  try {
    const response = await api.createFeedback(req.body, userToken);
    if (response) {
      return res.render('feedback/feedback-thankyou.njk');
    }
  } catch (catchErr) {
    const { data } = catchErr.response;

    const validationErrors = generateErrorSummary(
      data.validationErrors,
      errorHref,
    );

    return res.render('feedback/feedback-form.njk', {
      feedback: data.feedback,
      validationErrors,
    });
  }
});

export default router;
