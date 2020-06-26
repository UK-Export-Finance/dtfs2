import express from 'express';

const router = express.Router();

router.get('/feedback', (req, res) => res.render('feedback.njk', { user: req.session.user }));

router.post('/feedback', (req, res) => res.redirect('/feedback'));

router.get('/contact-us', (req, res) => res.render('contact.njk', { user: req.session.user }));

router.get('/cookies', (req, res) => res.render('cookies.njk', { user: req.session.user }));

router.get('/not-found', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

export default router;
