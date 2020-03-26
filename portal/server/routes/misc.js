import express from 'express';

const router = express.Router();

router.get('/feedback', (req, res) => res.render('feedback.njk'));

router.post('/feedback', (req, res) => res.redirect('./feedback'));

router.get('/contact-us', (req, res) => res.render('contact.njk'));

export default router;
