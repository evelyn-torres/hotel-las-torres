import {Router} from 'express';
import * as adminData from '../data/admin.js';
import validation from '../helpers.js';
import {reservationData, roomData} from '../data/index.js';
import xss from 'xss';
import { ObjectId } from 'mongodb';
import {admins} from '../config/mongoCollections.js';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'public/pics/room_pics'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.route('/')
    // .get(async (req, res)=>{
    //     try{
    //         res.render('login', { partial: "dead_server_script", pageTitle: "Employee Login"})
    //     }catch(e){
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // })
    

        router.post('/', async (req, res) => {

            try {
                let { userInput, passInput } = req.body;
                console.log("Login attempt:", userInput);

                // Validate and sanitize inputs
                userInput = validation.checkString(xss(userInput), "Username");
                passInput = validation.checkString(xss(passInput), "Password");

                // Check login credentials
                const admin = await adminData.grabAdminByLogin(userInput, passInput);
                if (!admin) {
                    return res.status(401).render('login', {
                        partial: "dead_server_script",
                        pageTitle: "Employee Login",
                        error: 'Invalid username or password'
                    });
                }

                // Set session
                req.session.user = { role: "Administrator", username: userInput };

                // ✅ Save session before redirecting
                req.session.save(err => {
                    if (err) {
                        console.error("Session save error: ", err);
                        return res.status(500).render('login', {
                            partial: "dead_server_script",
                            pageTitle: "Employee Login",
                            error: "Failed to login, please try again | IN SESSION SAVE!!!"
                        });
                    }

                    // Redirect to dashboard after session is saved
                    console.log("✅ Session saved for:", req.session.user);
                    return res.redirect('/admin/dashboard');
                });

            } catch (e) {
                console.error("Login error:", e);
                return res.status(500).render('login', {
                    partial: "dead_server_script",
                    pageTitle: "Employee Login",
                    error: 'An error occurred during login. Please try again.'
                });
            }
        });


router.get('/dashboard', async (req,res) => {
        try{
            if(!req.session.user ||req.session.user.role !== "Administrator"){
                return res.redirect('/admin'); //???
            }
            const roomList = await roomData.getAllRooms(); // Example: Fetching room data
            roomList.forEach(room => {
    room._id = room._id.toString();
    room.roomNumber = room.roomNumber || room.roomName;
    room.availability = room.availability || { open: true, booked: false };
            });
            

            res.render('admin', {
                pageTitle: "Admin Dashboard",
                adminDetails: { name: "Admin Name", role: "Administrator" },
                rooms: roomList,
                //partial: "admin_dash",
                isAdmin: true
              
            });
        }catch(e){
            console.error("Error loading admin dashboard:", e);
            res.status(500).json({ error: 'Internal server error' });
        }
    })
router.get('/reservations', async (req,res) => {
    try{
        if(!req.session.user ||req.session.user.role !== "Administrator"){
            return res.redirect('/login');
        }
        const allReservations = await reservationData.getAllReservations();
       console.log("All Reservations:", allReservations); // Log the reservations data
       //res.render('reservations', { reservations: allReservations });

        res.render('admin', {
            pageTitle: "Reservations",
            adminDetails: { name: "Admin Name", role: "Administrator" },
            reservations: allReservations,
            partial: "admin_reservations",
            isAdmin: true
          
        });
    }catch(e){
        console.error("Error loading admin dashboard:", e);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/:reservationId/remove', async (req, res) =>{
        try {
            const reservationId = req.params.reservationId;

            // Validate reservationId
            if (!reservationId || typeof reservationId !== 'string' || !ObjectId.isValid(reservationId)) {
                throw 'Error: Invalid reservation ID';
            }

            // Remove the reservation
            const reservationToDelete = await reservationData.removeReservation(reservationId);
            if (!reservationToDelete) {
                throw 'Error: Could not delete reservation';
            }
            const allReservations = await reservationData.getAllReservations();

            // Redirect to reservations page to reload the data
            res.redirect('/admin/reservations');
        }catch(e){
            res.status(500).send("Error toggling room status");
        }
    })


function ensureAdmin(req, res, next) {
        if (!req.session.user || req.session.user.role !== "Administrator") {
            return res.status(403).render('error', {
                pageTitle: 'Access Denied',
                message: 'You do not have permission to perform this action.',
                partial: "dead_server_script"
            });
        }
        next();
    }

router.route('/dashboard/createAdmin')
    .get(ensureAdmin, async (req, res) => {
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
    .post(ensureAdmin, async (req, res) => {
        try {
            console.log(req.body)
            const roomList = await roomData.getAllRooms(); // Example: Fetching room data
            const { employeeFirstName, employeeLastName, govID, userName, password, confirmPassword } = req.body;

            const adminCollection = await admins();
            // const adminList = await adminData.getAllAdmin();
            const user = await adminCollection.findOne({userName: userName.toLowerCase()});

            if (user) {
                console.log("Duplicate username:", user.userName);
                throw "Username already exists";
            }
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
            const newAdmin = await adminData.createAdmin(empFirstName, empLastName, empGovID, empUser.toLowerCase(), empPass); 
            if(!newAdmin) throw "couldn't create admin"

            res.render('admin', {
                pageTitle: " Create Administrator",
                adminDetails: { name: "Admin Name", role: "Administrator" },
                rooms: roomList,
                showCreateAdmin: true,
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

router.route('/addRoom')
    .get(ensureAdmin, (req,res) =>{
        try{
            res.render('addRoom', {pageTitle: 'Add New Room', hasErrors: false});
        }catch(e){
            console.error(e);
            res.status(500).json({error: 'Internal Server Error'})
        }
    })
    .post(async (req, res)=>{
        const newRoomData = req.body;
        let errors =[];
        try{
            const roomName = validation.checkString(newRoomData.roomName, 'Room Name');
            const balcony = newRoomData.balcony === 'true';
            const bedSizes = JSON.parse(newRoomData.bedSizes); 
            const pricingPerNight = parseFloat(newRoomData.pricingPerNight);
            const availability = JSON.parse(newRoomData.availability); 
            const newRoom = await roomData.createRoom(roomName, balcony, bedSizes, pricingPerNight, availability);

            res.status(201).render('admin/dashboard', {
            success: true,
            successMessage: `Room "${newRoom.roomName}" has been successfully added.`,
            rooms: await roomData.getAllRooms(),
            pageTitle: 'Rooms',
            partial: 'rooms',
            });

        } catch(e) {
            console.error(e);
            errors.push(e);
            res.status(400).render('addRoom', {
            pageTitle: 'Add a New Room',
            hasErrors: true,
            errors: errors,
            partial: 'rooms',
            });
        }
    });

router.route('/editRoom/:roomId')
    .get(ensureAdmin, async (req,res) => {
        const roomId = req.params.roomId;
        console.log('tried')
        try {
            const room = await roomData.getRoomById(roomId); 
            res.render('updateRoom', { 
                roomId: room._id.toString(), 
                roomName: room.roomName, 
                pricingPerNight: room.pricingPerNight,
                balcony: room.balcony === true || room.balcony === "true",
                bedSizes: Object.entries(room.bedSizes)
                    .map(([size, count]) => `${size}:${count}`)
                    .join(","),
                imagePath: room.imagePath,
                partial: "edit_script"
                
            });
        } catch (e) {
            console.log('error fetching room data');
            res.status(500).send('Error fetching room data: ' + e);
        }
    })
    .post(ensureAdmin, 
        upload.single('roomImage'),
        async (req,res) => {
        const roomId = req.params.roomId;
        console.log("update", req.body, roomId);
        try {
            const { roomName, balcony, bedSizes, pricingPerNight, deleteImage} = req.body;
            let newBedSize = {};
            bedSizes.split(",").forEach((bed) => {
                newBedSize[bed.split(":")[0]] = parseInt(bed.split(":")[1]);
            });

            let imagePath = req.file ? `/pics/room_pics/${req.file.filename}` : undefined;

            if (deleteImage === "true"){
                imagePath = null;
            }

            const updatedRoomInfo = await roomData.updateRoom(
                roomId,
                roomName,
                balcony === 'true',
                newBedSize,
                parseFloat(pricingPerNight),
                imagePath
            );
            //if (!updatedRoomInfo || updatedRoomInfo === undefined) throw "Admin Error: Error updating room, please try again later";
            res.redirect('/admin/dashboard'); // go back to admin page after update
        } catch (e) {
            console.log(e);
            res.status(500).send('Error updating room: ' + e);
        }
    });

router.route('/:roomId/toggleStatus')
    .post(ensureAdmin, async (req, res) => {
        const { roomId } = req.params;
        try {
            const room = await roomData.getRoomById(roomId);
            if (!room) throw "Room not found";
            //rooms will only be availible or unavailible 
            const newStatus = room.status === "ready" ? "unavailable" : "ready";
            await roomData.updateRoomStatus(roomId, newStatus);
            res.redirect('/admin/dashboard');
        } catch (e) {
            console.error(e);
            res.status(500).send("Error toggling room status");
        }
    });


export default router;