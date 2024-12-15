import {Router} from 'express';
import * as adminData from '../data/admin.js';
import validation from '../helpers.js';
import {roomData} from '../data/index.js';


const router = Router();

router.route('/')
    .get(async (req, res)=>{
        try{
            res.render('login', { partial: "dead_server_script", pageTitle: "Employee Login"})
        }catch(e){
            res.status(500).json({ error: 'Internal server error' });
        }
    })
    .post( async (req,res) => {
        const adminInput = req.body;
        let errors = [];
        try { //check if user/pass combo registers as user or not → user/pass fomrat checked in function
            const admin = await adminData.grabAdminByLogin(adminInput.userInput, adminInput.passInput);
            const roomList = await roomData.getAllRooms();
            res.render("admin",{ partial: "dead_server_script", employee: admin, message: `Welcome ${admin.employeeFirstName} ${admin.employeeLastName}`, rooms: roomList});
            //maybe change to redirect so it isnt just going into admin page and /login
        } catch (e) {
            errors.push(e);
        }
        if (errors.length > 0){
           //console.log(errors);
           return res.render("login", {hasErrors: true, errors: errors, partial: "dead_server_script"});
        }
    })
    // .delete(async (req, res) => {
    //     //check the id
    //     // try {
    //     //   req.params.id = validation.checkId(req.params.id, 'Id URL Param');
    //     // } catch (e) {
    //     //   return res.status(400).json({error: e});
    //     // }
    //     //try to delete post
    //     try {
    //       let deletedRoom = await roomData.removeRoom(req.params.id);
    //       return res.json(deletedPost);
    //     } catch (e) {
    //       return res.status(404).json({error: e});
    //     }
    //   });
export default router;