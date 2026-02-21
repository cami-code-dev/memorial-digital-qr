const { pool } = require('./schema');

async function createMemorial({ name, birthDate, deathDate, description, coverImage, accessToken, adminToken }) {
  const result = await pool.query(
    `INSERT INTO memorials (name, birth_date, death_date, description, cover_image, access_token, admin_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, birthDate || null, deathDate || null, description || '', coverImage || null, accessToken, adminToken]
  );
  return result.rows[0];
}

async function getMemorialByAccessToken(token) {
  const result = await pool.query('SELECT * FROM memorials WHERE access_token = $1', [token]);
  return result.rows[0];
}

async function getMemorialByAdminToken(token) {
  const result = await pool.query('SELECT * FROM memorials WHERE admin_token = $1', [token]);
  return result.rows[0];
}

async function getMemorialById(id) {
  const result = await pool.query('SELECT * FROM memorials WHERE id = $1', [id]);
  return result.rows[0];
}

async function updateMemorial(id, { name, birthDate, deathDate, description, coverImage }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (birthDate !== undefined) { fields.push(`birth_date = $${idx++}`); values.push(birthDate || null); }
  if (deathDate !== undefined) { fields.push(`death_date = $${idx++}`); values.push(deathDate || null); }
  if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
  if (coverImage !== undefined) { fields.push(`cover_image = $${idx++}`); values.push(coverImage); }

  if (fields.length === 0) return null;
  values.push(id);

  const result = await pool.query(
    `UPDATE memorials SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function deleteMemorial(id) {
  await pool.query('DELETE FROM memorials WHERE id = $1', [id]);
}

async function getAllMemorials() {
  const result = await pool.query('SELECT * FROM memorials ORDER BY created_at DESC');
  return result.rows;
}

async function getEntriesByMemorial(memorialId) {
  const result = await pool.query(
    'SELECT * FROM entries WHERE memorial_id = $1 ORDER BY created_at DESC',
    [memorialId]
  );
  return result.rows;
}

async function createEntry({ memorialId, author, body, imageUrl }) {
  const result = await pool.query(
    `INSERT INTO entries (memorial_id, author, body, image_url) VALUES ($1, $2, $3, $4) RETURNING *`,
    [memorialId, author, body, imageUrl || null]
  );
  return result.rows[0];
}

async function deleteEntry(id) {
  await pool.query('DELETE FROM entries WHERE id = $1', [id]);
}

async function getEntryById(id) {
  const result = await pool.query('SELECT * FROM entries WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = {
  createMemorial, getMemorialByAccessToken, getMemorialByAdminToken,
  getMemorialById, updateMemorial, deleteMemorial, getAllMemorials,
  getEntriesByMemorial, createEntry, deleteEntry, getEntryById
};
