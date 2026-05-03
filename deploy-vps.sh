import React, { useState, useEffect } from 'react';
import {
  MdMenu, MdSearch, MdTune, MdOutlineEdit,
  MdInbox, MdStarBorder, MdOutlineWatchLater,
  MdSend, MdInsertDriveFile, MdLabelOutline,
  MdExpandMore, MdRefresh, MdMoreVert,
  MdChevronLeft, MdChevronRight, MdCropSquare,
  MdSettings, MdApps, MdClose
} from 'react-icons/md';
import { getUserEmailAccounts, getEmails, sendEmail } from '../api';
import './GmailClone.css';

function UserDashboard({ onLogout, user }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [emails, setEmails] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
    inReplyTo: null,
    references: null
  });

  const getFolderParam = (menu) => {
    if (menu === 'sent') return '[Gmail]/Sent Mail';
    if (menu === 'starred') return '[Gmail]/Starred';
    if (menu === 'drafts') return '[Gmail]/Drafts';
    return 'INBOX';
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    let interval;
    if (selectedAccount) {
      // Poll every 10 seconds for real-time updates
      interval = setInterval(() => {
        loadEmailsInBackground(selectedAccount);
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedAccount]);

  useEffect(() => {
    if (selectedAccount) {
      loadEmails(selectedAccount, activeMenu);
    }
  }, [activeMenu]);

  const loadEmailsInBackground = async (accountId) => {
    try {
      const response = await getEmails(accountId, getFolderParam(activeMenu));
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Background fetch failed:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await getUserEmailAccounts();
      const loadedAccounts = response.data.accounts || [];
      setAccounts(loadedAccounts);
      if (loadedAccounts.length > 0) {
        loadEmails(loadedAccounts[0].id, activeMenu);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadEmails = async (accountId, menu = activeMenu) => {
    setLoading(true);
    setSelectedEmail(null);
    try {
      const response = await getEmails(accountId, getFolderParam(menu));
      setEmails(response.data.emails || []);
      setSelectedAccount(accountId);
      setShowAccountMenu(false);
    } catch (error) {
      console.error('Failed to load emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendEmail(selectedAccount, composeData);
      setShowCompose(false);
      setComposeData({ to: '', subject: '', body: '', inReplyTo: null, references: null });
      alert('Message sent successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const currentAccount = accounts.find((a) => a.id === selectedAccount);

  const formatSender = (fromLine) => {
    if (!fromLine) return 'Unknown';
    // Matches "Name <email>" and extracts Name
    const match = fromLine.match(/^([^<]+)/);
    return match ? match[1].replace(/"/g, '').trim() : fromLine;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    // Extract actual email address if it's in Name <email> format
    let targetEmail = selectedEmail.from;
    const match = targetEmail.match(/<([^>]+)>/);
    if (match) {
      targetEmail = match[1];
    }

    setComposeData({
      to: targetEmail,
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : 'Re: ' + selectedEmail.subject,
      body: `<br><br><div class="gmail_quote" dir="auto">On ${new Date(selectedEmail.date).toLocaleString()} ${selectedEmail.from} wrote:<br><blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">${selectedEmail.html}</blockquote></div>`,
      inReplyTo: selectedEmail.messageId || null,
      references: selectedEmail.references || null
    });
    setShowCompose(true);
  };

  const handleDownloadAttachment = (filename, contentType, base64) => {
    if (!base64) return;
    const link = document.createElement('a');
    link.href = `data:${contentType};base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="gmail-layout">
      {/* HEADER */}
      <header className="gmail-header">
        <div className="header-left">
          <button className="icon-btn"><MdMenu /></button>
          <div className="logo-container">
            <svg viewBox="0 0 40 40" className="logo-img">
              <path d="M4.166 33.333c-1.15 0-2.133-.408-2.95-1.225C.4 31.291 0 30.308 0 29.166V15c0-.666.133-1.325.4-1.975.267-.65.65-1.208 1.15-1.675L17.7 2.1c.6-.45 1.25-.675 1.95-.675h.7c.7 0 1.35.225 1.95.675l16.15 9.25c.5.467.883 1.025 1.15 1.675.267.65.4 1.309.4 1.975v14.166c0 1.142-.4 2.125-1.2 2.942-.8.817-1.783 1.225-2.95 1.225h-6.666v-15L20 28.333 10.833 20v13.333H4.166z" fill="#ea4335" />
              <path d="M29.166 18.333v15h6.666c.466 0 .866-.167 1.2-.5.333-.333.5-.733.5-1.2v-14.166l-8.366-6.167v7.033z" fill="#c5221f" />
              <path d="M0 15v14.166c0 .467.167.867.5 1.2.334.333.734.5 1.2.5h6.633v-15H0z" fill="#fbbc04" />
              <path d="M10.833 20 20 28.333l9.166-8.333V9.75L20 18.333l-9.167-8.583v10.25z" fill="#4285f4" />
              <path d="M20 18.333L29.166 9.75v-7.033c0-.184-.041-.35-.124-.5-.083-.15-.225-.267-.425-.35-.2-.083-.4-.108-.6-.075-.2.033-.391.133-.574.3L20 10.333 1.557 2.091C1.374 1.924 1.183 1.824.983 1.791c-.2-.033-.4 0-.6.075-.2.1-.341.225-.424.375C-.124 2.391-.166 2.558-.166 2.741V9.75l9.166 8.583z" fill="#34a853" />
            </svg>
            Gmail
          </div>
        </div>

        <div className="header-middle">
          <button className="icon-btn"><MdSearch /></button>
          <input type="text" placeholder="Search mail" />
          <button className="icon-btn"><MdTune /></button>
        </div>

        <div className="header-right">
          <button className="icon-btn" title="Settings"><MdSettings /></button>
          <button className="icon-btn" title="Google apps"><MdApps /></button>
          <div className="avatar" onClick={() => setShowAccountMenu(!showAccountMenu)}>
            {(user.name || user.username).charAt(0).toUpperCase()}
          </div>

          {showAccountMenu && (
            <div className="account-dropdown">
              <div style={{ padding: '0 16px 12px', borderBottom: '1px solid #e0e0e0', marginBottom: '8px' }}>
                <div style={{ fontWeight: '500' }}>{user.name}</div>
                <div style={{ color: '#5f6368', fontSize: '14px' }}>{currentAccount?.email}</div>
              </div>

              <div style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', color: '#5f6368' }}>
                Assigned Accounts
              </div>
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className={`account-dropdown-item ${selectedAccount === acc.id ? 'active' : ''}`}
                  onClick={() => loadEmails(acc.id)}
                >
                  <MdInbox size={20} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.email}</div>
                </div>
              ))}

              {accounts.length === 0 && (
                <div className="account-dropdown-item" style={{ color: '#5f6368' }}>No accounts</div>
              )}

              <button className="logout-btn" onClick={onLogout}>Sign out of all accounts</button>
            </div>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="gmail-body">

        {/* SIDEBAR */}
        <div className="gmail-sidebar">
          <div className="compose-btn-container">
            {currentAccount?.can_send && (
              <button className="compose-btn" onClick={() => setShowCompose(true)}>
                <MdOutlineEdit size={24} />
                Compose
              </button>
            )}
          </div>

          <div className="sidebar-menu">
            <div className={`menu-item ${activeMenu === 'inbox' ? 'active' : ''}`} onClick={() => setActiveMenu('inbox')}>
              <MdInbox className="menu-icon" /> Inbox
              {emails.length > 0 && <span className="menu-badge">{emails.length}</span>}
            </div>
            <div className={`menu-item ${activeMenu === 'starred' ? 'active' : ''}`} onClick={() => setActiveMenu('starred')}>
              <MdStarBorder className="menu-icon" /> Starred
            </div>
            <div className={`menu-item ${activeMenu === 'snoozed' ? 'active' : ''}`} onClick={() => setActiveMenu('snoozed')}>
              <MdOutlineWatchLater className="menu-icon" /> Snoozed
            </div>
            <div className={`menu-item ${activeMenu === 'sent' ? 'active' : ''}`} onClick={() => setActiveMenu('sent')}>
              <MdSend className="menu-icon" /> Sent
            </div>
            <div className={`menu-item ${activeMenu === 'drafts' ? 'active' : ''}`} onClick={() => setActiveMenu('drafts')}>
              <MdInsertDriveFile className="menu-icon" /> Drafts
            </div>
            <div className={`menu-item ${activeMenu === 'more' ? 'active' : ''}`} onClick={() => setActiveMenu('more')}>
              <MdExpandMore className="menu-icon" /> More
            </div>

            <div style={{ marginTop: '16px', paddingLeft: '26px', fontSize: '14px', fontWeight: '500', color: '#202124' }}>
              Labels
            </div>
            <div className="menu-item" style={{ marginTop: '8px' }}>
              <MdLabelOutline className="menu-icon" /> Important
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="gmail-main">

          <div className="main-toolbar">
            <div className="toolbar-left">
              <button className="icon-btn"><MdCropSquare size={20} /></button>
              <button className="icon-btn" onClick={() => selectedAccount && loadEmails(selectedAccount)}><MdRefresh size={20} /></button>
              <button className="icon-btn"><MdMoreVert size={20} /></button>
            </div>
            <div className="toolbar-right">
              <span>{emails.length > 0 ? `1-${Math.min(50, emails.length)} of ${emails.length}` : '0 of 0'}</span>
              <button className="icon-btn"><MdChevronLeft size={24} /></button>
              <button className="icon-btn"><MdChevronRight size={24} /></button>
            </div>
          </div>

          <div className="main-tabs">
            <div className="tab active">
              <MdInbox className="tab-icon" /> Primary
            </div>
          </div>

          <div className="email-list-container" style={{ padding: selectedEmail ? '20px' : '0' }}>
            {selectedEmail ? (
              <div className="email-reading-view">
                <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                  <button className="icon-btn" onClick={() => setSelectedEmail(null)} title="Back to Inbox">
                    <MdChevronLeft size={24} />
                  </button>
                  <button className="icon-btn" onClick={handleReply} title="Reply">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" /></svg>
                  </button>
                  <button className="icon-btn"><MdMoreVert size={24} /></button>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 'normal', marginBottom: '20px', paddingLeft: '40px' }}>
                  {selectedEmail.subject}
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar" style={{ margin: 0 }}>
                      {formatSender(selectedEmail.from).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: '#202124' }}>{formatSender(selectedEmail.from)}</div>
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>to me</div>
                    </div>
                  </div>
                  <div style={{ color: '#5f6368', fontSize: '13px' }}>
                    {new Date(selectedEmail.date).toLocaleString()}
                  </div>
                </div>

                <div style={{ paddingLeft: '50px' }}>
                  {/* WARNING: In a production app, HTML should be carefully sanitized with DOMPurify to prevent XSS */}
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                    style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.5', color: '#202124', overflowX: 'auto' }}
                  />
                </div>

                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div style={{ paddingLeft: '50px', marginTop: '30px' }}>
                    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                      <strong style={{ color: '#202124', fontSize: '14px' }}>{selectedEmail.attachments.length} Attachments</strong>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {selectedEmail.attachments.map((att, idx) => (
                          <div key={idx}
                            onClick={() => handleDownloadAttachment(att.filename, att.contentType, att.base64)}
                            style={{ padding: '12px 16px', border: '1px solid #dadce0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa' }}>
                            <MdInsertDriveFile size={20} color="#5f6368" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: 500, color: '#3c4043', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.filename}</span>
                              <span style={{ fontSize: '12px', color: '#5f6368' }}>{Math.round(att.size / 1024)} KB</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ paddingLeft: '50px', marginTop: '40px' }}>
                  <button onClick={handleReply} style={{ padding: '8px 24px', borderRadius: '24px', border: '1px solid #747775', background: 'transparent', cursor: 'pointer', fontWeight: 500, color: '#444746' }}>
                    Reply
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#5f6368' }}>Loading emails...</div>
            ) : emails.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#5f6368' }}>
                Nothing to see here.
              </div>
            ) : (
              emails.map((email) => (
                <div key={email.id} className="email-row read" onClick={() => setSelectedEmail(email)} style={{ cursor: 'pointer' }}>
                  <div className="email-actions" onClick={e => e.stopPropagation()}>
                    <MdCropSquare size={20} />
                    <MdStarBorder size={20} />
                  </div>
                  <div className="email-sender">
                    {formatSender(email.from)}
                  </div>
                  <div className="email-content">
                    <span className="email-subject">{email.subject}</span>
                    <span className="email-snippet"> - {email.snippet?.replace(/&#39;/g, "'").replace(/&quot;/g, '"')}</span>
                  </div>
                  <div className="email-date">
                    {formatDate(email.date)}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* COMPOSE WINDOW */}
      {showCompose && (
        <div className="compose-window">
          <div className="compose-header" onClick={() => { }}>
            <span>New Message</span>
            <div className="compose-actions">
              <button className="icon-btn" style={{ width: '24px', height: '24px', color: '#fff' }} onClick={(e) => { e.stopPropagation(); setShowCompose(false) }}>
                <MdClose size={18} />
              </button>
            </div>
          </div>
          <form className="compose-form" onSubmit={handleSendEmail}>
            <input
              type="email"
              className="compose-input"
              placeholder="To"
              value={composeData.to}
              onChange={e => setComposeData({ ...composeData, to: e.target.value })}
              required
            />
            <input
              type="text"
              className="compose-input"
              placeholder="Subject"
              value={composeData.subject}
              onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
              required
            />
            <textarea
              className="compose-textarea"
              value={composeData.body}
              onChange={e => setComposeData({ ...composeData, body: e.target.value })}
              required
            />
            <div className="compose-footer">
              <button type="submit" className="send-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </button>
              <button type="button" className="discard-btn" onClick={() => setShowCompose(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default UserDashboard;
