import {Router} from 'express';
import * as contactFuncs from '../data/contact.js';

const router = Router();

router.route('/').get(async (req, res) => {
    try {
        res.render('contact', { partial: 'contact_script' }); 
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;