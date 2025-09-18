import { Router } from 'express';
import * as adminData from '../data/admin.js';
import validation from '../helpers.js';
import { reservationData, roomData } from '../data/index.js';
import xss from 'xss';
import { ObjectId } from 'mongodb';
import { admins } from '../config/mongoCollections.js';
import multer from 'multer';
import path from 'path';

const router = Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'public/pics/room_pics'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ---------- LOGIN ROUTES ----------
router
  .route('/')
  .get(async (req, res) => {
    try {
      if (req.session.user && req.session.user.role === 'Administrator') {
        return res.redirect('/admin/dashboard');
      }
      res.render('login', { partial: 'dead_server_script', pageTitle: 'Employee Login' });
    } catch (e) {
      console.error('GET /admin error:', e);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
  .post(async (req, res) => {
    try {
      let { userInput, passInput } = req.body;

      userInput = validation.checkString(xss(userInput), 'Username');
      passInput = validation.checkString(xss(passInput), 'Password');

      console.log('Before grabAdminByLogin', userInput, passInput);
      const admin = await adminData.grabAdminByLogin(userInput, passInput);
      console.log('After grabAdminByLogin', admin);

      if (!admin) {
        return res.status(401).render('login', {
          partial: 'dead_server_script',
          pageTitle: 'Employee Login',
          error: 'Invalid username or password',
        });
      }

      // ---------- CHANGED: Use direct assignment, no req.session.save() needed ----------
      req.session.user = { role: 'Administrator', username: userInput };

      // Redirect after successful login
      return res.redirect('/admin/dashboard');
    } catch (e) {
      console.error('POST /admin login error:', e);
      return res.render('login', {
        partial: 'dead_server_script',
        pageTitle: 'Employee Login',
        error: 'Invalid username or password',
      });
    }
  });

// ---------- DASHBOARD ----------
router.get('/dashboard', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'Administrator') {
      return res.redirect('/admin'); // Redirect to login if not admin
    }

    console.log('SESSION DATA:', req.session);

    const roomList = await roomData.getAllRooms();
    roomList.forEach((room) => {
      room._id = room._id.toString();
      room.roomNumber = room.roomNumber || room.roomName;
      room.availability = room.availability || { open: true, booked: false };
    });

    res.render('admin', {
      pageTitle: 'Admin Dashboard',
      adminDetails: { name: 'Admin Name', role: 'Administrator' },
      rooms: roomList,
      partial: 'admin_dash',
      isAdmin: true,
    });
  } catch (e) {
    console.error('Error loading admin dashboard:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- RESERVATIONS ----------
router.get('/reservations', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'Administrator') {
      return res.redirect('/admin');
    }

    const allReservations = await reservationData.getAllReservations();
    console.log('All Reservations:', allReservations);

    res.render('admin', {
      pageTitle: 'Reservations',
      adminDetails: { name: 'Admin Name', role: 'Administrator' },
      reservations: allReservations,
      partial: 'admin_reservations',
      isAdmin: true,
    });
  } catch (e) {
    console.error('Error loading reservations:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- REMOVE RESERVATION ----------
router.post('/:reservationId/remove', async (req, res) => {
  try {
    const reservationId = req.params.reservationId;
    if (!reservationId || !ObjectId.isValid(reservationId)) {
      throw 'Invalid reservation ID';
    }

    const deleted = await reservationData.removeReservation(reservationId);
    if (!deleted) throw 'Could not delete reservation';

    res.redirect('/admin/reservations');
  } catch (e) {
    console.error('Error removing reservation:', e);
    res.status(500).send('Error removing reservation');
  }
});

// ---------- ENSURE ADMIN MIDDLEWARE ----------
export function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'Administrator') {
    return res.status(403).render('error', {
      pageTitle: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      partial: 'dead_server_script',
    });
  }
  next();
}

// ---------- CREATE ADMIN ----------
router
  .route('/dashboard/createAdmin')
  .get(ensureAdmin, async (req, res) => {
    try {
      res.render('admin', {
        pageTitle: 'Create Admin',
        partial: 'signUp',
      });
    } catch (e) {
      console.error('GET createAdmin error:', e);
      res.status(500).json({ error: 'Sign Up page not displayed' });
    }
  })
  .post(ensureAdmin, async (req, res) => {
    try {
      const roomList = await roomData.getAllRooms();
      const { employeeFirstName, employeeLastName, govID, userName, password, confirmPassword } = req.body;

      const adminCollection = await admins();
      const user = await adminCollection.findOne({ userName: userName.toLowerCase() });

      if (user) throw 'Username already exists';

      let empFirstName = validation.checkString(employeeFirstName, 'Employee First Name');
      let empLastName = validation.checkString(employeeLastName, 'Employee Last Name');
      let empGovID = validation.checkString(govID, 'GovernmentID');
      let empUser = validation.checkString(userName, 'Employee User Name');
      let empPass = validation.checkString(password, 'Employee Password');
      let empConfirmPass = validation.checkString(confirmPassword, 'Employee Confirm Password');

      if (empPass !== empConfirmPass) throw 'Passwords must match';
      if (empUser.includes(' ') || empFirstName.includes(' ') || empLastName.includes(' ') || empGovID.includes(' ') || empPass.includes(' '))
        throw 'No spaces allowed in any field';

      const newAdmin = await adminData.createAdmin(empFirstName, empLastName, empGovID, empUser.toLowerCase(), empPass);
      if (!newAdmin) throw "Couldn't create admin";

      res.render('admin', {
        pageTitle: 'Admin Dashboard',
        adminDetails: { name: 'Admin Name', role: 'Administrator' },
        rooms: roomList,
        partial: 'admin_dash',
        successMessage: 'Admin has been created!',
      });
    } catch (e) {
      console.error('Error creating admin:', e);
      return res.status(400).render('partials/signUp', {
        partial: 'dead_server_script',
        pageTitle: 'Employee Login',
        hasErrors: true,
        errors: [e],
      });
    }
  });

// ---------- ADD ROOM ----------
router
  .route('/addRoom')
  .get(ensureAdmin, (req, res) => {
    try {
      res.render('addRoom', { pageTitle: 'Add New Room', hasErrors: false });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post(ensureAdmin, async (req, res) => {
    try {
      const { roomName, balcony, bedSizes, pricingPerNight, availability } = req.body;

      const newRoom = await roomData.createRoom(
        validation.checkString(roomName, 'Room Name'),
        balcony === 'true',
        JSON.parse(bedSizes),
        parseFloat(pricingPerNight),
        JSON.parse(availability)
      );

      res.redirect('/admin/dashboard'); // simpler redirect instead of rendering dashboard
    } catch (e) {
      console.error('Error adding room:', e);
      res.status(400).render('addRoom', {
        pageTitle: 'Add a New Room',
        hasErrors: true,
        errors: [e],
      });
    }
  });

// ---------- EDIT ROOM ----------
router
  .route('/editRoom/:roomId')
  .get(ensureAdmin, async (req, res) => {
    try {
      const room = await roomData.getRoomById(req.params.roomId);
      res.render('updateRoom', {
        roomId: room._id.toString(),
        roomName: room.roomName,
        pricingPerNight: room.pricingPerNight,
        balcony: room.balcony === true || room.balcony === 'true',
        bedSizes: Object.entries(room.bedSizes)
          .map(([size, count]) => `${size}:${count}`)
          .join(','),
        imagePath: room.imagePath,
        partial: 'edit_script',
      });
    } catch (e) {
      console.error('Error fetching room data:', e);
      res.status(500).send('Error fetching room data: ' + e);
    }
  })
  .post(ensureAdmin, upload.single('roomImage'), async (req, res) => {
    try {
      const roomId = req.params.roomId;
      const { roomName, balcony, bedSizes, pricingPerNight, deleteImage } = req.body;

      let newBedSize = {};
      bedSizes.split(',').forEach((bed) => {
        newBedSize[bed.split(':')[0]] = parseInt(bed.split(':')[1]);
      });

      // ---------- CHANGED: mutable imagePath ----------
      let imagePath = req.file ? `/pics/room_pics/${req.file.filename}` : undefined;
      if (deleteImage === 'true') imagePath = null;

      await roomData.updateRoom(
        roomId,
        roomName,
        balcony === 'true',
        newBedSize,
        parseFloat(pricingPerNight),
        imagePath
      );

      res.redirect('/admin/dashboard');
    } catch (e) {
      console.error('Error updating room:', e);
      res.status(500).send('Error updating room: ' + e);
    }
  });

// ---------- TOGGLE ROOM STATUS ----------
router.post('/:roomId/toggleStatus', ensureAdmin, async (req, res) => {
  try {
    const room = await roomData.getRoomById(req.params.roomId);
    if (!room) throw 'Room not found';

    const newStatus = room.status === 'ready' ? 'unavailable' : 'ready';
    await roomData.updateRoomStatus(req.params.roomId, newStatus);

    res.redirect('/admin/dashboard');
  } catch (e) {
    console.error('Error toggling room status:', e);
    res.status(500).send('Error toggling room status');
  }
});

export default router;
