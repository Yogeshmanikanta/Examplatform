import pool from '../config/db.js';

export const UserModel = {
  // Find user by email
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    return result.rows[0] || null;
  },

  // Find user by mobile
  async findByMobile(mobile) {
    const result = await pool.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
    return result.rows[0] || null;
  },

  // Find user by ID
  async findById(id) {
    const result = await pool.query(
      'SELECT id, full_name, email, mobile, role, is_verified, profile_photo, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Create new user
  async create({ full_name, email, mobile, password_hash, role = 'candidate' }) {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, mobile, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, mobile, role, is_verified, created_at`,
      [full_name, email.toLowerCase(), mobile, password_hash, role]
    );
    return result.rows[0];
  },

  // Update verification status
  async verifyEmail(userId) {
    const result = await pool.query(
      'UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [userId]
    );
    return result.rows[0];
  },

  // Update password
  async updatePassword(userId, password_hash) {
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      password_hash,
      userId,
    ]);
  },

  // Save OTP
  async saveOTP(userId, email, otp_code, purpose) {
    // Delete old OTPs for this user+purpose
    await pool.query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, purpose]);
    // Insert new OTP - expires in 10 minutes
    const result = await pool.query(
      `INSERT INTO otps (user_id, email, otp_code, purpose, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '10 minutes')
       RETURNING *`,
      [userId, email, otp_code, purpose]
    );
    return result.rows[0];
  },

  // Verify OTP
  async verifyOTP(email, otp_code, purpose) {
    const result = await pool.query(
      `SELECT * FROM otps 
       WHERE email = $1 AND otp_code = $2 AND purpose = $3 
       AND is_used = false AND expires_at > NOW()`,
      [email, otp_code, purpose]
    );
    if (result.rows.length === 0) return null;

    // Mark OTP as used
    await pool.query('UPDATE otps SET is_used = true WHERE id = $1', [result.rows[0].id]);
    return result.rows[0];
  },

  // Add these inside UserModel object

  async findAllCandidates() {
    const result = await pool.query(
      `SELECT id, full_name, email, mobile, role, is_verified, created_at
     FROM users WHERE role = 'candidate'
     ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async updateCandidate(id, { full_name, email, mobile }) {
    const result = await pool.query(
      `UPDATE users SET full_name=$1, email=$2, mobile=$3, updated_at=NOW()
     WHERE id=$4 AND role='candidate'
     RETURNING id, full_name, email, mobile, role, is_verified, created_at`,
      [full_name, email.toLowerCase(), mobile, id]
    );
    return result.rows[0];
  },

  async deleteCandidate(id) {
    await pool.query(`DELETE FROM results WHERE candidate_id=$1`, [id]);
    await pool.query(`DELETE FROM exam_attempts WHERE candidate_id=$1`, [id]);
    await pool.query(`DELETE FROM users WHERE id=$1 AND role='candidate'`, [id]);
  },
};
