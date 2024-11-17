import adminRoutes from './admin.js';
import reserveRoutes from './reservations.js';
import roomsRoutes from './rooms.js';
import landingRoutes from './landing.js';
import path from 'path';
import { static as staticDir } from 'express';

const constructorMethod = (app) => {
    // Static files setup
    app.use('/public', staticDir(path.resolve('public')));

    // Routes setup
    app.use('/', landingRoutes);
    app.use('/admin', adminRoutes);
    app.use('/reservations', reserveRoutes);
    app.use('/rooms', roomsRoutes);
    // app.use('/contact');


    // 404 Handler
    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
};

export default constructorMethod;
