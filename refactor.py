import sys

with open(r'c:\Users\user\Desktop\projects\shvushon\midrashon1-updated\src\components\AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace handleLogin loadAdminData
content = content.replace('''
      if (isValid) {
        setIsAuthenticated(true);
        setAuthError('');
        loadAdminData();
      } else {''', '''
      if (isValid) {
        setIsAuthenticated(true);
        setAuthError('');
      } else {''')

# 2. Replace loadAdminData definition
old_load = '''
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [reqs, subs, yeshList, leadsList] = await Promise.all([
        getYeshivaRequestsDB().catch(e => { console.error(e); return []; }),
        getStudentSubmissionsDB().catch(e => { console.error(e); return []; }),
        getYeshivotDB().catch(e => { console.error(e); return []; }),
        getContactLeadsDB().catch(e => { console.error(e); return []; })
      ]);
      setRequests(reqs);
      setSubmissions(subs);
      setYeshivot(yeshList);
      setLeads(leadsList);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };'''
new_load = '''
  const loadActiveTabData = async (tabToLoad = activeTab, force = false) => {
    setLoading(true);
    try {
      if (tabToLoad === 'requests' && (force || requests.length === 0)) {
        setRequests(await getYeshivaRequestsDB().catch(() => []));
      } else if (tabToLoad === 'submissions' && (force || submissions.length === 0)) {
        setSubmissions(await getStudentSubmissionsDB().catch(() => []));
      } else if (tabToLoad === 'yeshivot' && (force || yeshivot.length === 0)) {
        setYeshivot(await getYeshivotDB().catch(() => []));
      } else if (tabToLoad === 'leads' && (force || leads.length === 0)) {
        setLeads(await getContactLeadsDB().catch(() => []));
      }
    } catch (err) {
      console.error("Error loading tab data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadActiveTabData(activeTab, false);
    }
  }, [activeTab, isAuthenticated]);'''
content = content.replace(old_load, new_load)

# 3. Replace all other loadAdminData(); with await loadActiveTabData(activeTab, true);
content = content.replace('loadAdminData();', 'await loadActiveTabData(activeTab, true);')

# 4. Refresh button
content = content.replace('onClick={loadAdminData}', 'onClick={() => loadActiveTabData(activeTab, true)}')

# 5. Remove lengths in tabs
content = content.replace('בקשות להוספת מדרשות ({requests.length})', 'בקשות להוספת מדרשות')
content = content.replace('דיווחי בנות מדרשה כיום ({submissions.length})', 'דיווחי בנות מדרשה כיום')
content = content.replace('ניהול מאגר המדרשות ({yeshivot.length})', 'ניהול מאגר המדרשות')
content = content.replace('לידים שיצרו קשר ({leads.length})', 'לידים שיצרו קשר')

# 6. Empty states
content = content.replace('''
          {requests.length === 0 ? (
            <p style={{ color: '#4b5563' }}>אין כרגע בקשות ממתינות במערכת.</p>
          ) : (''', '''
          {loading && requests.length === 0 ? (
            <p style={{ color: '#4b5563' }}>טוען נתונים...</p>
          ) : requests.length === 0 ? (
            <p style={{ color: '#4b5563' }}>אין כרגע בקשות ממתינות במערכת.</p>
          ) : (''')

content = content.replace('''
            {displayedSubmissions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#4b5563', background: '#fff0f3', borderRadius: 8 }}>
                {submissionFilter === 'pending' 
                  ? '✓ כל תשובות הבנות במערכת כבר חושבו ועודכנו בממוצעי המדרשות!' 
                  : 'טרם התקבלו דיווחי תלמידות כיום במערכת.'}
              </div>
            ) : (''', '''
            {loading && displayedSubmissions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#4b5563', background: '#fff0f3', borderRadius: 8 }}>
                טוען נתונים...
              </div>
            ) : displayedSubmissions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#4b5563', background: '#fff0f3', borderRadius: 8 }}>
                {submissionFilter === 'pending' 
                  ? '✓ כל תשובות הבנות במערכת כבר חושבו ועודכנו בממוצעי המדרשות!' 
                  : 'טרם התקבלו דיווחי תלמידות כיום במערכת.'}
              </div>
            ) : (''')

content = content.replace('''
          {yeshivot.length === 0 ? (
            <p style={{ color: '#4b5563' }}>אין מדרשות במאגר.</p>
          ) : (''', '''
          {loading && yeshivot.length === 0 ? (
            <p style={{ color: '#4b5563' }}>טוען נתונים...</p>
          ) : yeshivot.length === 0 ? (
            <p style={{ color: '#4b5563' }}>אין מדרשות במאגר.</p>
          ) : (''')

content = content.replace('''
          {leads.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              לא התקבלו לידים עד כה
            </div>
          ) : (''', '''
          {loading && leads.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              טוען נתונים...
            </div>
          ) : leads.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              לא התקבלו לידים עד כה
            </div>
          ) : (''')

with open(r'c:\Users\user\Desktop\projects\shvushon\midrashon1-updated\src\components\AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
