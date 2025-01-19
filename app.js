import express from 'express';
import exphbs from 'express-handlebars';
import constructorMethod from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import {dirname} from 'path';
import contactRoutes from './routes/contact.js';
import tourismRoutes from './routes/tourism.js';
import cookieParser from "cookie-parser";
import session from "express-session";
import methodOverride from 'method-override';
import roomsRoutes from './routes/rooms.js'; 
import dotenv from 'dotenv';
dotenv.config();

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handlebars setup
const handlebars = exphbs.create({ defaultLayout: 'main', helpers: {eq: (a, b) => a === b} });
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials' ),
  }));


  app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


// Middleware for parsing and static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set secure to true in production with HTTPS
    })
);

app.use('/public', express.static(path.join(__dirname, 'static')));
app.use('/contact', contactRoutes);
app.use('/tourism', tourismRoutes);
app.use('/pics', express.static("public/pics"));
app.use('/pics', express.static('pics'));

app.get('/test-image', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pics/room_pics/room5.jpg'));
});

// Middleware 1: Log requests
app.use((req, res, next) => {
  const currentTime = new Date().toUTCString();
  const user = req.session.user;
  const status = user
    ? `Authenticated ${user.role === "Administrator" ? "Administrator" : "User"}`
    : "Non-Authenticated";
  console.log(`[${currentTime}]: ${req.method} ${req.originalUrl} (${status})`);
  next();
});




// // Middleware 2: Redirect authenticated users from /login
// app.use("/login", (req, res, next) => {
//   const user = req.session.user;
//   if (user) {
//     return res.redirect(
//       user.role.toLowerCase() === "administrator" ? "/administrator" : "/user"
//     );
//   }
//   next();
// });




app.use('/login', (req, res, next) => {
  const user = req.session.user;
  if (user && user.toLowerCase() === 'admin') {
    // console.log('in app.js ')
      user = {role: 'Administrator'};
      return res.redirect('/admin/dashboard'); // Correctly redirect to admin page
  }
  next(); 
});




app.get('/logout', (req, res)=>{
  req.session.destroy((err) =>{
    if (err){
      console.error('Error destroying session:', err);
      return res.status(500).json({error: 'failed to logout'});
    }
    res.redirect('/login');
  })
})


//HELLLOOOOOOOO



app.use(methodOverride('_method'));





constructorMethod(app);


app.use((req, res) => {
  res.status(404).render('error404', {
    pageTitle: 'Page Not Found',
    layout: false 
  });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { message: "Internal Server Error" });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

