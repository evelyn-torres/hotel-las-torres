import { Router } from 'express';
const router = Router();
import * as landingFuncs from '../data/landing.js';
import * as helpers from '../helpers.js';

router.route('/').get(async (req, res) => {
    try {
        res.render('landing', { partial: 'landing' }); // Render the landing template
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
