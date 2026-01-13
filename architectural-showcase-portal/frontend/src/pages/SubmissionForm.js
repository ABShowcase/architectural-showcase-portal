import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const manufacturerCategories = [
  'Building Systems - Pre-Engineered Structures',
  'Building Systems - Skylights',
  'Fitness Center - Assessment & Monitoring Equipment',
  'Fitness Center - Cardiovascular Equipment',
  'Fitness Center - Climbing Walls',
  'Fitness Center - Entertainment Systems',
  'Fitness Center - Flooring, Aerobics',
  'Fitness Center - Flooring, Fitness Center',
  'Fitness Center - Free-Weight Equipment',
  'Fitness Center - Strength Equipment',
  'Gymnasium/Field House/Arena - Arena Seating',
  'Gymnasium/Field House/Arena - Basketball Backboards/Supports',
  'Gymnasium/Field House/Arena - Bleachers/Grandstands',
  'Gymnasium/Field House/Arena - Divider Curtains',
  'Gymnasium/Field House/Arena - Floor Covers',
  'Gymnasium/Field House/Arena - Folding Chairs',
  'Gymnasium/Field House/Arena - Gymnastics Equipment',
  'Gymnasium/Field House/Arena - Lighting',
  'Gymnasium/Field House/Arena - Scoreboards/Timing Systems',
  'Gymnasium/Field House/Arena - Scorers Tables',
  'Gymnasium/Field House/Arena - Sound Systems',
  'Gymnasium/Field House/Arena - Tennis Court Nets/Posts',
  'Gymnasium/Field House/Arena - Track & Field Equipment',
  'Gymnasium/Field House/Arena - Volleyball Nets and Standards',
  'Gymnasium/Field House/Arena - Wall Padding',
  'Ice Rinks - Bleachers/Grandstands',
  'Ice Rinks - Dashers',
  'Ice Rinks - Refrigeration Units',
  'Indoor Soccer/Inline Rinks - Dashers',
  'Indoor Sports Surfaces - Basketball',
  'Indoor Sports Surfaces - Multipurpose',
  'Indoor Sports Surfaces - Racquetball/Squash Courts',
  'Indoor Sports Surfaces - Tennis',
  'Indoor Sports Surfaces - Track',
  'Indoor Sports Surfaces - Volleyball',
  'Laundry - Dryers',
  'Laundry - Washers',
  'Locker/Shower - Flooring',
  'Locker/Shower - Lockers',
  'Locker/Shower - Saunas/Whirlpools',
  'Locker/Shower - Shower/Toilet Partitions',
  'Locker/Shower - Swimsuit Extractors',
  'Outdoor Facilities/Stadiums - Baseball Backstops',
  'Outdoor Facilities/Stadiums - Basketball Backboards/Supports',
  'Outdoor Facilities/Stadiums - Bleachers/Grandstands',
  'Outdoor Facilities/Stadiums - Field Covers',
  'Outdoor Facilities/Stadiums - Football Goal Posts',
  'Outdoor Facilities/Stadiums - Lighting',
  'Outdoor Facilities/Stadiums - Scoreboards',
  'Outdoor Facilities/Stadiums - Soccer Goals',
  'Outdoor Facilities/Stadiums - Sports Surfaces',
  'Outdoor Facilities/Stadiums - Tennis Nets/Posts',
  'Outdoor Facilities/Stadiums - Track & Field Equipment',
  'Outdoor Facilities/Stadiums - Windscreens',
  'Pools - Access Ramps/Stairs',
  'Pools - Bleachers',
  'Pools - Bulkheads',
  'Pools - Chemical Control Systems',
  'Pools - Cleaners/Vacuums',
  'Pools - Covers',
  'Pools - Deck/Basin Surface',
  'Pools - Dehumidifiers',
  'Pools - Diving Boards',
  'Pools - Filtration Systems',
  'Pools - Gutters',
  'Pools - Heaters',
  'Pools - Ladders/Grab Bars',
  'Pools - Lane Markers',
  'Pools - Lighting',
  'Pools - Sanitization Systems',
  'Pools - Scoreboard/Timing Systems',
  'Pools - Starting Blocks',
  'Pools - Water Play Features',
  'Racquetball/Squash Courts - Court Panels/Glass Walls',
  'Training Facilities - Hydrotherapy Tanks',
  'Training Facilities - Taping/Treatment Tables'
];

const architectRoles = [
  'Architect of Record',
  'Associate Architect',
  'Design Architect',
  'Aquatic Consultant/Engineer',
  'Landscape Architect/Consultant',
  'Programming Consultant',
  'Other'
];

function SubmissionForm({ token, user, onLogout }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSubmission();
  }, []);

  const loadSubmission = async () => {
    try {
      const response = await axios.get(`${API_URL}/submissions/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmission(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load submission');
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...submission, [field]: value };
    setSubmission(updated);
    autoSave(updated);
  };

  const handleNestedChange = (section, index, field, value) => {
    const updated = { ...submission };
    if (!updated[section]) updated[section] = [];
    if (!updated[section][index]) updated[section][index] = {};
    updated[section][index][field] = value;
    setSubmission(updated);
    autoSave(updated);
  };

  const handleManufacturerChange = (category, supplier) => {
    const updated = { ...submission };
    if (!updated.manufacturers_suppliers) updated.manufacturers_suppliers = {};
    updated.manufacturers_suppliers[category] = supplier;
    setSubmission(updated);
    autoSave(updated);
  };

  let autoSaveTimeout;
  const autoSave = (data) => {
    setSaving(true);
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
      try {
        await axios.put(`${API_URL}/submissions/${submission.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSaving(false);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaving(false);
      }
    }, 1000);
  };

  const handleComplete = async () => {
    try {
      setSaving(true);
      await axios.post(`${API_URL}/submissions/${submission.id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Submission completed! An admin will contact you if needed. Instructions for uploading images will be sent via email.');
      setTimeout(() => navigate('/submission'), 3000);
    } catch (err) {
      setError('Failed to complete submission');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="submission-container">Loading...</div>;

  return (
    <div className="submission-container">
      <div className="submission-header">
        <h1>Architectural Showcase - Project Submission</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <p style={{ color: '#666', marginBottom: '30px' }}>
        <span className="status-indicator draft"></span>
        <strong>Auto-saving:</strong> {saving ? 'Saving...' : 'Saved'}
      </p>

      {/* Section 1: Submission Information */}
      <div className="form-section">
        <h2>1.0 Submission Information</h2>

        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#444' }}>Project Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={submission?.project_name || ''}
              onChange={(e) => handleFieldChange('project_name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Project Location</label>
            <input
              type="text"
              value={submission?.project_location || ''}
              onChange={(e) => handleFieldChange('project_location', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label>Project Address</label>
            <textarea
              value={submission?.project_address || ''}
              onChange={(e) => handleFieldChange('project_address', e.target.value)}
              placeholder="Address 1, Address 2, City, State/Region, Postal Code, Country"
            ></textarea>
          </div>
        </div>

        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#444' }}>Contact Info</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Contact Name *</label>
            <input
              type="text"
              value={submission?.contact_name || ''}
              onChange={(e) => handleFieldChange('contact_name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Title</label>
            <input
              type="text"
              value={submission?.contact_title || ''}
              onChange={(e) => handleFieldChange('contact_title', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contact Phone *</label>
            <input
              type="tel"
              value={submission?.contact_phone || ''}
              onChange={(e) => handleFieldChange('contact_phone', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Email *</label>
            <input
              type="email"
              value={submission?.contact_email || ''}
              onChange={(e) => handleFieldChange('contact_email', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label>Contact Project Role</label>
            <select
              value={submission?.contact_role || ''}
              onChange={(e) => handleFieldChange('contact_role', e.target.value)}
            >
              <option value="">Select a role...</option>
              {architectRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={submission?.authorization || false}
                onChange={(e) => handleFieldChange('authorization', e.target.checked)}
                style={{ width: 'auto', marginRight: '10px' }}
              />
              I grant Athletic Business permission to publish materials, diagrams, and photographs in magazine and online
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: Project Information */}
      <div className="form-section">
        <h2>2.0 Project Information</h2>

        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#444' }}>Project Data</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Project Type</label>
            <input
              type="text"
              value={submission?.project_type || ''}
              onChange={(e) => handleFieldChange('project_type', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Project Category</label>
            <input
              type="text"
              value={submission?.project_category || ''}
              onChange={(e) => handleFieldChange('project_category', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date of Occupancy</label>
            <input
              type="date"
              value={submission?.date_of_occupancy || ''}
              onChange={(e) => handleFieldChange('date_of_occupancy', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Total Construction Cost</label>
            <input
              type="text"
              value={submission?.total_construction_cost || ''}
              onChange={(e) => handleFieldChange('total_construction_cost', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Total Gross Square Feet</label>
            <input
              type="text"
              value={submission?.total_gross_sqft || ''}
              onChange={(e) => handleFieldChange('total_gross_sqft', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Seating Capacity (if applicable)</label>
            <input
              type="text"
              value={submission?.seating_capacity || ''}
              onChange={(e) => handleFieldChange('seating_capacity', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cost per Square Foot</label>
            <input
              type="text"
              value={submission?.cost_per_sqft || ''}
              onChange={(e) => handleFieldChange('cost_per_sqft', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Primary Project Funding</label>
            <input
              type="text"
              value={submission?.primary_funding || ''}
              onChange={(e) => handleFieldChange('primary_funding', e.target.value)}
            />
          </div>
        </div>

        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#444' }}>Facility Representative</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={submission?.facility_rep_name || ''}
              onChange={(e) => handleFieldChange('facility_rep_name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={submission?.facility_rep_title || ''}
              onChange={(e) => handleFieldChange('facility_rep_title', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={submission?.facility_rep_phone || ''}
              onChange={(e) => handleFieldChange('facility_rep_phone', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={submission?.facility_rep_email || ''}
              onChange={(e) => handleFieldChange('facility_rep_email', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={submission?.facility_rep_address || ''}
              onChange={(e) => handleFieldChange('facility_rep_address', e.target.value)}
              placeholder="Address 1, Address 2, City, State/Region, Postal Code, Country"
            ></textarea>
          </div>
        </div>

        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#444' }}>Manufacturers & Suppliers</h3>
        <p style={{ color: '#666', marginBottom: '15px', fontSize: '13px' }}>
          Enter the manufacturer or supplier for each category (minimum requirements must be filled).
        </p>
        <div className="form-row full">
          <table className="manufacturers-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Supplier or Manufacturer Name</th>
              </tr>
            </thead>
            <tbody>
              {manufacturerCategories.slice(0, 10).map((category) => (
                <tr key={category}>
                  <td><strong>{category}</strong></td>
                  <td>
                    <input
                      type="text"
                      value={(submission?.manufacturers_suppliers?.[category]) || ''}
                      onChange={(e) => handleManufacturerChange(category, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: '10px', color: '#999', fontSize: '12px' }}>
            Showing first 10 categories. Scroll down for more...
          </p>
        </div>
      </div>

      {/* Section 3: Project Details */}
      <div className="form-section">
        <h2>3.0 Project Details</h2>

        <div className="form-row full">
          <div className="form-group">
            <label>Project Summary (200-300 words) *</label>
            <textarea
              value={submission?.project_summary || ''}
              onChange={(e) => handleFieldChange('project_summary', e.target.value)}
              placeholder="Brief summary of your project that should appear in Athletic Business magazine"
              style={{ minHeight: '150px' }}
            ></textarea>
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label>Project Description (Detailed) *</label>
            <textarea
              value={submission?.project_description || ''}
              onChange={(e) => handleFieldChange('project_description', e.target.value)}
              placeholder="More detailed description of your project"
              style={{ minHeight: '200px' }}
            ></textarea>
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              value={submission?.special_instructions || ''}
              onChange={(e) => handleFieldChange('special_instructions', e.target.value)}
              placeholder="Any special instructions for editors (e.g., two architects of record, overseas entries, etc.)"
              style={{ minHeight: '100px' }}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Section 4: Architect Information */}
      <div className="form-section">
        <h2>4.0 Architect Information</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          List the primary architects and consultants involved in the project.
        </p>

        {['Architect of Record', 'Associate Architect', 'Design Architect'].map((role, idx) => (
          <div key={role} className="nested-entry">
            <h3>{role}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Firm Name</label>
                <input
                  type="text"
                  placeholder="Firm Name"
                  value={submission?.architects?.[idx]?.firm_name || ''}
                  onChange={(e) => handleNestedChange('architects', idx, 'firm_name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={submission?.architects?.[idx]?.email || ''}
                  onChange={(e) => handleNestedChange('architects', idx, 'email', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="Phone"
                  value={submission?.architects?.[idx]?.phone || ''}
                  onChange={(e) => handleNestedChange('architects', idx, 'phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  placeholder="Website"
                  value={submission?.architects?.[idx]?.website || ''}
                  onChange={(e) => handleNestedChange('architects', idx, 'website', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row full">
              <div className="form-group">
                <label>Address</label>
                <textarea
                  placeholder="Address 1, Address 2, City, State/Region, Postal Code, Country"
                  value={submission?.architects?.[idx]?.address || ''}
                  onChange={(e) => handleNestedChange('architects', idx, 'address', e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section 5: Image Submission */}
      <div className="form-section">
        <h2>5.0 Image Submission</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          <strong>Important:</strong> After you complete this submission, you'll receive an email with instructions and a file-sharing link to upload your project images.
        </p>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Please submit 10-20 images total, including floor plans and site plans, at 300 dpi resolution.
        </p>

        <div className="form-row full">
          <div className="form-group">
            <label>Photo Credits</label>
            <input
              type="text"
              value={submission?.photo_credits || ''}
              onChange={(e) => handleFieldChange('photo_credits', e.target.value)}
              placeholder="Credit the photographers"
            />
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label>Special Photo Instructions</label>
            <textarea
              value={submission?.photo_special_instructions || ''}
              onChange={(e) => handleFieldChange('photo_special_instructions', e.target.value)}
              placeholder="Anything else we should know about your photos?"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="form-section">
        <button
          onClick={handleComplete}
          disabled={saving}
          style={{ background: '#27ae60', fontSize: '16px', padding: '15px' }}
        >
          {saving ? 'Completing...' : 'Mark as Completed & Submit'}
        </button>
        <p className="status-text">
          Click the button above when you've completed all sections. You'll receive an email with next steps.
        </p>
      </div>
    </div>
  );
}

export default SubmissionForm;
