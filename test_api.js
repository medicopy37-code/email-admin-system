require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const db = require('./database');
const { verifyAdminToken, verifyUserToken, generateToken } = require('./auth');
const Encryption = require('./encryption');
const gmailService = require('./gmailService');
const outlookService = require('./outlookService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// ========================================
// ADMIN ROUTES
// ========================================

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await db.get('SELECT * FROM admins WHERE email = ?', [email]);

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: admin.id, email: admin.email, role: 'admin' });

    res.json({
      success: true,
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Email Account
app.post('/api/admin/email-accounts', verifyAdminToken, async (req, res) => {
  try {
    const { email, password, provider, displayName } = req.body;

    // Test connection first
    let testResult;
    if (provider === 'gmail') {
      testResult = await gmailService.testConnection(email, password);
    } else if (provider === 'outlook') {
      testResult = await outlookService.testConnection(email, password);
    } else {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Notice: We don't block the addition if testResult fails, because local testers might not have App Passwords.
    const connectionMessage = testResult.success ? 'Connection verified' : ('Warning: ' + testResult.message);

    // Encrypt password
    const encryptedPassword = Encryption.encrypt(password);

    const result = await db.run(
      'INSERT INTO email_accounts (email, provider, encrypted_password, display_name, created_by) VALUES (?, ?, ?, ?, ?)',
      [email, provider, encryptedPassword, displayName, req.admin.id]
    );

    res.json({
      success: true,
      id: result.id,
      message: 'Email account added successfully'
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Email account already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get All Email Accounts
app.get('/api/admin/email-accounts', verifyAdminToken, async (req, res) => {
  try {
    const accounts = await db.all(
      'SELECT id, email, provider, display_name, status, created_at, last_accessed FROM email_accounts ORDER BY created_at DESC'
    );
    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Email Account
app.delete('/api/admin/email-accounts/:id', verifyAdminToken, async (req, res) => {
  try {
    await db.run('DELETE FROM access_permissions WHERE email_account_id = ?', [req.params.id]);
    await db.run('DELETE FROM email_accounts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Email account deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Email Account Status
app.patch('/api/admin/email-accounts/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    await db.run('UPDATE email_accounts SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Delegated User
app.post('/api/admin/users', verifyAdminToken, async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const encryptedPassword = Encryption.encrypt(password);

    const result = await db.run(
      'INSERT INTO delegated_users (username, password, name) VALUES (?, ?, ?)',
      [username, encryptedPassword, name]
    );

    res.json({ success: true, id: result.id, message: 'User created successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get All Delegated Users
app.get('/api/admin/users', verifyAdminToken, async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, username, password, name, status, created_at FROM delegated_users ORDER BY created_at DESC'
    );
    // Decrypt passwords for admin to view
    const usersWithPlainPassword = users.map(user => {
      let plainPassword = '[Encrypted - Reset required]';
      if (!user.password.startsWith('$2')) {
        try { plainPassword = Encryption.decrypt(user.password); } catch (e) { }
      }
      return { ...user, plainPassword };
    });
    res.json({ success: true, users: usersWithPlainPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Delegated User
app.put('/api/admin/users/:id', verifyAdminToken, async (req, res) => {
  try {
    const { username, password, name, status } = req.body;
    let updateQuery = 'UPDATE delegated_users SET username = ?, name = ?, status = ?';
    let params = [username, name, status];
    if (password) {
      updateQuery += ', password = ?';
      params.push(Encryption.encrypt(password));
    }
    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);

    await db.run(updateQuery, params);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Grant Access Permission
app.post('/api/admin/permissions', verifyAdminToken, async (req, res) => {
  try {
    const { userId, emailAccountId, canRead, canSend } = req.body;

    await db.run(
      'INSERT OR REPLACE INTO access_permissions (user_id, email_account_id, can_read, can_send) VALUES (?, ?, ?, ?)',
      [userId, emailAccountId, canRead ? 1 : 0, canSend ? 1 : 0]
    );

    res.json({ success: true, message: 'Permission granted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Permissions for User
app.get('/api/admin/permissions/user/:userId', verifyAdminToken, async (req, res) => {
  try {
    const permissions = await db.all(`
      SELECT ap.*, ea.email, ea.provider, ea.display_name
      FROM access_permissions ap
      JOIN email_accounts ea ON ap.email_account_id = ea.id
      WHERE ap.user_id = ?
    `, [req.params.userId]);

    res.json({ success: true, permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke Permission
app.delete('/api/admin/permissions/:id', verifyAdminToken, async (req, res) => {
  try {
    await db.run('DELETE FROM access_permissions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Permission revoked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Activity Logs
app.get('/api/admin/logs', verifyAdminToken, async (req, res) => {
  try {
    const logs = await db.all(`
      SELECT al.*, du.username, ea.email
      FROM activity_logs al
      LEFT JOIN delegated_users du ON al.user_id = du.id
      LEFT JOIN email_accounts ea ON al.email_account_id = ea.id
      ORDER BY al.timestamp DESC
      LIMIT 100
    `);

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// DELEGATED USER ROUTES
// ========================================

// User Login
app.post('/api/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.get('SELECT * FROM delegated_users WHERE username = ?', [username]);

    let isValid = false;
    if (user) {
      if (user.password.startsWith('$2')) {
        isValid = bcrypt.compareSync(password, user.password);
      } else {
        try { isValid = Encryption.decrypt(user.password) === password; } catch (e) { }
      }
    }

    if (!user || !isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const token = generateToken({ id: user.id, username: user.username, role: 'user' });

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User's Accessible Email Accounts
app.get('/api/user/email-accounts', verifyUserToken, async (req, res) => {
  try {
    const accounts = await db.all(`
      SELECT ea.id, ea.email, ea.provider, ea.display_name, ea.status,
             ap.can_read, ap.can_send
      FROM access_permissions ap
      JOIN email_accounts ea ON ap.email_account_id = ea.id
      WHERE ap.user_id = ? AND ea.status = 'active'
    `, [req.user.id]);

    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Emails from Account
app.get('/api/user/emails/:accountId', verifyUserToken, async (req, res) => {
  try {
    const folder = req.query.folder || 'INBOX';

    // Check permission
    const permission = await db.get(
      'SELECT * FROM access_permissions WHERE user_id = ? AND email_account_id = ? AND can_read = 1',
      [req.user.id, req.params.accountId]
    );

    if (!permission) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get account details
    const account = await db.get('SELECT * FROM email_accounts WHERE id = ? AND status = "active"', [req.params.accountId]);

    if (!account) {
      return res.status(404).json({ error: 'Account not found or inactive' });
    }

    // Decrypt password
    const password = Encryption.decrypt(account.encrypted_password);

    // Fetch emails
    let emails;
    if (account.provider === 'gmail') {
      emails = await gmailService.getEmails(account.email, password, 20, folder);
    } else if (account.provider === 'outlook') {
      emails = await outlookService.getEmails(account.email, password); // update outlook if needed later
    }

    // Log activity
    await db.run(
      'INSERT INTO activity_logs (user_id, email_account_id, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, req.params.accountId, 'VIEW_EMAILS', `Viewed emails from ${account.email}`]
    );

    // Update last accessed
    await db.run('UPDATE email_accounts SET last_accessed = CURRENT_TIMESTAMP WHERE id = ?', [req.params.accountId]);

    res.json({ success: true, emails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send Email
app.post('/api/user/send/:accountId', verifyUserToken, async (req, res) => {
  try {
    const { to, subject, body, inReplyTo, references } = req.body;

    // Check permission
    const permission = await db.get(
      'SELECT * FROM access_permissions WHERE user_id = ? AND email_account_id = ? AND can_send = 1',
      [req.user.id, req.params.accountId]
    );

    if (!permission) {
      return res.status(403).json({ error: 'Send permission denied' });
    }

    // Get account details
    const account = await db.get('SELECT * FROM email_accounts WHERE id = ? AND status = "active"', [req.params.accountId]);

    if (!account) {
      return res.status(404).json({ error: 'Account not found or inactive' });
    }

    // Decrypt password
    const password = Encryption.decrypt(account.encrypted_password);

    // Send email
    let result;
    if (account.provider === 'gmail') {
      result = await gmailService.sendEmail(account.email, password, to, subject, body, inReplyTo, references);
    } else if (account.provider === 'outlook') {
      result = await outlookService.sendEmail(account.email, password, to, subject, body);
    }

    // Log activity
    await db.run(
      'INSERT INTO activity_logs (user_id, email_account_id, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, req.params.accountId, 'SEND_EMAIL', `Sent email to ${to}`]
    );

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Email Admin System Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`\n⚠️  IMPORTANT: Copy .env.example to .env and configure your settings!\n`);
});
