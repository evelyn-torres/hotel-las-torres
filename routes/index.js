import adminRoutes from './admin.js';
import bookingRoutes from './booking.js';
import roomsRoutes from './rooms.js';
import landingRoutes from './landing.js';
import contactRoutes from './contact.js';
import aboutRoutes from './about.js';
import path from 'path';
import { static as staticDir } from 'express';

const constructorMethod = (app) => {
    // Static files setup
    app.use('/public', staticDir(path.resolve('public')));

    // Routes setup
    app.use('/', landingRoutes);
    app.use('/admin', adminRoutes);
    app.use('/booking', bookingRoutes);
    app.use('/rooms', roomsRoutes);
    app.use('/contact', contactRoutes);
    app.use('/about', aboutRoutes);


    // 404 Handler
    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
};

export default constructorMethod;
