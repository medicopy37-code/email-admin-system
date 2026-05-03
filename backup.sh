.gmail-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #f6f8fc;
  font-family: 'Roboto', sans-serif;
  overflow: hidden;
}

/* Header */
.gmail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: #f6f8fc;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 238px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  color: #5f6368;
  font-weight: 500;
}

.logo-img {
  width: 28px;
  height: 20px;
}

.header-middle {
  flex: 1;
  max-width: 720px;
  display: flex;
  align-items: center;
  background-color: #eaf1fb;
  border-radius: 24px;
  padding: 0 16px;
  height: 48px;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.header-middle:focus-within {
  background-color: #fff;
  box-shadow: 0 1px 1px 0 rgba(65,69,73,0.3), 0 1px 3px 1px rgba(65,69,73,0.15);
}

.header-middle input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 12px;
  font-size: 16px;
  color: #202124;
  outline: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 8px;
  position: relative;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #673ab7;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
}

/* Account Dropdown */
.account-dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
  width: 280px;
  z-index: 100;
  padding: 12px 0;
}

.account-dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-dropdown-item:hover {
  background-color: #f1f3f4;
}

.account-dropdown-item.active {
  background-color: #e8f0fe;
  color: #1a73e8;
}

.logout-btn {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
  color: #d93025;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: #fce8e6;
}

/* Main Body */
.gmail-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.gmail-sidebar {
  width: 256px;
  padding-right: 16px;
  display: flex;
  flex-direction: column;
}

.compose-btn-container {
  padding: 8px 0 16px 16px;
}

.compose-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  height: 56px;
  background-color: #c2e7ff;
  border-radius: 16px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #001d35;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
  transition: box-shadow 0.2s, background-color 0.2s;
}

.compose-btn:hover {
  box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
  background-color: #b3dcf5;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0 12px 0 26px;
  height: 32px;
  border-radius: 0 16px 16px 0;
  color: #202124;
  cursor: pointer;
  font-size: 14px;
  margin-right: 16px;
  position: relative;
}

.menu-item:hover {
  background-color: #f1f3f4;
}

.menu-item.active {
  background-color: #d3e3fd;
  color: #0b57d0;
  font-weight: bold;
}

.menu-icon {
  margin-right: 18px;
  font-size: 20px;
  color: #5f6368;
}

.menu-item.active .menu-icon {
  color: #0b57d0;
}

.menu-badge {
  margin-left: auto;
  font-size: 12px;
  font-weight: bold;
}

/* Main Content Area */
.gmail-main {
  flex: 1;
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 16px;
}

/* Toolbar */
.main-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #f1f3f4;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #5f6368;
  font-size: 12px;
}

.icon-btn {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5f6368;
  font-size: 20px;
}

.icon-btn:hover {
  background-color: #f1f3f4;
}

/* Tabs */
.main-tabs {
  display: flex;
  border-bottom: 1px solid #f1f3f4;
}

.tab {
  flex: 1;
  max-width: 250px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  cursor: pointer;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  background-color: #f1f3f4;
}

.tab.active {
  color: #0b57d0;
  border-bottom-color: #0b57d0;
}

.tab-icon {
  font-size: 20px;
}

.tab.active .tab-icon {
  color: #0b57d0;
}

.tab-badge {
  margin-left: auto;
  background-color: #1a73e8;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
}

.tab.promotions .tab-badge {
  background-color: #188038;
}

/* Email List */
.email-list-container {
  flex: 1;
  overflow-y: auto;
}

.email-row {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 40px;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  background-color: #fff;
  border-left: 3px solid transparent;
}

.email-row:hover {
  box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
  z-index: 10;
}

.email-row.unread {
  background-color: #fff;
  font-weight: bold;
}

.email-row.read {
  background-color: #f2f6fc;
}

.email-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 72px;
  color: #5f6368;
}

.email-sender {
  width: 168px;
  font-size: 14px;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 16px;
}

.email-content {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-subject {
  color: #202124;
}

.email-snippet {
  color: #5f6368;
  margin-left: 8px;
  font-weight: normal;
}

.email-date {
  width: 80px;
  text-align: right;
  font-size: 12px;
  color: #5f6368;
}

/* Compose Modal */
.compose-window {
  position: fixed;
  bottom: 0;
  right: 80px;
  width: 500px;
  height: 500px;
  background: white;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.compose-header {
  background-color: #f2f6fc;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
}

.compose-header span {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}

.compose-actions {
  display: flex;
  gap: 8px;
  color: #5f6368;
}

.compose-form {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.compose-input {
  border: none;
  border-bottom: 1px solid #f1f3f4;
  padding: 12px 0;
  font-size: 14px;
  outline: none;
}

.compose-textarea {
  flex: 1;
  border: none;
  padding: 12px 0;
  font-size: 14px;
  outline: none;
  resize: none;
}

.compose-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f3f4;
}

.send-btn {
  background-color: #0b57d0;
  color: white;
  border: none;
  padding: 0 24px;
  height: 36px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.send-btn:hover {
  background-color: #0842a0;
}

.send-btn:disabled {
  background-color: #8ab4f8;
  cursor: not-allowed;
}

.discard-btn {
  background: none;
  border: none;
  color: #5f6368;
  cursor: pointer;
  font-size: 20px;
}

.discard-btn:hover {
  color: #202124;
}
