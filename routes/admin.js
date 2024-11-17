import {Router} from 'express';
import * as adminData from '../data/admin.js';

const router = Router();

router
    .route('/')
    .get(async (req, res)=>{
        res.render('admin', {pageTitle: "Employee Login"})
    }
    )


export default router;