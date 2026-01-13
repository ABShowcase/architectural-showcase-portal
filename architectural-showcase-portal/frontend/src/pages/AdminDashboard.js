import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminDashboard({ token, onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [submissionsRes, statsRes, reportRes] = await Promise.all([
        axios.get(`${API_URL}/admin/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/reports/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => null)
      ]);
      setSubmissions(submissionsRes.data);
      setStats(statsRes.data);
      if (reportRes) setReportData(reportRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load submissions');
      setLoading(false);
    }
  };

  const handleExport = async (type = 'all') => {
    try {
      setExporting(true);
      const endpoint = type === 'cumulative' 
        ? `${API_URL}/admin/export-cumulative-report`
        : `${API_URL}/admin/export-excel`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = type === 'cumulative'
        ? `cumulative-report-${new Date().toISOString().split('T')[0]}.xlsx`
        : `submissions-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setExporting(false);
    } catch (err) {
      setError('Failed to export Excel file');
      setExporting(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return '#2ecc71';
    if (status === 'in_progress') return '#ffb81c';
    return '#999';
  };

  const getStatusLabel = (status) => {
    if (status === 'completed') return 'Completed';
    if (status === 'in_progress') return 'In Progress';
    return 'Draft';
  };

  if (loading) {
    return (
      <div className="admin-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '0' }}>
        {['overview', 'submissions', 'cumulative-reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab ? '#0066cc' : 'transparent',
              color: activeTab === tab ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #0066cc' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab ? '600' : '500',
              marginBottom: '-2px'
            }}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'submissions' && '📋 All Submissions'}
            {tab === 'cumulative-reports' && '📈 Cumulative Reports'}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW TAB ============ */}
      {activeTab === 'overview' && (
        <>
          {stats && (
            <div className="admin-stats">
              <div className="stat-card">
                <h3>Total Submissions</h3>
                <div className="number">{stats.total}</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
                <h3>Completed</h3>
                <div className="number" style={{ color: '#27ae60' }}>{stats.completed}</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#ffb81c' }}>
                <h3>In Progress</h3>
                <div className="number" style={{ color: '#ffb81c' }}>{stats.inProgress}</div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button 
              className="export-btn" 
              onClick={() => handleExport('all')}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : '📥 Export All Submissions'}
            </button>
            <button onClick={loadData} style={{ background: '#666' }}>
              🔄 Refresh
            </button>
          </div>

          <div style={{ 
            marginTop: '40px', 
            padding: '20px', 
            background: '#f0f8ff', 
            borderRadius: '4px',
            borderLeft: '4px solid #0066cc'
          }}>
            <h3 style={{ color: '#0066cc', marginBottom: '10px' }}>Quick Start</h3>
            <ul style={{ color: '#333', lineHeight: '1.8' }}>
              <li>View all submitted projects in the <strong>Submissions</strong> tab</li>
              <li>Analyze trends and statistics in the <strong>Cumulative Reports</strong> tab</li>
              <li>Export data to Excel for further analysis</li>
              <li>Contact architects via email to send image upload instructions</li>
            </ul>
          </div>
        </>
      )}

      {/* ============ SUBMISSIONS TAB ============ */}
      {activeTab === 'submissions' && (
        <>
          <div className="action-buttons">
            <button 
              className="export-btn" 
              onClick={() => handleExport('all')}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : '📥 Export to Excel'}
            </button>
            <button onClick={loadData} style={{ background: '#666' }}>
              🔄 Refresh
            </button>
          </div>

          <h2 style={{ marginTop: '20px', marginBottom: '20px' }}>All Submissions</h2>
          
          {submissions.length === 0 ? (
            <p style={{ color: '#666', padding: '20px', background: '#f9f9f9', borderRadius: '4px' }}>
              No submissions yet.
            </p>
          ) : (
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Project Name</th>
                  <th>Category</th>
                  <th>Firm</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <span 
                        className="status-indicator" 
                        style={{ background: getStatusColor(submission.status) }}
                      ></span>
                      {getStatusLabel(submission.status)}
                    </td>
                    <td>{submission.project_name || '—'}</td>
                    <td>{submission.project_category || '—'}</td>
                    <td>{submission.firm_name || '—'}</td>
                    <td>{submission.contact_name || '—'}</td>
                    <td>
                      <a href={`mailto:${submission.email}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
                        {submission.email}
                      </a>
                    </td>
                    <td>{submission.contact_phone || '—'}</td>
                    <td>{new Date(submission.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ============ CUMULATIVE REPORTS TAB ============ */}
      {activeTab === 'cumulative-reports' && (
        <>
          <div className="action-buttons">
            <button 
              className="export-btn" 
              onClick={() => handleExport('cumulative')}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : '📊 Export Cumulative Report'}
            </button>
            <button onClick={loadData} style={{ background: '#666' }}>
              🔄 Refresh Data
            </button>
          </div>

          {reportData && reportData.total > 0 ? (
            <>
              {/* Cost Analysis */}
              <div style={{ marginTop: '30px' }}>
                <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  💰 Cost Analysis
                </h2>
                <div className="admin-stats">
                  <div className="stat-card" style={{ borderLeftColor: '#e74c3c' }}>
                    <h3>Total Construction Cost</h3>
                    <div className="number" style={{ color: '#e74c3c', fontSize: '24px' }}>
                      ${(reportData.costAnalysis.totalSpent / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
                    <h3>Average Project Cost</h3>
                    <div className="number" style={{ color: '#3498db', fontSize: '24px' }}>
                      ${(reportData.costAnalysis.averageCost / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div className="stat-card" style={{ borderLeftColor: '#9b59b6' }}>
                    <h3>Projects with Cost Data</h3>
                    <div className="number" style={{ color: '#9b59b6' }}>
                      {reportData.costAnalysis.projectsWithCost}
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects by Category */}
              {reportData.byCategory.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    📂 Projects by Category
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    {reportData.byCategory.map((cat) => (
                      <div key={cat.name} style={{
                        background: '#f9f9f9',
                        padding: '15px',
                        borderRadius: '4px',
                        borderLeft: '4px solid #0066cc'
                      }}>
                        <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
                          {cat.name}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc', marginTop: '5px' }}>
                          {cat.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects by Type */}
              {reportData.byType.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    🏗️ Projects by Type
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    {reportData.byType.map((type) => (
                      <div key={type.name} style={{
                        background: '#f9f9f9',
                        padding: '15px',
                        borderRadius: '4px',
                        borderLeft: '4px solid #27ae60'
                      }}>
                        <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
                          {type.name}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60', marginTop: '5px' }}>
                          {type.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Suppliers */}
              {reportData.topSuppliers.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    🏭 Top Suppliers/Manufacturers
                  </h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Supplier</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', width: '120px' }}>Times Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topSuppliers.map((supplier, idx) => (
                        <tr key={supplier.name} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                          <td style={{ padding: '12px' }}>{supplier.name}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#0066cc' }}>
                            {supplier.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary */}
              <div style={{ 
                marginTop: '40px', 
                padding: '20px', 
                background: '#f0f8ff', 
                borderRadius: '4px',
                borderLeft: '4px solid #0066cc'
              }}>
                <h3 style={{ color: '#0066cc', marginBottom: '10px' }}>Report Summary</h3>
                <ul style={{ color: '#333', lineHeight: '1.8' }}>
                  <li><strong>{reportData.total} completed submissions</strong> in the system</li>
                  <li><strong>${(reportData.costAnalysis.totalSpent / 1000000).toFixed(1)}M</strong> total construction cost across all projects</li>
                  <li><strong>{reportData.byCategory.length} different project categories</strong> represented</li>
                  <li><strong>Top supplier used in {reportData.topSuppliers[0]?.count || 0} projects</strong> ({reportData.topSuppliers[0]?.name || 'N/A'})</li>
                </ul>
              </div>
            </>
          ) : (
            <div style={{ 
              marginTop: '30px', 
              padding: '30px', 
              background: '#f9f9f9', 
              borderRadius: '4px',
              textAlign: 'center',
              color: '#999'
            }}>
              <p>No completed submissions yet. Complete submissions will appear in the cumulative reports.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
