import {Router} from 'express';
import * as adminData from '../data/admin.js';
import validation from '../helpers.js';

const router = Router();

router.route('/')
    .get(async (req, res)=>{
        try{
            res.render('login', {pageTitle: "Employee Login"})
        }catch(e){
            res.status(500).json({ error: 'Internal server error' });
        }
    })
    .post( async (req,res) => {
        const adminInput = req.body;
        let errors = [];
        try { //check if user/pass combo registers as user or not → user/pass fomrat checked in function
            const admin = await adminData.grabAdminByLogin(adminInput.userInput, adminInput.passInput);
            res.render("admin",{employee: admin, message: `Welcome ${admin.employeeFirstName} ${admin.employeeLastName}`});
            //maybe change to redirect so it isnt just going into admin page and /login
        } catch (e) {
            errors.push(e);
        }

        if (errors.length > 0){
           //console.log(errors);
           return res.render("login", {hasErrors: true, errors: errors});
        }
    });


export default router;