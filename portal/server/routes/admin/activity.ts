import express from 'express';

const router = express.Router();

router.get('/activity', async (req, res) => res.render('activity/index.njk'));
