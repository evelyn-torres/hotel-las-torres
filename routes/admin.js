import {Router} from 'express';
import * as adminData from '../data/admin.js';
import validation from '../helpers.js';
import {roomData} from '../data/index.js';
import xss from 'xss';
import { ObjectId } from 'mongodb';



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
        console.log('in post but before try');
        try { //check if user/pass combo registers as user or not → user/pass fomrat checked in function
            console.log('reqbody', req.body);
            let {userInput, passInput} = req.body;
            
            userInput = validation.checkString(xss(userInput), "Username");
            passInput = validation.checkString(xss(passInput), "Password");
          
            const admin = await adminData.grabAdminByLogin(userInput, passInput);
            console.log(admin);
            if(!admin){
                return res.status(401).json({ error: 'Invalid username or password' });
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

    });

router.route('/dashboard')
    .get(async (req,res) => {
        try{
            if(!req.session.user || req.session.user.toLowerCase() !== 'admin'){
                return res.redirect('/login');
            }
            const roomList = await roomData.getAllRooms(); // Example: Fetching room data
            roomList.forEach(room => {
                room._id = room._id.toString();
            });
            
            console.log("test", roomList);
            //console.log('admin/dashboard in admin routes');
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
    .post(async (req, res) => {
    });

router.route('/addRoom')
    .get((req,res) =>{
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
    .get(async (req,res) => {
        const roomId = req.params.roomId;
        console.log('tried')
        try {
            const room = await roomData.getRoomById(roomId); 
            res.render('updateRoom', { 
                roomId: room._id, 
                roomName: room.roomName, 
                pricingPerNight: room.pricingPerNight,
                balcony: room.balcony,
                bedSizes: Object.entries(room.bedSizes),
                partial: "edit_script"
            });
        } catch (e) {
            res.status(500).send('Error fetching room data: ' + e);
        }
    })
    .post(async (req,res) => {
        const roomId = req.params.roomId;
        console.log("update", req.body, roomId);
        try {
            const { roomName, balcony, bedSizes, pricingPerNight} = req.body;
            let newBedSize = {};
            bedSizes.split(",").forEach((bed) => {
                newBedSize[bed.split(":")[0]] = parseInt(bed.split(":")[1]);
            });
            const updatedRoomInfo = await roomData.updateRoom(
                roomId,
                roomName,
                balcony === 'true',
                newBedSize,
                parseFloat(pricingPerNight),
            );
            //if (!updatedRoomInfo || updatedRoomInfo === undefined) throw "Admin Error: Error updating room, please try again later";
            res.redirect('/admin/dashboard'); // go back to admin page after update
        } catch (e) {
            console.log(e);
            res.status(500).send('Error updating room: ' + e);
        }
    });
export default router;