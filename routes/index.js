import adminRoutes from './admin.js';
import reserveRoutes from './reservations.js';
import roomsRoutes from './rooms.js';

import {static as staticDir} from 'express';

const constructorMethod = (app) => {
    app.use('/admin', adminRoutes);
    app.use('./reservations', reserveRoutes);
    app.use ('./rooms', roomsRoutes);

    app.use('*', (req,res) => {
        res.redirect('admin/static'); //idk about this line 
    });  
}; 

export default constructorMethod;