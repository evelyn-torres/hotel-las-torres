import {Router} from 'express';
import * as adminData from '../data/admin.js';
import validation from '../helpers.js';
import {roomData} from '../data/index.js';
import xss from 'xss';



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
        // console.log('in post but before try');
        try { //check if user/pass combo registers as user or not → user/pass fomrat checked in function
            // console.log('reqbody', req.body);
            let {userInput, passInput} = req.body;
            
            userInput = validation.checkString(xss(userInput), "Username");
            passInput = validation.checkString(xss(passInput), "Password");
          
            const admin = await adminData.grabAdminByLogin(userInput, passInput);
            // console.log(admin);
            if(!admin){
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            req.session.user = 'admin'; //stores the logged in admin in session 
            // console.log(admin);

            return res.redirect('/admin/dashboard');
            //maybe change to redirect so it isnt just going into admin page and /login
        } catch (e) {

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
            const roomList = await roomData.getAllRooms(); // Example: Fetching room data
            roomList.forEach(room => {
                room._id = room._id.toString();
            });

            res.render('admin', {
                pageTitle: "Admin Dashboard",
                adminDetails: { name: "Admin Name", role: "Administrator" },
                rooms: roomList,
                partial: "admin_dash"
            });
        }catch(e){
            console.error("Error loading admin dashboard:", e);
            res.status(500).json({ error: 'Internal server error' });
        }
    })

router.route('/dashboard/createAdmin')
    .get(async (req, res) => {
        console.log(req.body)
        try {
            res.render('admin', {
                pageTitle: "Create Admin",
                partial: "signUp",
            });
        } catch (e) {
            res.status(500).json({ error: "Sign Up page not displayed" });
        }
    })
    .post(async (req, res) => {
        try {
            console.log(req.body)
            const roomList = await roomData.getAllRooms(); // Example: Fetching room data
            const { employeeFirstName, employeeLastName, govID, userName, password, confirmPassword } = req.body;
            console.log(employeeFirstName)
            let empFirstName = validation.checkString(employeeFirstName, "Employee First Name");
            let empLastName = validation.checkString(employeeLastName, "Employee Last Name"); 
            let empGovID = validation.checkString(govID, "GovernmentID"); 
            let empUser = validation.checkString(userName, "Employee User Name"); 
            let empPass = validation.checkString(password, "Employee Password");
            let empConfirmPass = validation.checkString(confirmPassword, "Employee Confirm Password");

            if (empFirstName.length < 2) throw "Employee first name must be at least two characters";
            if (empFirstName.length > 25) throw "Employee first name must be shorter than 25 characters";
            if (empLastName.length < 2) throw "Employee last name must be at least two characters";
            if (empLastName.length > 25) throw "Employee last name must be shorter than 25 characters";
            if (empUser.length < 5) throw "Employee username must be at least 5 characters";
            if (empPass.length > 25) throw "Employee username must be shorter than 25 characters"
            if (empPass.length < 5) throw "Employee password must be at least 5 characters";
            if (empPass.length > 25) throw "Employee password must be less than 25 characters";
            if (empPass !== empConfirmPass) throw "Passwords must match";
            if (empUser.includes(" ")) throw "User name cannot contain spaces";
            if (empFirstName.includes(" ")) throw "First name cannot contain spaces";
            if (empLastName.includes(" ")) throw "Last name cannot contain spaces";
            if (empGovID.includes(" ")) throw "Government ID cannot contain spaces";
            if (empPass.includes(" ")) throw "Password cannot contain spaces";
            
            //create new admin 
            const newAdmin = await adminData.createAdmin(empFirstName, empLastName, empGovID, empUser, empPass); 
            if(!newAdmin) throw "couldn't create admin"

            res.render('admin', {
                pageTitle: "Admin Dashboard",
                adminDetails: { name: "Admin Name", role: "Administrator" },
                rooms: roomList,
                partial: "admin_dash", 
                successMessage: "Admin has been created!" 
            });
        } catch (e) {
            console.error("Error during login:", e);

            // Render the login page with error details
            return res.status(400).render('partials/signUp', { 
                partial: "dead_server_script", 
                pageTitle: "Employee Login", 
                hasErrors: true, 
                errors: [e]
            });
        }
    });

export default router;