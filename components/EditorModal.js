'use client';

import { useState } from 'react';

export default function EditorModal({ data, authToken, onSave, onClose, theme }) {
  const [activeTab, setActiveTab] = useState('content');
  const [localData, setLocalData] = useState({ ...data, images: [...(data.images || [])] });
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const authHeaders = () => ({ Authorization: `Bearer ${authToken}` });

  const handleSiteNameChange = (value) => setLocalData({ ...localData, siteName: value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result.split(',')[1];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('base64', base64);

      try {
        const res = await fetch('/api/upload-image', { method: 'POST', headers: authHeaders(), body: formData });
        const result = await res.json();
        if (result.success) {
          const newImages = [
            ...localData.images,
            { id: Date.now(), filename: result.filename, location: '', title: 'Untitled', description: '' },
          ];
          setLocalData({ ...localData, images: newImages });
          setStatus({ type: 'success', message: 'Image uploaded. Add a title, then Save All Changes.' });
        } else {
          setStatus({ type: 'error', message: 'Upload failed: ' + result.error });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Upload error: ' + err.message });
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    setStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result.split(',')[1];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('base64', base64);

      try {
        const res = await fetch('/api/upload-logo', { method: 'POST', headers: authHeaders(), body: formData });
        const result = await res.json();
        if (result.success) {
          setLocalData({ ...localData, logoVersion: (localData.logoVersion || 0) + 1 });
          setStatus({ type: 'success', message: 'Logo updated. Remember to Save All Changes.' });
        } else {
          setStatus({ type: 'error', message: 'Logo upload failed: ' + result.error });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Logo upload error: ' + err.message });
      } finally {
        setLogoUploading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id) => {
    setLocalData({ ...localData, images: localData.images.filter((img) => img.id !== id) });
  };

  const updateImageField = (id, field, value) => {
    setLocalData({
      ...localData,
      images: localData.images.map((img) => (img.id === id ? { ...img, [field]: value } : img)),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    const result = await onSave(localData);
    setSaving(false);
    if (result.success) {
      setStatus({ type: 'success', message: 'Saved and deployed live!' });
    } else {
      setStatus({ type: 'error', message: 'Failed to save: ' + result.error });
    }
  };

  return (
    <div className="editor-overlay" onClick={onClose}>
      <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Editor</h2>
        <p style={{ color: 'var(--dimmed)', marginBottom: '16px' }}>Manage your content live.</p>

        <div className="editor-tabs">
          <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>Content</button>
          <button className={activeTab === 'images' ? 'active' : ''} onClick={() => setActiveTab('images')}>
            Images ({localData.images.length})
          </button>
          <button className={activeTab === 'logo' ? 'active' : ''} onClick={() => setActiveTab('logo')}>Logo</button>
        </div>

        {activeTab === 'content' && (
          <div className="editor-field">
            <label>Site Name (shown top-left, also the editor trigger)</label>
            <input type="text" value={localData.siteName || ''} onChange={(e) => handleSiteNameChange(e.target.value)} />
          </div>
        )}

        {activeTab === 'images' && (
          <>
            <div className="editor-field">
              <label>Upload New Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ color: '#fff', marginTop: '8px' }} />
              {uploading && <span style={{ marginLeft: '12px', color: 'var(--dimmed)' }}>Uploading...</span>}
              <p className="editor-note">Max 8MB. JPG, PNG, WEBP, or GIF. First image in the list appears as the homepage hero.</p>
            </div>

            <div className="editor-grid">
              {localData.images.map((img) => (
                <div key={img.id} className="editor-grid-item">
                  <img src={`/images/${img.filename}`} alt={img.title || img.filename} />
                  <button className="remove-btn" onClick={() => removeImage(img.id)}>×</button>

                  <span className="field-label">Location / Eyebrow</span>
                  <input
                    type="text"
                    placeholder="e.g. Switzerland Alps"
                    value={img.location || ''}
                    onChange={(e) => updateImageField(img.id, 'location', e.target.value)}
                  />

                  <span className="field-label">Title</span>
                  <input
                    type="text"
                    placeholder="e.g. SAINT ANTONIEN"
                    value={img.title || ''}
                    onChange={(e) => updateImageField(img.id, 'title', e.target.value)}
                  />

                  <span className="field-label">Description (optional)</span>
                  <input
                    type="text"
                    placeholder="Short line shown on the hero"
                    value={img.description || ''}
                    onChange={(e) => updateImageField(img.id, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'logo' && (
          <div className="editor-field">
            <label>Current Logo</label>
            <img className="editor-logo-preview" src={`/logo.png?v=${localData.logoVersion || 0}`} alt="Current logo" />
            <label>Upload New Logo</label>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} disabled={logoUploading} style={{ color: '#fff', marginTop: '8px' }} />
            {logoUploading && <span style={{ marginLeft: '12px', color: 'var(--dimmed)' }}>Uploading...</span>}
            <p className="editor-note">Max 3MB. Square images work best. Replaces the live logo everywhere on the site.</p>
          </div>
        )}

        {status && (
          <p style={{ marginTop: '16px', color: status.type === 'success' ? '#22a67e' : '#c04040', fontSize: '0.9rem' }}>
            {status.message}
          </p>
        )}

        <button className="editor-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  );
}
