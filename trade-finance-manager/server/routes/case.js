import express from 'express';

const router = express.Router();

router.get('/case/deal', (req, res) => res.render('case/deal/deal.njk'));


export default router;
