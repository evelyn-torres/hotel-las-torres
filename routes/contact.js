import {Router} from 'express';
import * as contactFuncs from '../data/contact.js';

const router = Router();

router
    .route('/')
    .get(async (req, res)=>{
        res.render('contact', {pageTitle: "Contact Us"})
    })

export default router;