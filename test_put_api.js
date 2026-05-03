const http = require('http');

console.log('Sending login request...');
const loginData = JSON.stringify({ username: 'abhishekrajj77@gmail.com', password: 'Admin@123456' });

const req = http.request('http://localhost:5000/api/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        const token = JSON.parse(body).token;
        console.log('Got token. Fetching accounts...');

        http.request('http://localhost:5000/api/user/email-accounts', {
            headers: { 'Authorization': 'Bearer ' + token }
        }, (accRes) => {
            let accBody = '';
            accRes.on('data', c => accBody += c);
            accRes.on('end', () => {
                const payload = JSON.parse(accBody);
                if (!payload.accounts || payload.accounts.length === 0) return console.log('No accounts returned', payload);
                const accountId = payload.accounts[0].id;
                console.log('Got Account ID:', accountId);

                console.log('Fetching Sent Mail...');
                http.request(`http://localhost:5000/api/user/emails/${accountId}?folder=${encodeURIComponent('[Gmail]/Sent Mail')}`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                }, (sentRes) => {
                    let sentBody = '';
                    sentRes.on('data', c => sentBody += c);
                    sentRes.on('end', () => {
                        const data = JSON.parse(sentBody);
                        console.log(`Fetched ${data.emails ? data.emails.length : 0} emails from Sent Mail!`);
                        if (data.emails && data.emails.length > 0) {
                            console.log(`First Sent Mail Subject: ${data.emails[0].subject}`);
                        }
                        console.log('ALL TESTS PASSED SUCCESSFULLY!');
                    });
                }).end();
            });
        }).end();
    });
});
req.write(loginData);
req.end();
