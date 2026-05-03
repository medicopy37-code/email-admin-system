const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const Encryption = require('./encryption');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database.sqlite';
const db = new sqlite3.Database(path.resolve(__dirname, dbPath));

const setupUser = () => {
    const username = 'abhishekrajj77@gmail.com';
    const password = 'password123'; // Default password for testing
    const targetEmail = 'abhishekrajj77@gmail.com';
    const mockEmailPassword = 'TESTING_MOCK';

    db.serialize(() => {
        console.log('Seeding the database with user and mock email account...');

        // 1. Insert Delegated User
        const hashedPassword = bcrypt.hashSync(password, 10);
        let userId;

        db.run(
            `INSERT OR IGNORE INTO delegated_users (username, password, name) VALUES (?, ?, ?)`,
            [username, hashedPassword, 'Abhishek Raj'],
            function (err) {
                if (err) {
                    console.error('Error inserting user:', err);
                    return;
                }

                // Fetch the user ID (whether newly inserted or existing)
                db.get(`SELECT id FROM delegated_users WHERE username = ?`, [username], (err, row) => {
                    if (err || !row) {
                        console.error('Error finding user id:', err);
                        return;
                    }
                    userId = row.id;

                    // 2. Insert Email Account
                    const encryptedPassword = Encryption.encrypt(mockEmailPassword);
                    db.run(
                        `INSERT OR IGNORE INTO email_accounts (email, provider, encrypted_password, display_name, created_by) VALUES (?, ?, ?, ?, ?)`,
                        [targetEmail, 'gmail', encryptedPassword, 'Abhishek Gmail (Mock)', 1],
                        function (err) {
                            if (err) {
                                console.error('Error inserting email account:', err);
                                return;
                            }

                            db.get(`SELECT id FROM email_accounts WHERE email = ?`, [targetEmail], (err, rowAcc) => {
                                if (err || !rowAcc) {
                                    console.error('Error finding email account id:', err);
                                    return;
                                }
                                const emailAccountId = rowAcc.id;

                                // 3. Link them in access_permissions
                                db.run(
                                    `INSERT OR IGNORE INTO access_permissions (user_id, email_account_id, can_read, can_send) VALUES (?, ?, 1, 1)`,
                                    [userId, emailAccountId],
                                    function (err) {
                                        if (err) {
                                            console.error('Error linking user and email:', err);
                                        } else {
                                            console.log('Successfully seeded database for ' + targetEmail);
                                            console.log('Test Username: ' + username);
                                            console.log('Test Password: ' + password);
                                        }
                                    }
                                );
                            });
                        }
                    );
                });
            }
        );
    });
};

setupUser();
