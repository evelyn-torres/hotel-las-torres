import {Router} from 'express';
import * as adminData from '../data/admin.js';
//import validation from '../helpers';

const router = Router();

router.route('/').get(async (req, res) => {
    try {
        res.render('admin', { partial: 'admin_script' }); 
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;