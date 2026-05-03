const db = require('./database');
const bcrypt = require('bcryptjs');

async function flexUser() {
    const username = 'abhishekrajj77@gmail.com';
    const newPassword = 'Abhi@123';
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    try {
        const user = await db.get('SELECT * FROM delegated_users WHERE username = ?', [username]);
        if (user) {
            await db.run('UPDATE delegated_users SET password = ?, status = "active" WHERE id = ?', [hashedPassword, user.id]);
            console.log('Password updated successfully to Abhi@123!');
        } else {
            await db.run(
                'INSERT INTO delegated_users (username, password, name, status) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, 'Abhishek Raj', 'active']
            );
            console.log('User created successfully to Abhi@123!');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

flexUser();
