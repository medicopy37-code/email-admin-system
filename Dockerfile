const db = require('./database');
const fs = require('fs');
(async () => {
    try {
        const users = await db.all("SELECT * FROM delegated_users");
        const accounts = await db.all("SELECT * FROM email_accounts");
        const perms = await db.all("SELECT * FROM access_permissions");
        const output = "USERS:\n" + JSON.stringify(users, null, 2) + "\n\nACCOUNTS:\n" + JSON.stringify(accounts, null, 2) + "\n\nPERMS:\n" + JSON.stringify(perms, null, 2);
        fs.writeFileSync('db_output.txt', output);
    } catch (e) {
        fs.writeFileSync('db_output.txt', 'Error: ' + e.message);
    }
})();
