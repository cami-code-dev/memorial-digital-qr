const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const { createMemorial, getAllMemorials } = require('../db/queries');

router.get('/', async (req, res) => {
  try {
    res.render('home');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al cargar la página' });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { name, birthDate, deathDate, description } = req.body;
    const accessToken = crypto.randomBytes(16).toString('hex');
    const adminToken = crypto.randomBytes(16).toString('hex');

    const memorial = await createMemorial({
      name,
      birthDate,
      deathDate,
      description,
      coverImage: null,
      accessToken,
      adminToken
    });

    res.redirect(`/admin/${adminToken}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al crear el memorial' });
  }
});

module.exports = router;
