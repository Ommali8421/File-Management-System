import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function Dashboard({ setAuth }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchFiles(); // Refresh list after upload
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file.');
    }
  };

  const handleDownload = async (id, originalName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/files/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFiles(); // Refresh list after delete
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file.');
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">CloudVault</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, <strong>{user.username}</strong></span>
          <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>
            Logout
          </button>
        </div>
      </nav>

      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <div className="upload-icon">☁️</div>
        <h3>Drag & Drop your files here</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1rem' }}>or click to browse</p>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple={false}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); onButtonClick(); }}>
          Select File
        </button>
      </div>

      <div className="dashboard-header">
        <h2>Your Files</h2>
        <span style={{ color: 'var(--text-muted)' }}>{files.length} file(s)</span>
      </div>

      {loading ? (
        <div className="text-center">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="glass-container text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No files uploaded yet. Start by uploading a file above.</p>
        </div>
      ) : (
        <div className="file-grid">
          {files.map(file => (
            <div key={file.id} className="file-card">
              <div className="file-info">
                <div className="file-name" title={file.originalname}>
                  {file.originalname.length > 30 ? file.originalname.substring(0, 27) + '...' : file.originalname}
                </div>
                <div className="file-meta">
                  <span>Size: {formatBytes(file.size)}</span>
                  <span>Type: {file.mimetype.split('/')[1] || file.mimetype}</span>
                  <span>Uploaded: {new Date(file.upload_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="file-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleDownload(file.id, file.originalname)}
                >
                  ↓ Download
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(file.id)}
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
