import express from 'express';

const router = express.Router();

router.get('/feedback', (req, res) => res.render('feedback.njk'));

router.post('/feedback', (req, res) => res.redirect('/feedback'));

router.get('/contact-us', (req, res) => res.render('contact.njk'));

router.get('/cookies', (req, res) => res.render('cookies.njk'));

router.get('/mga', (req, res) => res.render('mga.njk'));

export default router;
