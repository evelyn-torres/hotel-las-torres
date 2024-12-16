import express from 'express';
import exphbs from 'express-handlebars';
import constructorMethod from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import {dirname} from 'path';
import contactRoutes from './routes/contact.js';
import cookieParser from "cookie-parser";
import session from "express-session";
import methodOverride from 'method-override';

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handlebars setup
const handlebars = exphbs.create({ defaultLayout: 'main' });
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
app.use('/login', (req, res, next) => {
  const user = req.session.user;
  if (user && user.toLowerCase() === 'admin') {
    console.log('in app.js ')
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
// const roomsRouter = require('./routes/rooms.js');
// app.use('/rooms', roomsRouter);

app.use(methodOverride('_method'));


constructorMethod(app);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


//TESTING
// import * as roomFuncs from './data/rooms.js';

// try {
//     console.log(await roomFuncs.getAllRooms());
// } catch(e) {
//     console.log(e)
// }