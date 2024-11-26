import express from "express";
const router = express.Router();

router.route('/').get(async (req, res) => {
  try {
      res.render('booking', { partial: 'booking_script' }); 
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;