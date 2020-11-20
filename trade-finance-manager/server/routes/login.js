import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.render('login.njk'));

router.post('/', (req, res) =>
  res.redirect('/case/deal/1000581'));

export default router;
