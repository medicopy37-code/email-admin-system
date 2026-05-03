import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaUserPlus, FaEnvelope, FaUsers, FaKey, FaHistory, FaSignOutAlt } from 'react-icons/fa';
// ...existing code...
import {
  getEmailAccounts,
  addEmailAccount,
  deleteEmailAccount,
  updateEmailAccountStatus,
  getDelegatedUsers,
  createDelegatedUser,
  updateDelegatedUser,
  grantPermission,
  getActivityLogs,
  getUserPermissions,
  revokePermission
} from '../api';
import './Dashboard.css';

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('emails');
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showGrantAccess, setShowGrantAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserPermissions, setSelectedUserPermissions] = useState([]);

  const [newEmail, setNewEmail] = useState({
    email: '',
    password: '',
    provider: 'gmail',
    displayName: '',
  });

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
  });

  const [editUser, setEditUser] = useState({
    id: '',
    username: '',
    password: '',
    name: '',
    status: 'active'
  });

  const [permission, setPermission] = useState({
    userId: '',
    emailAccountId: '',
    canRead: true,
    canSend: true,
  });

  useEffect(() => {
    loadEmailAccounts();
    loadUsers();
    loadLogs();
  }, []);

  const loadEmailAccounts = async () => {
    try {
      const response = await getEmailAccounts();
      setEmailAccounts(response.data.accounts);
    } catch (error) {
      console.error('Error loading email accounts:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getDelegatedUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await getActivityLogs();
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await addEmailAccount(newEmail);
      setMessage('Email account added successfully!');
      setShowAddEmail(false);
      setNewEmail({ email: '', password: '', provider: 'gmail', displayName: '' });
      loadEmailAccounts();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add email account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmail = async (id) => {
    if (!window.confirm('Are you sure you want to delete this email account?')) return;

    try {
      await deleteEmailAccount(id);
      loadEmailAccounts();
      setMessage('Email account deleted successfully!');
    } catch (error) {
      setMessage('Failed to delete email account');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateEmailAccountStatus(id, newStatus);
      loadEmailAccounts();
      setMessage(`Account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      setMessage('Failed to update status');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await createDelegatedUser(newUser);
      setMessage('User created successfully!');
      setShowAddUser(false);
      setNewUser({ username: '', password: '', name: '' });
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserClick = (user) => {
    setEditUser({
      id: user.id,
      username: user.username,
      password: user.plainPassword && user.plainPassword !== '[Encrypted - Reset required]' ? user.plainPassword : '',
      name: user.name,
      status: user.status
    });
    setShowEditUser(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateDelegatedUser(editUser.id, editUser);
      setMessage('User updated successfully!');
      setShowEditUser(false);
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await grantPermission(permission);
      setMessage('Access granted successfully!');
      setShowGrantAccess(false);
      setPermission({ userId: '', emailAccountId: '', canRead: true, canSend: true });
      if (selectedUserId === permission.userId) {
        loadUserPermissions(permission.userId);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId) => {
    setSelectedUserId(userId);
    if (!userId) {
      setSelectedUserPermissions([]);
      return;
    }
    try {
      const response = await getUserPermissions(userId);
      setSelectedUserPermissions(response.data.permissions);
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
    }
  };

  const handleRevokePermission = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this access?')) return;
    try {
      await revokePermission(id);
      setMessage('Permission revoked successfully!');
      if (selectedUserId) {
        loadUserPermissions(selectedUserId);
      }
    } catch (error) {
      setMessage('Failed to revoke permission');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📧 Email Admin Control Panel</h1>
        <button onClick={onLogout} className="btn btn-secondary">
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'emails' ? 'active' : ''}`}
          onClick={() => setActiveTab('emails')}
        >
          <FaEnvelope /> Email Accounts
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> Delegated Users
        </button>
        <button
          className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <FaKey /> Access Control
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <FaHistory /> Activity Logs
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'emails' && (
          <div className="card">
            <div className="card-header">
              <h2>Managed Email Accounts</h2>
              <button onClick={() => setShowAddEmail(true)} className="btn btn-primary">
                <FaPlus /> Add Email Account
              </button>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Display Name</th>
                  <th>Status</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emailAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.email}</td>
                    <td>
                      <span className="badge badge-info">{account.provider.toUpperCase()}</span>
                    </td>
                    <td>{account.display_name || '-'}</td>
                    <td>
                      <span className={`badge ${account.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {account.status}
                      </span>
                    </td>
                    <td>{new Date(account.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(account.id, account.status)}
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: '8px' }}
                      >
                        {account.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteEmail(account.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header">
              <h2>Delegated Users</h2>
              <button onClick={() => setShowAddUser(true)} className="btn btn-primary">
                <FaUserPlus /> Create User
              </button>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: '#f1f3f4', padding: '2px 6px', borderRadius: '4px' }}>
                        {user.plainPassword}
                      </span>
                    </td>
                    <td>{user.name}</td>
                    <td>
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleEditUserClick(user)}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="card">
            <div className="card-header">
              <h2>Access Permissions</h2>
              <button onClick={() => setShowGrantAccess(true)} className="btn btn-primary">
                <FaKey /> Grant Access
              </button>
            </div>

            <div style={{ padding: '20px 20px 0 20px' }}>
              <select
                className="input"
                value={selectedUserId}
                onChange={(e) => loadUserPermissions(e.target.value)}
              >
                <option value="">-- Select a User --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.username})</option>
                ))}
              </select>
            </div>

            {selectedUserId && selectedUserPermissions.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Email Account</th>
                    <th>Permissions</th>
                    <th>Granted On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUserPermissions.map(perm => (
                    <tr key={perm.id}>
                      <td>{perm.email} <span className="badge badge-info">{perm.provider}</span></td>
                      <td>
                        {perm.can_read === 1 && <span className="badge badge-success" style={{ marginRight: '8px' }}>Read</span>}
                        {perm.can_send === 1 && <span className="badge badge-success">Send</span>}
                      </td>
                      <td>{new Date(perm.granted_at).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleRevokePermission(perm.id)} className="btn btn-sm btn-danger"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : selectedUserId ? (
              <p style={{ padding: '20px', color: 'var(--text-light)' }}>
                This user has no granted email permissions.
              </p>
            ) : (
              <p style={{ padding: '20px', color: 'var(--text-light)' }}>
                Select a user to view and manage their email access permissions.
              </p>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card">
            <h2>Activity Logs (Last 100)</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Email Account</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.username || 'Admin'}</td>
                    <td>{log.email || '-'}</td>
                    <td>
                      <span className="badge badge-info">{log.action}</span>
                    </td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Email Modal */}
      {showAddEmail && (
        <div className="modal-overlay" onClick={() => setShowAddEmail(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Email Account</h2>
            <form onSubmit={handleAddEmail}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={newEmail.email}
                  onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password / App Password</label>
                <input
                  type="password"
                  className="input"
                  value={newEmail.password}
                  onChange={(e) => setNewEmail({ ...newEmail, password: e.target.value })}
                  required
                />
                <small style={{ color: 'var(--text-light)' }}>
                  For Gmail, use App Password. For Outlook, use account password.
                </small>
              </div>

              <div className="form-group">
                <label>Provider</label>
                <select
                  className="input"
                  value={newEmail.provider}
                  onChange={(e) => setNewEmail({ ...newEmail, provider: e.target.value })}
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook/Hotmail</option>
                </select>
              </div>

              <div className="form-group">
                <label>Display Name (Optional)</label>
                <input
                  type="text"
                  className="input"
                  value={newEmail.displayName}
                  onChange={(e) => setNewEmail({ ...newEmail, displayName: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Account'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddEmail(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Delegated User</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="input"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="input"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="modal-overlay" onClick={() => setShowEditUser(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Delegated User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="input"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password (Leave blank to keep unchanged)</label>
                <input
                  type="text"
                  className="input"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  placeholder="New password"
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  className="input"
                  value={editUser.status}
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditUser(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Access Modal */}
      {showGrantAccess && (
        <div className="modal-overlay" onClick={() => setShowGrantAccess(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Grant Email Access</h2>
            <form onSubmit={handleGrantAccess}>
              <div className="form-group">
                <label>Select User</label>
                <select
                  className="input"
                  value={permission.userId}
                  onChange={(e) => setPermission({ ...permission, userId: e.target.value })}
                  required
                >
                  <option value="">-- Choose User --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Email Account</label>
                <select
                  className="input"
                  value={permission.emailAccountId}
                  onChange={(e) => setPermission({ ...permission, emailAccountId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Email --</option>
                  {emailAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.email} ({account.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={permission.canRead}
                    onChange={(e) => setPermission({ ...permission, canRead: e.target.checked })}
                  />
                  {' '}Can Read Emails
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={permission.canSend}
                    onChange={(e) => setPermission({ ...permission, canSend: e.target.checked })}
                  />
                  {' '}Can Send Emails
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Granting...' : 'Grant Access'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGrantAccess(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
