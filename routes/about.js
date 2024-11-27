import {Router} from 'express';
import * as aboutData from '../data/about.js';

const router = Router();

router.route('/').get(async (req, res) => {
    try {
        res.render('about', { partial: 'about_script' }); 
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;