import express from 'express';

const router = express.Router();

router.get('/case/deal', async (req, res) => {
  //reportData = {};

  return res.render('case/deal', {
    reportData,
    subNav: 'deal',
    user: req.session.user,
  });
});

export default router;