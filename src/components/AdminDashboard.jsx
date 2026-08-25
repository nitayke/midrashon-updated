import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Check, RefreshCw, Trash2, Edit3, Lock, LogOut, Inbox, Users, Database } from 'lucide-react';
import { 
  getYeshivotDB, 
  getYeshivaRequestsDB, 
  getStudentSubmissionsDB, 
  approveYeshivaRequestDB, 
  recalculateYeshivaAveragesDB, 
  saveYeshivaDB, 
  deleteYeshivaDB,
  deleteYeshivaRequestDB,
  deleteStudentSubmissionDB
} from '../firebase';
import { PARAM_DEFINITIONS, REGIONS, TYPES, REGION_TRANSLATIONS, TYPE_TRANSLATIONS } from '../knn';
import CustomSelect from './CustomSelect';

export default function AdminDashboard({ onExitAdmin }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('requests'); // requests, submissions, yeshivot
  const [submissionFilter, setSubmissionFilter] = useState('pending'); // 'pending' or 'all'
  const [requests, setRequests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [yeshivot, setYeshivot] = useState([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Editing state for yeshivot (midrashot)
  const [editingYeshiva, setEditingYeshiva] = useState(null);

  const hashPassword = async (text) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const inputHash = await hashPassword(password);
      const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      const targetHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH || "5f45c21f1598a41efcd1361add2bdba667629eb09f2ec9d819d915e0efc2310d";

      const isValid = (envPassword && password === envPassword) || (inputHash === targetHash);

      if (isValid) {
        setIsAuthenticated(true);
        setAuthError('');
        loadAdminData();
      } else {
        setAuthError('סיסמה שגויה, נסה שנית.');
      }
    } catch (err) {
      console.error("Login hash error:", err);
      setAuthError('שגיאה באימות הסיסמה');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [reqs, subs, yeshList] = await Promise.all([
        getYeshivaRequestsDB().catch(e => { console.error(e); return []; }),
        getStudentSubmissionsDB().catch(e => { console.error(e); return []; }),
        getYeshivotDB().catch(e => { console.error(e); return []; })
      ]);
      setRequests(reqs);
      setSubmissions(subs);
      setYeshivot(yeshList);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request) => {
    setLoading(true);
    try {
      await approveYeshivaRequestDB(request);
      setMsg(`מדרשה "${request.yeshiva_name}" אושרה ונוספה למאגר בהצלחה!`);
      loadAdminData();
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (request) => {
    if (!window.confirm(`האם את/ה בטוח/ה שברצונך למחוק את הבקשה עבור "${request.yeshiva_name}"?`)) return;
    setLoading(true);
    try {
      await deleteYeshivaRequestDB(request.id);
      setMsg(`הבקשה עבור "${request.yeshiva_name}" נמחקה.`);
      loadAdminData();
    } catch (err) {
      console.error("Reject request error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submission) => {
    if (!window.confirm(`האם למחוק את דיווח התלמידה עבור "${submission.yeshiva_name}"?`)) return;
    setLoading(true);
    try {
      await deleteStudentSubmissionDB(submission.id);
      setMsg(`דיווח התלמידה עבור "${submission.yeshiva_name}" נמחק.`);
      loadAdminData();
    } catch (err) {
      console.error("Delete submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateAverages = async () => {
    setLoading(true);
    try {
      const updated = await recalculateYeshivaAveragesDB();
      setYeshivot(updated);
      setMsg("ממוצעי המדרשות במאגר חושבו ועודכנו מחדש לפי כל הדיווחים!");
      loadAdminData();
    } catch (err) {
      console.error("Recalculate error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditingYeshiva = async (e) => {
    e.preventDefault();
    if (!editingYeshiva || !editingYeshiva.name) return;

    setLoading(true);
    try {
      await saveYeshivaDB(editingYeshiva);
      setMsg(`המדרשה "${editingYeshiva.name}" שנערכה נשמרה בהצלחה במאגר!`);
      setEditingYeshiva(null);
      loadAdminData();
    } catch (err) {
      console.error("Save yeshiva error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYeshiva = async (id, name) => {
    if (!window.confirm(`האם למחוק כליל את המדרשה "${name}" מהמאגר?`)) return;
    setLoading(true);
    try {
      await deleteYeshivaDB(id);
      setMsg(`המדרשה "${name}" הוסרה מהמאגר.`);
      loadAdminData();
    } catch (err) {
      console.error("Delete yeshiva error:", err);
    } finally {
      setLoading(false);
    }
  };

  const regionOptions = REGIONS.map(r => ({ value: r.id, label: r.label }));
  const typeOptions = TYPES.filter(t => t.id !== 'all').map(t => ({ value: t.id, label: t.label }));

  // Password Screen
  if (!isAuthenticated) {
    return (
      <div className="glass-card" style={{ maxWidth: 450, margin: '2rem auto', textAlign: 'center', animation: 'fadeIn 0.3s' }}>
        <div style={{ display: 'inline-flex', padding: '0.8rem', borderRadius: '50%', background: '#fff0f3', color: '#881337', marginBottom: '1rem' }}>
          <Lock style={{ width: 36, height: 36 }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#111827' }}>
          כניסה לממשק ניהול מדרשון
        </h2>
        <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          הזן סיסמת אדמין לניהול מאגר המדרשות
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            className="input-field"
            placeholder="סיסמת אדמין"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: 2 }}
            autoFocus
            required
          />

          {authError && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
              {authError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            <button type="button" onClick={onExitAdmin} className="btn-secondary">
              חזרה
            </button>
            <button type="submit" className="btn-primary">
              כניסה למערכת
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Admin Header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <ShieldCheck style={{ width: 32, height: 32, color: '#881337' }} />
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#111827' }}>ממשק ניהול מדרשון</h1>
            <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>מחובר לניהול מאגר המדרשות הראשי</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button onClick={loadAdminData} disabled={loading} className="btn-secondary">
            <RefreshCw style={{ width: 16, height: 16 }} />
            רענן נתונים
          </button>
          <button onClick={onExitAdmin} className="btn-secondary">
            <LogOut style={{ width: 16, height: 16 }} />
            יציאה מאדמין
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '0.8rem 1.2rem', borderRadius: 10, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn-secondary ${activeTab === 'requests' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <Inbox style={{ width: 18, height: 18 }} />
          בקשות להוספת מדרשות ({requests.length})
        </button>

        <button
          className={`btn-secondary ${activeTab === 'submissions' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <Users style={{ width: 18, height: 18 }} />
          דיווחי בנות מדרשה כיום ({submissions.length})
        </button>

        <button
          className={`btn-secondary ${activeTab === 'yeshivot' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('yeshivot')}
        >
          <Database style={{ width: 18, height: 18 }} />
          ניהול מאגר המדרשות ({yeshivot.length})
        </button>
      </div>

      {/* TAB 1: MIDRASHA ADDITION REQUESTS */}
      {activeTab === 'requests' && (
        <div className="glass-card">
          <h2 className="section-title" style={{ color: '#111827' }}>
            <Inbox className="w-5 h-5 text-rose-700" />
            בקשות שהוגשו ע"י משתמשות להוספת מדרשות חדשות
          </h2>

          {requests.length === 0 ? (
            <p style={{ color: '#4b5563' }}>אין כרגע בקשות ממתינות במערכת.</p>
          ) : (
            requests.map(req => (
              <div key={req.id} className="yeshiva-result-card" style={{ opacity: req.status === 'approved' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#111827' }}>{req.yeshiva_name}</h3>
                      {req.status === 'approved' && (
                        <span style={{ background: '#059669', color: 'white', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 700 }}>
                          ✓ אושר ונוסף
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: 4 }}>
                      מסלול: {TYPE_TRANSLATIONS[req.type] || req.type} | אזור: {REGION_TRANSLATIONS[req.region] || req.region}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 2 }}>
                      אימייל מגישה: {req.submitter_email || 'לא צוין'} | הערות: {req.notes || 'אין'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {req.status !== 'approved' && (
                      <button
                        onClick={() => handleApproveRequest(req)}
                        disabled={loading}
                        className="btn-gold"
                        style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
                      >
                        <Check style={{ width: 16, height: 16 }} />
                        אשר והוסף למאגר
                      </button>
                    )}

                    <button
                      onClick={() => handleRejectRequest(req)}
                      disabled={loading}
                      className="btn-secondary"
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
                    >
                      <Trash2 style={{ width: 15, height: 15 }} />
                      סרב ומחק בקשה
                    </button>
                  </div>
                </div>

                {req.ratings && (
                  <div style={{ marginTop: '0.8rem', background: '#fff0f3', padding: '0.8rem', borderRadius: 8, border: '1px solid #f3c2ce' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#881337', marginBottom: 4 }}>
                      פרמטרים שהציעה המשתמשת עבור המדרשה:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem', fontSize: '0.8rem' }}>
                      {PARAM_DEFINITIONS.map(p => (
                        <div key={p.id} style={{ color: '#374151' }}>
                          {p.label}: <strong>{req.ratings[p.id] || 3}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: STUDENT SUBMISSIONS & RECALCULATE */}
      {activeTab === 'submissions' && (() => {
        const pendingSubmissions = submissions.filter(s => s.processed !== true);
        const displayedSubmissions = submissionFilter === 'pending' ? pendingSubmissions : submissions;

        return (
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="section-title" style={{ margin: 0, color: '#111827' }}>
                  <Users className="w-5 h-5 text-rose-700" />
                  תשובות שנאספו מבנות מדרשה כיום
                </h2>
                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: 4 }}>
                  מציג דיווחי תלמידות מאומתות ({pendingSubmissions.length} תשובות ממתינות לעדכון ממוצעים)
                </p>
              </div>

              <button
                onClick={handleRecalculateAverages}
                disabled={loading || pendingSubmissions.length === 0}
                className="btn-gold"
              >
                <RefreshCw style={{ width: 18, height: 18 }} />
                {pendingSubmissions.length > 0 
                  ? `עדכן ממוצעים במאגר (${pendingSubmissions.length} תשובות חדשות)` 
                  : 'כל התשובות כבר עודכנו במאגר ✓'}
              </button>
            </div>

            {/* Filter Toggle Buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <button
                type="button"
                className={`btn-secondary ${submissionFilter === 'pending' ? 'btn-primary' : ''}`}
                onClick={() => setSubmissionFilter('pending')}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
              >
                ⏳ תשובות שעוד לא עודכנו במאגר ({pendingSubmissions.length})
              </button>
              <button
                type="button"
                className={`btn-secondary ${submissionFilter === 'all' ? 'btn-primary' : ''}`}
                onClick={() => setSubmissionFilter('all')}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
              >
                📜 כל הדיווחים ({submissions.length})
              </button>
            </div>

            {displayedSubmissions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#4b5563', background: '#fff0f3', borderRadius: 8 }}>
                {submissionFilter === 'pending' 
                  ? '✓ כל תשובות הבנות במערכת כבר חושבו ועודכנו בממוצעי המדרשות!' 
                  : 'טרם התקבלו דיווחי תלמידות כיום במערכת.'}
              </div>
            ) : (
              displayedSubmissions.map((sub, idx) => (
                <div key={sub.id || idx} className="yeshiva-result-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 4 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#111827' }}>{sub.yeshiva_name}</h3>
                        {sub.processed === true ? (
                          <span className="tag" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>עודכן במאגר ✓</span>
                        ) : (
                          <span className="tag" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>חדש - ממתין לעדכון ⏳</span>
                        )}
                      </div>
                      <div style={{ color: '#4b5563', fontSize: '0.85rem' }}>
                        תאריך דיווח: {new Date(sub.created_at || Date.now()).toLocaleDateString('he-IL')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '0.3rem 0.7rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700 }}>
                        תלמידה מאומתת ✓
                      </span>

                      <button
                        onClick={() => handleDeleteSubmission(sub)}
                        disabled={loading}
                        className="btn-secondary"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                        מחק דיווח
                      </button>
                    </div>
                  </div>

                  {sub.ratings && (
                    <div style={{ marginTop: '0.8rem', background: '#fff0f3', padding: '0.8rem', borderRadius: 8, border: '1px solid #f3c2ce' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem', fontSize: '0.82rem' }}>
                        {PARAM_DEFINITIONS.map(p => (
                          <div key={p.id} style={{ color: '#374151' }}>
                            {p.label}: <strong>{sub.ratings[p.id] || 3}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );
      })()}

      {/* TAB 3: MANAGE MIDRASHOT */}
      {activeTab === 'yeshivot' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title" style={{ margin: 0, color: '#111827' }}>
                <Database className="w-5 h-5 text-rose-700" />
                ניהול מאגר המדרשות ({yeshivot.length} מדרשות)
              </h2>
              <p style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: 4 }}>
                תוכל לערוך, להוסיף ולמחוק מדרשות מהמאגר בכל עת
              </p>
            </div>

            <button
              onClick={() => setEditingYeshiva({
                name: '',
                type: 'before_service',
                region: 'center',
                ratings: PARAM_DEFINITIONS.reduce((acc, p) => ({ ...acc, [p.id]: 3 }), {})
              })}
              className="btn-primary"
            >
              <Plus style={{ width: 18, height: 18 }} />
              הוסף מדרשה ידנית
            </button>
          </div>

          {yeshivot.length === 0 ? (
            <p style={{ color: '#4b5563' }}>אין מדרשות במאגר.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {yeshivot.map(y => (
                <div key={y.id} className="yeshiva-result-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#111827' }}>{y.name}</h3>
                      <div style={{ color: '#4b5563', fontSize: '0.85rem', marginTop: 2 }}>
                        {TYPE_TRANSLATIONS[y.type] || y.type} • {REGION_TRANSLATIONS[y.region] || y.region}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => setEditingYeshiva(y)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        <Edit3 style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        onClick={() => handleDeleteYeshiva(y.id, y.name)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#374151', borderTop: '1px solid #f3c2ce', paddingTop: '0.6rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                    <div>הלכה: <strong>{y.ratings?.halacha || 3}</strong></div>
                    <div>גמרא: <strong>{y.ratings?.gemara || 3}</strong></div>
                    <div>ליברליות: <strong>{y.ratings?.liberalism || 3}</strong></div>
                    <div>תנאים: <strong>{y.ratings?.conditions || 3}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT / CREATE MIDRASHA MODAL */}
      {editingYeshiva && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', border: '1px solid #f3c2ce' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem', color: '#111827' }}>
              {editingYeshiva.name ? `עריכת מדרשה: ${editingYeshiva.name}` : 'הוספת מדרשה חדשה למאגר'}
            </h2>

            <form onSubmit={handleSaveEditingYeshiva}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', color: '#111827' }}>שם המדרשה</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingYeshiva.name}
                  onChange={(e) => setEditingYeshiva({ ...editingYeshiva, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', color: '#111827' }}>מסלול לימודים</label>
                  <CustomSelect
                    options={typeOptions}
                    value={editingYeshiva.type}
                    onChange={(val) => setEditingYeshiva({ ...editingYeshiva, type: val })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', color: '#111827' }}>אזור גאוגרפי</label>
                  <CustomSelect
                    options={regionOptions}
                    value={editingYeshiva.region}
                    onChange={(val) => setEditingYeshiva({ ...editingYeshiva, region: val })}
                  />
                </div>
              </div>

              {/* 13 Parameters Ratings Editors */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem', color: '#881337' }}>
                דירוגי 13 הפרמטרים במאגר (1 עד 5):
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {PARAM_DEFINITIONS.map(p => (
                  <div key={p.id} className="slider-group" style={{ margin: 0, padding: '0.7rem' }}>
                    <div className="slider-header" style={{ marginBottom: '0.2rem' }}>
                      <span className="slider-title" style={{ fontSize: '0.85rem' }}>{p.label}</span>
                      <span className="slider-value-badge" style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem' }}>
                        {editingYeshiva.ratings[p.id] || 3}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.1"
                      value={editingYeshiva.ratings[p.id] || 3}
                      onChange={(e) => setEditingYeshiva({
                        ...editingYeshiva,
                        ratings: { ...editingYeshiva.ratings, [p.id]: Number(e.target.value) }
                      })}
                      className="custom-range"
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingYeshiva(null)} className="btn-secondary">
                  ביטול
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  שמור שינויים במאגר
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
