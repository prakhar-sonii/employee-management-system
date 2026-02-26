import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar pageTitle={pageTitle} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">
          {children}
        </main>
        <footer className="app-footer">
          <div className="app-footer-inner">
            <span className="app-footer-brand">📊 LeaveSync</span>
            <span className="app-footer-desc">
              A streamlined leave &amp; reimbursement management platform — apply, track, and approve requests effortlessly across your organisation.
            </span>
            <span className="app-footer-copy">© {new Date().getFullYear()} LeaveSync. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
