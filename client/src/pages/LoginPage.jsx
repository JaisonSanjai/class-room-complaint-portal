import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { GraduationCap, UserCheck, Shield, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Student'); // 'Student' | 'Faculty' | 'HOD' | 'Admin'
  const [studentId, setStudentId] = useState('25USS101');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [adminId, setAdminId] = useState('admin');
  const [password, setPassword] = useState('101');
  
  const [facultyList, setFacultyList] = useState([]);
  const [hodList, setHodList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to relevant dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'Student') navigate('/student/dashboard');
      else if (user.role === 'Faculty' || user.role === 'HOD') navigate('/staff/dashboard');
      else if (user.role === 'Admin') navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // Fetch staff list for dropdowns
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);
        const res = await api.get('/auth/staff-list');
        if (res.data.success) {
          const faculty = res.data.data.filter((s) => s.role === 'Faculty');
          const hod = res.data.data.filter((s) => s.role === 'HOD');
          setFacultyList(faculty);
          setHodList(hod);

          if (activeTab === 'Faculty' && faculty.length > 0) {
            setSelectedStaffId(faculty[0].staff_id);
            setPassword('102'); // default password for Soffi Mam
          } else if (activeTab === 'HOD' && hod.length > 0) {
            setSelectedStaffId(hod[0].staff_id);
            setPassword('101'); // default password for Jeno Mam
          }
        }
      } catch (err) {
        console.error('Could not load staff members for dropdown:', err);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [activeTab]);

  const handleTabChange = (role) => {
    setActiveTab(role);
    setError('');

    if (role === 'Student') {
      setStudentId('25USS101');
      setPassword('101');
    } else if (role === 'Faculty') {
      if (facultyList.length > 0) {
        setSelectedStaffId(facultyList[0].staff_id);
      }
      setPassword('102');
    } else if (role === 'HOD') {
      if (hodList.length > 0) {
        setSelectedStaffId(hodList[0].staff_id);
      }
      setPassword('101');
    } else if (role === 'Admin') {
      setAdminId('admin');
      setPassword('admin123');
    }
  };

  const handleFacultySelectChange = (e) => {
    const id = e.target.value;
    setSelectedStaffId(id);
    // Auto-fill password hint according to staff seed mapping (101-106)
    if (id === '25abc102') setPassword('102');
    else if (id === '25abc103') setPassword('103');
    else if (id === '25abc104') setPassword('104');
    else if (id === '25abc105') setPassword('105');
    else if (id === '25abc106') setPassword('106');
  };

  const handleHodSelectChange = (e) => {
    const id = e.target.value;
    setSelectedStaffId(id);
    if (id === '25abc101') setPassword('101');
  };

  const handleStudentIdChange = (e) => {
    const val = e.target.value;
    setStudentId(val);
    const match = val.match(/25USS(\d+)/i);
    if (match) {
      setPassword(match[1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    let identifier = '';
    if (activeTab === 'Student') identifier = studentId;
    else if (activeTab === 'Faculty' || activeTab === 'HOD') identifier = selectedStaffId;
    else if (activeTab === 'Admin') identifier = adminId;

    if (!identifier) {
      setError(`Please select or enter your ${activeTab} identifier.`);
      setSubmitting(false);
      return;
    }

    try {
      const loggedInUser = await login(activeTab, identifier, password);
      if (loggedInUser.role === 'Student') {
        navigate('/student/dashboard');
      } else if (loggedInUser.role === 'Faculty' || loggedInUser.role === 'HOD') {
        navigate('/staff/dashboard');
      } else if (loggedInUser.role === 'Admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div style={{ display: 'inline-flex', padding: '10px', background: '#eef2ff', borderRadius: '12px', marginBottom: '0.75rem' }}>
            <GraduationCap size={32} color="#4f46e5" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>
            Department Complaint Portal
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Classroom grievance resolution and audit management system
          </p>
        </div>

        {/* 4 Unified Role Tabs */}
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${activeTab === 'Student' ? 'active' : ''}`}
            onClick={() => handleTabChange('Student')}
          >
            <GraduationCap size={16} />
            <span>Student</span>
          </button>

          <button
            type="button"
            className={`role-tab ${activeTab === 'Faculty' ? 'active' : ''}`}
            onClick={() => handleTabChange('Faculty')}
          >
            <UserCheck size={16} />
            <span>Faculty</span>
          </button>

          <button
            type="button"
            className={`role-tab ${activeTab === 'HOD' ? 'active' : ''}`}
            onClick={() => handleTabChange('HOD')}
          >
            <BookOpen size={16} />
            <span>HOD</span>
          </button>

          <button
            type="button"
            className={`role-tab ${activeTab === 'Admin' ? 'active' : ''}`}
            onClick={() => handleTabChange('Admin')}
          >
            <Shield size={16} />
            <span>Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="login-form-area">
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Student Login Fields */}
            {activeTab === 'Student' && (
              <div className="form-group">
                <label className="form-label">Student ID (25USS101 – 25USS157)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 25USS101"
                  value={studentId}
                  onChange={handleStudentIdChange}
                  required
                />
              </div>
            )}

            {/* Faculty Login Fields */}
            {activeTab === 'Faculty' && (
              <div className="form-group">
                <label className="form-label">Select Faculty Member</label>
                <select
                  className="form-select"
                  value={selectedStaffId}
                  onChange={handleFacultySelectChange}
                  required
                  disabled={loadingStaff}
                >
                  {facultyList.length === 0 ? (
                    <option value="">Loading faculty members...</option>
                  ) : (
                    facultyList.map((f) => (
                      <option key={f.staff_id} value={f.staff_id}>
                        {f.name} ({f.staff_id})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* HOD Login Fields */}
            {activeTab === 'HOD' && (
              <div className="form-group">
                <label className="form-label">Select Head of Department (HOD)</label>
                <select
                  className="form-select"
                  value={selectedStaffId}
                  onChange={handleHodSelectChange}
                  required
                  disabled={loadingStaff}
                >
                  {hodList.length === 0 ? (
                    <option value="">Loading HOD account...</option>
                  ) : (
                    hodList.map((h) => (
                      <option key={h.staff_id} value={h.staff_id}>
                        {h.name} ({h.staff_id})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Admin Login Fields */}
            {activeTab === 'Admin' && (
              <div className="form-group">
                <label className="form-label">Administrator ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="admin"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
              disabled={submitting}
            >
              {submitting ? 'Authenticating...' : `Sign in as ${activeTab}`}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Credential Helpers */}
          <div className="credential-helper-box">
            <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: '#475569' }}>
              💡 Quick Test Accounts:
            </div>
            {activeTab === 'Student' && (
              <div>
                <span className="credential-pill" onClick={() => { setStudentId('25USS101'); setPassword('101'); }}>
                  25USS101 / 101
                </span>
                <span className="credential-pill" onClick={() => { setStudentId('25USS102'); setPassword('102'); }}>
                  25USS102 / 102
                </span>
                <span className="credential-pill" onClick={() => { setStudentId('25USS103'); setPassword('103'); }}>
                  25USS103 / 103
                </span>
              </div>
            )}
            {activeTab === 'Faculty' && (
              <div>
                <span className="credential-pill" onClick={() => { setSelectedStaffId('25abc102'); setPassword('102'); }}>
                  Soffi Mam (102)
                </span>
                <span className="credential-pill" onClick={() => { setSelectedStaffId('25abc103'); setPassword('103'); }}>
                  Jaine Sir (103)
                </span>
                <span className="credential-pill" onClick={() => { setSelectedStaffId('25abc104'); setPassword('104'); }}>
                  Banumathi Mam (104)
                </span>
              </div>
            )}
            {activeTab === 'HOD' && (
              <div>
                <span className="credential-pill" onClick={() => { setSelectedStaffId('25abc101'); setPassword('101'); }}>
                  Jeno Mam (101)
                </span>
              </div>
            )}
            {activeTab === 'Admin' && (
              <div>
                <span className="credential-pill" onClick={() => { setAdminId('admin'); setPassword('admin123'); }}>
                  admin / admin123
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
