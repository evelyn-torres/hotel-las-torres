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
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true in production with HTTPS
  })
);

app.use(methodOverride('_method'));

// Static
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/pics', express.static("public/pics"));
app.use('/pics', express.static('pics'));

// Routes
app.use('/contact', contactRoutes);
app.use('/tourism', tourismRoutes);
app.use('/admin', adminRoutes);
app.use('/rooms', roomsRoutes);  // ✅ mount rooms route

// Request logger
app.use((req, res, next) => {
  const currentTime = new Date().toUTCString();
  const user = req.session.user;
  const status = user
    ? `Authenticated ${user.role === "Administrator" ? "Administrator" : "User"}`
    : "Non-Authenticated";
  console.log(`[${currentTime}]: ${req.method} ${req.originalUrl} (${status})`);
  next();
});

// Login redirect for admin
app.use('/login', (req, res, next) => {
  const user = req.session.user;
  if (user && typeof user === "string" && user.toLowerCase() === 'admin') {
    req.session.user = { role: 'Administrator' }; // ✅ fix reassign
    return res.redirect('/admin/dashboard');
  }
  next();
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
