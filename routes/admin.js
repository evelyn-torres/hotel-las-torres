import {Router} from 'express';
import * as adminData from '../data/admin.js';
//import validation from '../helpers';

const router = Router();

router
    .route('/')
    .get(async (req, res)=>{
        try{
            const adminList = await adminData.getAll
        }catch(e){
            res.status(500).json({error: e});
        }
        res.render('admin', {pageTitle: "Employee Login"})
    }
)


export default router;