import express from 'express';
import exphbs from 'express-handlebars';
import constructorMethod from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();


// Handlebars setup
const handlebars = exphbs.create({ defaultLayout: 'main' });
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
  }));
app.set('view engine', 'handlebars');

// Middleware for parsing and static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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