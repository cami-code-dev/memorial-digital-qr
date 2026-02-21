const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const {
  getMemorialByAdminToken, updateMemorial, deleteMemorial,
  getEntriesByMemorial, deleteEntry
} = require('../db/queries');

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

router.get('/:adminToken', async (req, res) => {
  try {
    const memorial = await getMemorialByAdminToken(req.params.adminToken);
    if (!memorial) return res.status(404).render('error', { message: 'Memorial no encontrado' });

    const entries = await getEntriesByMemorial(memorial.id);

    const host = req.get('host');
    const protocol = req.protocol;
    const accessUrl = `${protocol}://${host}/m/${memorial.access_token}`;
    const qrDataUrl = await QRCode.toDataURL(accessUrl, { width: 300, margin: 2 });

    res.render('admin', {
      memorial,
      entries,
      adminToken: req.params.adminToken,
      qrDataUrl,
      accessUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al cargar el panel de administración' });
  }
});

router.post('/:adminToken/update', upload.single('coverImage'), async (req, res) => {
  try {
    const memorial = await getMemorialByAdminToken(req.params.adminToken);
    if (!memorial) return res.status(404).render('error', { message: 'Memorial no encontrado' });

    const updates = {
      name: req.body.name,
      birthDate: req.body.birthDate,
      deathDate: req.body.deathDate,
      description: req.body.description
    };

    if (req.file) {
      updates.coverImage = `/uploads/${req.file.filename}`;
    }

    await updateMemorial(memorial.id, updates);
    res.redirect(`/admin/${req.params.adminToken}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al actualizar el memorial' });
  }
});

router.post('/:adminToken/delete-entry/:entryId', async (req, res) => {
  try {
    const memorial = await getMemorialByAdminToken(req.params.adminToken);
    if (!memorial) return res.status(404).render('error', { message: 'Memorial no encontrado' });

    const { getEntryById } = require('../db/queries');
    const entry = await getEntryById(req.params.entryId);
    if (!entry || entry.memorial_id !== memorial.id) {
      return res.status(403).render('error', { message: 'No tienes permiso para eliminar este recuerdo' });
    }

    await deleteEntry(req.params.entryId);
    res.redirect(`/admin/${req.params.adminToken}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al eliminar el recuerdo' });
  }
});

router.post('/:adminToken/delete', async (req, res) => {
  try {
    const memorial = await getMemorialByAdminToken(req.params.adminToken);
    if (!memorial) return res.status(404).render('error', { message: 'Memorial no encontrado' });

    await deleteMemorial(memorial.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al eliminar el memorial' });
  }
});

module.exports = router;
