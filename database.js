const db = require('./database');
const Encryption = require('./encryption');

(async () => {
    try {
        const accounts = await db.all("SELECT * FROM email_accounts");
        for (let acc of accounts) {
            const plain = Encryption.decrypt(acc.encrypted_password);
            console.log(`Account ${acc.email} has password: ${plain}`);
        }
    } catch (e) {
        console.error(e);
    }
})();
