const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const aiService = require('../services/aiService');
const { protect } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

router.post('/analyze-ingredients', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image required' });
    const base64 = req.file.buffer.toString('base64');
    const ingredients = await aiService.analyzeIngredientImage(base64);
    res.json({ ingredients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
