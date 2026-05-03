const db = require('./database');
const Encryption = require('./encryption');
const gmailService = require('./gmailService');

(async () => {
    try {
        const account = await db.get("SELECT * FROM email_accounts WHERE id = 6");
        if (!account) return console.log("Account not found");

        const password = Encryption.decrypt(account.encrypted_password);
        console.log("Testing IMAP Connection for:", account.email);

        // Testing Connection
        const testResult = await gmailService.testConnection(account.email, password);
        console.log("Connection Result:", testResult);
        if (!testResult.success) {
            console.log("FAILED. Wrong App Password.");
            return;
        }

        // Testing email fetch
        console.log("Fetching emails...");
        const emails = await gmailService.getEmails(account.email, password, 2);
        console.log("Fetched emails:", emails.map(e => e.subject).join(', '));
    } catch (error) {
        console.log("Error:", error.message);
    }
})();
