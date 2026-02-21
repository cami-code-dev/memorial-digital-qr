const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMemorialByAccessToken, getEntriesByMemorial, createEntry } = require('../db/queries');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'public', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Solo se permiten imágenes'));
  }
});

router.get('/:token', async (req, res) => {
  try {
    const memorial = await getMemorialByAccessToken(req.params.token);
    if (!memorial) return res.status(404).render('error', { message: 'Memorial no encontrado' });

    const entries = await getEntriesByMemorial(memorial.id);
    res.render('memorial', { memorial, entries, token: req.params.token });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al cargar el memorial' });
  }
});

router.post('/:token/entry', upload.single('image'), async (req, res) => {
  try {
    const memorial = await getMemorialByAccessToken(req.params.token);
    if (!memorial) return res.status(404).render('error', { message: 'Memorial no encontrado' });

    const { author, body } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    await createEntry({
      memorialId: memorial.id,
      author: author || 'Anónimo',
      body,
      imageUrl
    });

    res.redirect(`/m/${req.params.token}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al agregar el recuerdo' });
  }
});

module.exports = router;
