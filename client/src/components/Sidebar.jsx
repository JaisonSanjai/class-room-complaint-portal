import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Users, 
  ShieldCheck, 
  LogOut, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <GraduationCap size={26} color="#6366f1" />
          {!isCollapsed && <span>DeptPortal</span>}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="btn-icon"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ padding: '4px', borderRadius: '4px', color: '#64748b' }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {user.role === 'Student' && (
          <>
            <NavLink 
              to="/student/dashboard" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? 'My Complaints' : ''}
            >
              <LayoutDashboard size={20} />
              {!isCollapsed && <span>My Complaints</span>}
            </NavLink>
            <NavLink 
              to="/student/new-complaint" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? 'File Complaint' : ''}
            >
              <PlusCircle size={20} />
              {!isCollapsed && <span>File Complaint</span>}
            </NavLink>
          </>
        )}

        {(user.role === 'Faculty' || user.role === 'HOD') && (
          <>
            <NavLink 
              to="/staff/dashboard" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? 'Assigned Complaints' : ''}
            >
              <LayoutDashboard size={20} />
              {!isCollapsed && <span>Assigned Complaints</span>}
            </NavLink>
          </>
        )}

        {user.role === 'Admin' && (
          <>
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? 'Overview' : ''}
            >
              <LayoutDashboard size={20} />
              {!isCollapsed && <span>Overview</span>}
            </NavLink>
            <NavLink 
              to="/admin/complaints" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? 'All Complaints' : ''}
            >
              <ClipboardList size={20} />
              {!isCollapsed && <span>All Complaints</span>}
            </NavLink>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? 'User Accounts' : ''}
            >
              <Users size={20} />
              {!isCollapsed && <span>User Accounts</span>}
            </NavLink>
            <NavLink 
              to="/admin/audit-logs" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? 'Audit Trail' : ''}
            >
              <ShieldCheck size={20} />
              {!isCollapsed && <span>Audit Trail</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <div className="user-badge">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="name" title={user.name}>{user.name}</div>
              <div className="role">{user.role} &bull; {user.id}</div>
            </div>
            <button 
              onClick={logout} 
              className="btn-icon" 
              title="Sign Out" 
              style={{ color: '#ef4444', padding: '4px' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={logout} 
              className="btn-icon" 
              title="Sign Out" 
              style={{ color: '#ef4444', padding: '6px' }}
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
