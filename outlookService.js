const nodemailer = require('nodemailer');
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

class GmailService {
  constructor() {
    // IMAP doesn't need OAuth client initialization
  }

  async getEmails(email, password, maxResults = 20, folderName = 'INBOX') {
    if (password === 'TESTING_MOCK') {
      return [
        {
          id: 'mock1',
          subject: 'Welcome to your Email Dashboard!',
          from: 'system@emailadmin.local',
          date: new Date().toISOString(),
          snippet: 'This is a mocked email connection established for ' + email + '.',
        },
        {
          id: 'mock2',
          subject: 'Weekly Report - ' + new Date().toLocaleDateString(),
          from: 'reports@emailadmin.local',
          date: new Date(Date.now() - 86400000).toISOString(),
          snippet: 'Attached is the weekly summary for your assigned accounts.',
        }
      ];
    }

    const config = {
      imap: {
        user: email,
        password: password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000
      }
    };

    let connection;
    try {
      connection = await imaps.connect(config);
      await connection.openBox(folderName);

      const searchCriteria = ['ALL'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        struct: true,
        options: { "uid": true }
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      // Sort to get the most recent messages
      const recentMessages = messages.reverse().slice(0, maxResults);

      const emails = await Promise.all(
        recentMessages.map(async (message) => {
          const allPart = message.parts.find(p => p.which === '');
          const id = message.attributes.uid;

          let parsed;
          if (allPart && allPart.body) {
            parsed = await simpleParser(allPart.body);
          } else {
            parsed = { subject: 'No Subject', from: { value: [{ address: 'Unknown' }] }, date: '', text: '' };
          }

          let fromStr = 'Unknown';
          if (parsed.from && parsed.from.value && parsed.from.value.length > 0) {
            fromStr = parsed.from.value[0].name ? `${parsed.from.value[0].name} <${parsed.from.value[0].address}>` : parsed.from.value[0].address;
          }

          return {
            id: String(id),
            subject: parsed.subject || 'No Subject',
            from: fromStr,
            date: parsed.date ? new Date(parsed.date).toISOString() : '',
            snippet: parsed.text ? parsed.text.substring(0, 100) : '',
            html: parsed.html || parsed.textAsHtml || `<p>${(parsed.text || '').replace(/\n/g, '<br/>') || 'No content'}</p>`,
            messageId: parsed.messageId,
            references: Array.isArray(parsed.references) ? parsed.references.join(' ') : (parsed.references || ''),
            attachments: (parsed.attachments || []).map(att => ({
              filename: att.filename,
              contentType: att.contentType,
              size: att.size,
              base64: att.content ? att.content.toString('base64') : null
            })),
          };
        })
      );

      connection.end();
      return emails;
    } catch (error) {
      if (connection) connection.end();
      console.error('Gmail IMAP error:', error);
      throw new Error('Failed to fetch emails from Gmail. Did you use a 16-character App Password?');
    }
  }

  async sendEmail(email, password, to, subject, body, inReplyTo = null, references = null) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email,
          pass: password,
        },
      });

      const mailOptions = {
        from: email,
        to: to,
        subject: subject,
        html: body,
      };

      if (inReplyTo) mailOptions.inReplyTo = inReplyTo;
      if (references) mailOptions.references = references;

      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Gmail send error:', error);
      throw new Error('Failed to send email via Gmail');
    }
  }

  async testConnection(email, password) {
    if (password === 'TESTING_MOCK') {
      return { success: true, message: 'Mock Connection Successful' };
    }
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email,
          pass: password,
        },
      });

      await transporter.verify();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      console.error('Gmail connection test failed:', error);
      if (error.message.includes('535-5.7.8')) {
        return { success: false, message: 'Google blocked the login. You MUST use an App Password instead of your regular password. Go to https://myaccount.google.com/apppasswords to generate one.' };
      }
      return { success: false, message: error.message };
    }
  }
}

module.exports = new GmailService();
