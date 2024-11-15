import express from 'express';
import exphbs from 'express-handlebars';
import constructorMethod from './routes/index.js';

const app = express();


// Handlebars setup
const handlebars = exphbs.create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
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
