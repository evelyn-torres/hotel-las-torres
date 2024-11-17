import {Router} from 'express';
import * as aboutData from '../data/about.js';

const router = Router();

router
    .route('/')
    .get(async (req, res)=>{
        res.render('about', {pageTitle: "About Us"})
    }
)


export default router;