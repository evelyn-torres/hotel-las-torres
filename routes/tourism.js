import {Router} from 'express';


const router = Router();

router.route('/').get(async (req, res) => {
    try {
        res.render('tourism', { partial: 'tourism_script' }); 
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;