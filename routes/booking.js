import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile('booking.html', { root: 'static' }); // Static folder should contain your HTML file
});

export default router;