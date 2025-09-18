import express from 'express';
import exphbs from 'express-handlebars';
import constructorMethod from './routes/index.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import contactRoutes from './routes/contact.js';
import tourismRoutes from './routes/tourism.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import methodOverride from 'method-override';
import roomsRoutes from './routes/rooms.js';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.js';
import { dbConnection } from './config/mongoConnection.js';
import MongoStore from 'connect-mongo';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------- Handlebars setup ----------
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials/'),
  helpers: {
    eq: (a, b) => a === b,
  },
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// ---------- Session Setup ----------
app.use(
  session({
    name: 'session_id',
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 60 * 60, // 1 hour
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only secure in prod
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// ---------- Static Files ----------
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/pics', express.static(path.join(__dirname, 'public/pics'))); // cleaned up duplicate

// ---------- Request Logger ----------
app.use((req, res, next) => {
  const currentTime = new Date().toUTCString();
  const user = req.session.user;
  const status = user ? `Authenticated ${user.role}` : 'Non-Authenticated';
  console.log(`[${currentTime}]: ${req.method} ${req.originalUrl} (${status})`);
  next();
});

// ---------- Routes ----------
app.use('/contact', contactRoutes);
app.use('/tourism', tourismRoutes);
app.use('/admin', adminRoutes); // admin routes
app.use('/rooms', roomsRoutes);
constructorMethod(app); // main routes

// ---------- Test DB ----------
app.get('/test-db', async (req, res) => {
  try {
    const db = await dbConnection();
    const collections = await db.listCollections().toArray();
    res.json({
      status: 'connected',
      collections: collections.map((c) => c.name),
    });
  } catch (e) {
    console.error('DB Connection Error:', e);
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// ---------- Test Session ----------
app.get('/test-session', (req, res) => {
  req.session.user = { role: 'Administrator', username: 'test' };
  res.send('Session set!');
});

app.get('/check-session', (req, res) => {
  res.json(req.session);
});

// ---------- Logout ----------
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('session_id'); // ---------- added: clear cookie
    res.redirect('/admin'); // redirect to admin login
  });
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('error404', {
    pageTitle: 'Page Not Found',
    layout: false,
  });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).render('error', { message: 'Internal Server Error' });
});

// ---------- Server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
