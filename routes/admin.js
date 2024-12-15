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
        try { //check if user/pass combo registers as user or not → user/pass fomrat checked in function
            let {userInput, passInput} = req.body;
            
            userInput = validation.checkString(userInput, "Username");
            passInput = validation.checkString(passInput, "Password");
            const admin = await adminData.grabAdminByLogin(userInput, passInput);
            console.log(admin);
            if(!admin){
                return res.render('login', { 
                    partial: "dead_server_script", 
                    pageTitle: "Employee Login", 
                    error: 'Invalid username or password' 
            })
        }
            req.session.user = 'admin'; //stores the logged in admin in session 
            console.log(admin);

            return res.redirect('/admin/dashboard');
            //maybe change to redirect so it isnt just going into admin page and /login
        } catch (e) {


            console.log('in catch statement for post of admin login');
            console.error(e);
            return res.render('login', { 
                partial: "dead_server_script", 
                pageTitle: "Employee Login", 
                error: 'Invalid username or password' 
        })}

    })
router.get('/dashboard', async (req,res) => {
        try{
            if(!req.session.user || req.session.user.toLowerCase() !== 'admin'){
                return res.redirect('/login');
            }
            const rooms = await roomData.getAllRooms(); // Example: Fetching room data
            console.log('admin/dashboard in admin routes');
            res.render('admin', {
                pageTitle: "Admin Dashboard",
                adminDetails: { name: "Admin Name", role: "Administrator" }
              
            });
        }catch(e){
            console.error("Error loading admin dashboard:", e);
            res.status(500).json({ error: 'Internal server error' });
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