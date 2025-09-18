import express from 'express';
import exphbs from 'express-handlebars';
import constructorMethod from './routes/index.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import contactRoutes from './routes/contact.js';
import tourismRoutes from './routes/tourism.js';
import cookieParser from "cookie-parser";
import session from "express-session";
import methodOverride from 'method-override';
import roomsRoutes from './routes/rooms.js'; 
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.js'; 
import { removeReservation } from './data/reservations.js';
import { dbConnection } from './config/mongoConnection.js';
import MongoStore from 'connect-mongo';
import {ensureAdmin} from './routes/admin.js';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Handlebars setup with helpers
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials/'),
  helpers: {
    eq: (a, b) => a === b
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName:process.env.DB_NAME,
      collectionName:"sessions"
    }),
    cookie: { 
      httpOnly:true,
      secure:  process.env.NODE_ENV === "production" && req/protocol === "https",  // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 1000*60*60 //1 hour

  }})
);

app.use(methodOverride('_method'));

// Static
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/pics', express.static("public/pics"));
app.use('/pics', express.static('pics'));



//request logger
app.use((req, res, next) => {
  const currentTime = new Date().toUTCString();
  const user = req.session.user;
  const status = user
    ? `Authenticated ${user.role}`
    : "Non-Authenticated";
  console.log(`[${currentTime}]: ${req.method} ${req.originalUrl} (${status})`);
  next();
});


// Routes
app.use('/contact', contactRoutes);
app.use('/tourism', tourismRoutes);
app.use('/admin', adminRoutes);
app.use('/rooms', roomsRoutes);  // ✅ mount rooms route



// Login redirect for admin
// app.use('/login', (req, res, next) => {
//   const user = req.session.user;
//   if (user && typeof user === "string" && user.toLowerCase() === 'admin') {
//     req.session.user = { role: 'Administrator' }; // ✅ fix reassign
//     return res.redirect('/admin/dashboard', ensureAdmin, adminRoutes);
//   }
//   next();
// });

app.get('/test-db', async (req, res) => {
  try {
    const db = await dbConnection();
    const collections = await db.listCollections().toArray();
    res.json({
      status: 'connected',
      collections: collections.map(c => c.name)
    });
  } catch (e) {
    console.error("DB Connection Error:", e);
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'failed to logout' });
    }
    res.redirect('/login');
  });
});

// Attach your main routes
constructorMethod(app);

// 404
app.use((req, res) => {
  res.status(404).render('error404', {
    pageTitle: 'Page Not Found',
    layout: false
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { message: "Internal Server Error" });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

export default app;
