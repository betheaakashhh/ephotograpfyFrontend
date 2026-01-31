import React, { useState, useEffect, useRef, useCallback } from 'react';
import './main.css';

// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000',
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
};

// Photo presets
const PHOTO_PRESETS = {
    passport: { name: 'Passport', size: '35×45mm', icon: 'fa-passport' },
    visa: { name: 'Visa', size: '51×51mm', icon: 'fa-globe-americas' },
    id: { name: 'ID Card', size: '30×40mm', icon: 'fa-id-card' },
    us_visa: { name: 'US Visa', size: '50×50mm', icon: 'fa-flag-usa' }
};

// Status types
const STATUS_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

function Main() {
    // State Management
    const [currentFile, setCurrentFile] = useState(null);
    const [currentJob, setCurrentJob] = useState(null);
    const [currentPreset, setCurrentPreset] = useState('passport');
    const [isProcessing, setIsProcessing] = useState(false);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [copies, setCopies] = useState(4);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState('');
    const [viewMode, setViewMode] = useState('upload'); // 'upload', 'original', 'processed'
    const [recentJobs, setRecentJobs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [servicesStatus, setServicesStatus] = useState('checking');

    const fileInputRef = useRef(null);

    // Notification system - useCallback to memoize function
    const showNotification = useCallback((message, type = STATUS_TYPES.INFO) => {
        const id = Date.now();
        const notification = { id, message, type, timestamp: new Date() };
        
        setNotifications(prev => [notification, ...prev.slice(0, 3)]);
        
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    // Check Services - useCallback to memoize function
    const checkServices = useCallback(async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/python-health`);
            const data = await response.json();
            
            if (data.python_service !== 'UNREACHABLE') {
                setServicesStatus('available');
                showNotification('AI services are running', STATUS_TYPES.SUCCESS);
            } else {
                setServicesStatus('unavailable');
                showNotification('AI service is unavailable', STATUS_TYPES.WARNING);
            }
        } catch (error) {
            setServicesStatus('unavailable');
            showNotification('Unable to connect to services', STATUS_TYPES.ERROR);
        }
    }, [showNotification]);

    // Load Recent Jobs - useCallback to memoize function
    const loadRecentJobs = useCallback(async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/jobs`);
            
            if (!response.ok) {
                setRecentJobs([]);
                return;
            }
            
            const jobs = await response.json();
            
            if (Array.isArray(jobs) && jobs.length > 0) {
                setRecentJobs(jobs.slice(0, 5));
            } else {
                setRecentJobs([]);
            }
        } catch (error) {
            console.error('Failed to load jobs:', error);
            setRecentJobs([]);
        }
    }, []);

    // Initialize on mount
    useEffect(() => {
        checkServices();
        loadRecentJobs();
    }, [checkServices, loadRecentJobs]);

    // File Handling
    const validateAndLoadFile = useCallback((file) => {
        if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
            showNotification('Please upload a valid image file (JPG, PNG, WEBP)', STATUS_TYPES.ERROR);
            return false;
        }
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showNotification('File size should be less than 5MB', STATUS_TYPES.ERROR);
            return false;
        }
        
        setCurrentFile(file);
        setCurrentJob(null);
        
        // Show upload progress
        let progress = 0;
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            
            if (progress >= 100) {
                clearInterval(interval);
                // Load and display preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    setPreviewUrl(imageUrl);
                    setViewMode('original');
                    showNotification('Photo loaded successfully!', STATUS_TYPES.SUCCESS);
                };
                reader.readAsDataURL(file);
            }
        }, 30);

        return true;
    }, [showNotification]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) validateAndLoadFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        
        const file = event.dataTransfer.files[0];
        if (file) validateAndLoadFile(file);
    };

    // Process Photo
    const processPhoto = async () => {
        if (!currentFile || isProcessing) return;
        
        setIsProcessing(true);
        showNotification('AI is processing your photo...', STATUS_TYPES.INFO);
        
        const formData = new FormData();
        formData.append('image', currentFile);
        formData.append('bg_color', bgColor);
        formData.append('preset', currentPreset);
        formData.append('copies', copies);
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/image/upload`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Processing failed');
            }
            
            if (result.success) {
                setCurrentJob(result);
                setViewMode('processed');
                showNotification('✅ Photo processed successfully!', STATUS_TYPES.SUCCESS);
                loadRecentJobs();
            }
            
        } catch (error) {
            console.error('Processing error:', error);
            showNotification(`❌ ${error.message}`, STATUS_TYPES.ERROR);
        } finally {
            setIsProcessing(false);
        }
    };

    // Color Change
    const handleColorChange = (e) => {
        const color = e.target.value;
        setBgColor(color);
    };

    const handleColorTextChange = (e) => {
        const color = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            setBgColor(color);
        }
    };

    // Copies Counter
    const decreaseCopies = () => {
        if (copies > 1) setCopies(copies - 1);
    };

    const increaseCopies = () => {
        if (copies < 12) setCopies(copies + 1);
    };

    // Preset Selection
    const selectPreset = (preset) => {
        setCurrentPreset(preset);
        showNotification(`Selected: ${preset.toUpperCase()} photo`, STATUS_TYPES.INFO);
    };

    // Download Handler
    const handleDownload = () => {
        if (currentJob && currentJob.job_id) {
            const downloadUrl = `${CONFIG.API_BASE_URL}/api/proxy-download/${currentJob.job_id}`;
            window.open(downloadUrl, '_blank');
        } else {
            showNotification('No file available for download', STATUS_TYPES.ERROR);
        }
    };

    // Job Actions
    const previewJob = (jobId) => {
        const previewUrl = `${CONFIG.API_BASE_URL}/api/proxy-download/${jobId}`;
        
        // Find the job details from recent jobs
        const jobDetails = recentJobs.find(job => job.job_id === jobId);
        
        setCurrentJob({ 
            job_id: jobId,
            preview_url: previewUrl,
            download_url: `${CONFIG.API_BASE_URL}/api/proxy-download/${jobId}`,
            preset: jobDetails?.preset || currentPreset,
            copies: jobDetails?.copies || copies,
            bg_color: jobDetails?.bg_color || bgColor
        });
        
        setViewMode('processed');
        showNotification('Loaded previous job preview', STATUS_TYPES.INFO);
    };

    const downloadJob = (jobId) => {
        const downloadUrl = `${CONFIG.API_BASE_URL}/api/proxy-download/${jobId}`;
        window.open(downloadUrl, '_blank');
    };
   
    // Reset Application
    const resetApp = () => {
        setCurrentFile(null);
        setCurrentJob(null);
        setPreviewUrl('');
        setViewMode('upload');
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        showNotification('Ready for new photo upload', STATUS_TYPES.INFO);
    };

    // Toggle between original and processed view
    const toggleView = () => {
        if (currentJob) {
            if (viewMode === 'original' && previewUrl) {
                setViewMode('processed');
            } else if (viewMode === 'processed') {
                // Only switch to original if we have a previewUrl
                if (previewUrl) {
                    setViewMode('original');
                } else {
                    // If no uploaded image, go back to upload view
                    setViewMode('upload');
                }
            }
        }
    };

    const getStatusIcon = (type) => {
        switch(type) {
            case STATUS_TYPES.SUCCESS: return 'fa-check-circle';
            case STATUS_TYPES.ERROR: return 'fa-exclamation-circle';
            case STATUS_TYPES.WARNING: return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    };

    // Get current job preset name for display
    const getCurrentJobPresetName = () => {
        if (currentJob?.preset && PHOTO_PRESETS[currentJob.preset]) {
            return PHOTO_PRESETS[currentJob.preset].name;
        }
        return PHOTO_PRESETS[currentPreset]?.name || currentPreset;
    };

    // Get current job background color for display
    const getCurrentJobBgColor = () => {
        return currentJob?.bg_color || bgColor;
    };

    return (
        <div className="app">
            {/* AI Header */}
            <header className="ai-header">
                <div className="header-container">
                    <div className="logo-section">
                        <div className="ai-logo">
                            <i className="fas fa-brain ai-pulse"></i>
                            <div className="logo-text">
                                <h1>ePhotography <span className="ai-text">AI</span> Studio</h1>
                                <p className="tagline">Intelligent Background Removal & Photo Processing</p>
                            </div>
                        </div>
                    </div>
                    <div className="status-section">
                        <div className={`ai-status ${servicesStatus}`}>
                            <span className="neuron-dot"></span>
                            <span>AI Engine: {servicesStatus === 'available' ? 'Active' : 'Idle'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="content-grid">
                    {/* Left Panel - Controls */}
                    <div className="control-panel">
                        {/* Upload Section */}
                        <div className="control-card">
                            <div className="card-header">
                                <i className="fas fa-upload"></i>
                                <h3>Upload Photo</h3>
                            </div>
                            
                            <div 
                                className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploadProgress > 0 ? 'uploading' : ''}`}
                                onClick={() => fileInputRef.current.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleFileDrop}
                            >
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="upload-progress" style={{ width: `${uploadProgress}%` }}></div>
                                )}
                                
                                <div className="upload-content">
                                    <i className="fas fa-cloud-upload-alt upload-icon"></i>
                                    <div className="upload-text">
                                        <p className="upload-title">Drop your photo here</p>
                                        <p className="upload-subtitle">or click to browse files</p>
                                        <p className="upload-hint">Supports JPG, PNG, WEBP • Max 5MB</p>
                                    </div>
                                </div>
                                
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept="image/*" 
                                    onChange={handleFileSelect}
                                    className="file-input"
                                />
                            </div>

                            {/* Preset Selection */}
                            <div className="control-section">
                                <label className="control-label">
                                    <i className="fas fa-crop-alt"></i>
                                    <span>Photo Format</span>
                                </label>
                                <div className="preset-grid">
                                    {Object.entries(PHOTO_PRESETS).map(([key, presetData]) => (
                                        <button
                                            key={key}
                                            className={`preset-btn ${currentPreset === key ? 'active' : ''}`}
                                            onClick={() => selectPreset(key)}
                                        >
                                            <i className={`fas ${presetData.icon}`}></i>
                                            <div className="preset-info">
                                                <span>{presetData.name}</span>
                                                <small>{presetData.size}</small>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Background Color */}
                            <div className="control-section">
                                <label className="control-label">
                                    <i className="fas fa-fill-drip"></i>
                                    <span>Background Color</span>
                                </label>
                                <div className="color-control">
                                    <div 
                                        className="color-preview"
                                        style={{ backgroundColor: bgColor }}
                                        onClick={() => document.getElementById('colorPicker').click()}
                                    />
                                    <div className="color-inputs">
                                        <input 
                                            type="color" 
                                            id="colorPicker"
                                            value={bgColor}
                                            onChange={handleColorChange}
                                            className="color-picker"
                                        />
                                        <input 
                                            type="text" 
                                            value={bgColor.toUpperCase()}
                                            onChange={handleColorTextChange}
                                            className="color-text"
                                            placeholder="#FFFFFF"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Copies Counter */}
                            <div className="control-section">
                                <label className="control-label">
                                    <i className="fas fa-layer-group"></i>
                                    <span>Copies per Sheet</span>
                                </label>
                                <div className="copies-control">
                                    <div className="counter">
                                        <button 
                                            className="counter-btn" 
                                            onClick={decreaseCopies}
                                            disabled={copies <= 1}
                                        >
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <div className="counter-value">
                                            <span>{copies}</span>
                                            <small>copies</small>
                                        </div>
                                        <button 
                                            className="counter-btn" 
                                            onClick={increaseCopies}
                                            disabled={copies >= 12}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div className="copies-info">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Photo sheet with {copies} images</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <button 
                                    className={`process-btn ${isProcessing ? 'processing' : ''}`}
                                    onClick={processPhoto}
                                    disabled={!currentFile || isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-robot"></i>
                                            Process with AI
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    className="reset-btn"
                                    onClick={resetApp}
                                >
                                    <i className="fas fa-redo"></i>
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="control-card">
                            <div className="card-header">
                                <i className="fas fa-graduation-cap"></i>
                                <h3>How It Works</h3>
                            </div>
                            <div className="steps">
                                {[
                                    {
                                        icon: 'fa-upload',
                                        title: 'Upload',
                                        description: 'Select a clear, front-facing photo'
                                    },
                                    {
                                        icon: 'fa-sliders-h',
                                        title: 'Configure',
                                        description: 'Choose format, background, and copies'
                                    },
                                    {
                                        icon: 'fa-brain',
                                        title: 'AI Processing',
                                        description: 'Neural networks remove background'
                                    },
                                    {
                                        icon: 'fa-download',
                                        title: 'Download',
                                        description: 'Get print-ready photo sheet'
                                    }
                                ].map((step, index) => (
                                    <div key={index} className="step">
                                        <div className="step-number">
                                            <span>{index + 1}</span>
                                            <i className={`fas ${step.icon}`}></i>
                                        </div>
                                        <div className="step-content">
                                            <h4>{step.title}</h4>
                                            <p>{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="preview-panel">
                        {/* Main Preview */}
                        <div className="preview-card">
                            <div className="preview-header">
                                <div className="header-left">
                                    <i className="fas fa-eye"></i>
                                    <h3>Live Preview</h3>
                                </div>
                                {currentJob && (previewUrl || viewMode === 'processed') && (
                                    <button className="view-toggle" onClick={toggleView}>
                                        <i className={`fas fa-${viewMode === 'original' ? 'sync-alt' : 'history'}`}></i>
                                        {viewMode === 'original' ? 'Show Processed' : (previewUrl ? 'Show Original' : 'Back to Upload')}
                                    </button>
                                )}
                            </div>
                            
                            <div className="preview-container">
                                {viewMode === 'upload' && (
                                    <div className="preview-placeholder">
                                        <div className="placeholder-content">
                                            <i className="fas fa-image placeholder-icon"></i>
                                            <h4>No Photo Uploaded</h4>
                                            <p>Upload a photo to see AI processing preview</p>
                                            <button 
                                                className="upload-btn"
                                                onClick={() => fileInputRef.current.click()}
                                            >
                                                <i className="fas fa-upload"></i>
                                                Upload First Photo
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {(viewMode === 'original' && previewUrl) && (
                                    <div className="image-preview">
                                        <div className="image-container">
                                            <img 
                                                src={previewUrl} 
                                                alt="Original fhoto"
                                                className="preview-image"
                                            />
                                            <div className="image-overlay">
                                                <div className="image-badge">
                                                    <i className="fas fa-upload"></i>
                                                    <span>Original</span>
                                                </div>
                                                <div className="image-info">
                                                    <div className="info-item">
                                                        <i className="fas fa-crop-alt"></i>
                                                        <span>{PHOTO_PRESETS[currentPreset]?.name}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <i className="fas fa-palette"></i>
                                                        <span>BG: <span className="color-indicator" style={{ backgroundColor: bgColor }}></span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="preview-actions">
                                            <button 
                                                className="process-btn full-width"
                                                onClick={processPhoto}
                                                disabled={isProcessing || !currentFile}
                                            >
                                                <i className="fas fa-robot"></i>
                                                Process This Photo
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {(viewMode === 'processed' && currentJob?.job_id) && (
                                    <div className="image-preview">
                                        <div className="image-container">
                                            <img 
                                                src={`${CONFIG.API_BASE_URL}/api/proxy-download/${currentJob.job_id}`} 
                                                alt="Processed fhoto"
                                                className="preview-image"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const errorDiv = document.createElement('div');
                                                    errorDiv.className = 'image-error';
                                                    errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Image failed to load</p>';
                                                    e.target.parentNode.appendChild(errorDiv);
                                                }}
                                            />
                                            <div className="image-overlay">
                                                <div className="image-badge">
                                                    <i className="fas fa-robot"></i>
                                                    <span>AI Processed</span>
                                                </div>
                                                <div className="image-info">
                                                    <div className="info-item">
                                                        <i className="fas fa-crop-alt"></i>
                                                        <span>{getCurrentJobPresetName()}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <i className="fas fa-palette"></i>
                                                        <span>BG: <span className="color-indicator" style={{ backgroundColor: getCurrentJobBgColor() }}></span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="preview-actions">
                                            <button 
                                                className="download-btn"
                                                onClick={handleDownload}
                                                disabled={!currentJob?.job_id}
                                            >
                                                <i className="fas fa-download"></i>
                                                Download Photo Sheet
                                            </button>
                                            <button 
                                                className="new-btn"
                                                onClick={resetApp}
                                            >
                                                <i className="fas fa-plus"></i>
                                                New Photo
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Jobs */}
                        <div className="preview-card">
                            <div className="card-header">
                                <i className="fas fa-history"></i>
                                <h3>Recent Jobs</h3>
                            </div>
                            
                            <div className="jobs-list">
                                {recentJobs.length === 0 ? (
                                    <div className="empty-jobs">
                                        <i className="fas fa-clock"></i>
                                        <p>No recent jobs</p>
                                        <small>Processed photos will appear here</small>
                                    </div>
                                ) : (
                                    recentJobs.map((job) => {
                                        const imageUrl = job.job_id ? `${CONFIG.API_BASE_URL}/api/proxy-download/${job.job_id}` : null;
                                        
                                        return (
                                            <div className="job-item" key={job.job_id || job.id}>
                                                <div className="job-icon">
                                                    <div 
                                                        className="job-thumbnail-simple"
                                                        style={imageUrl ? {
                                                            backgroundImage: `url(${imageUrl})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            backgroundRepeat: 'no-repeat'
                                                        } : {
                                                            background: 'var(--primary-gradient)'
                                                        }}
                                                        onClick={() => imageUrl && previewJob(job.job_id)}
                                                    >
                                                        <i className={`fas ${job.preset === 'passport' ? 'fa-passport' : 'fa-globe-americas'}`}></i>
                                                    </div>
                                                </div>
                                                <div className="job-details">
                                                    <div className="job-title">
                                                        <h4>{job.preset ? job.preset.toUpperCase() : 'PROCESSED'}</h4>
                                                        <span className="job-date">
                                                            {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Today'}
                                                        </span>
                                                    </div>
                                                    <div className="job-info">
                                                        <span className="job-copies">
                                                            <i className="fas fa-copy"></i>
                                                            {job.copies || 1} copy{job.copies !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="job-actions">
                                                    {imageUrl && (
                                                        <>
                                                            <button 
                                                                className="action-btn preview-btn"
                                                                onClick={() => previewJob(job.job_id)}
                                                                title="Preview"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button 
                                                                className="action-btn download-btn"
                                                                onClick={() => downloadJob(job.job_id)}
                                                                title="Download"
                                                            >
                                                                <i className="fas fa-download"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="ai-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <p className="copyright">© 2024 ePhotography AI Studio • Neural Network Powered</p>
                        <div className="tech-badges">
                            <span className="tech-badge">
                                <i className="fab fa-node-js"></i>
                                Node.js API
                            </span>
                            <span className="tech-badge">
                                <i className="fab fa-python"></i>
                                Python AI
                            </span>
                            <span className="tech-badge">
                                <i className="fas fa-brain"></i>
                                Deep Learning
                            </span>
                            <span className="tech-badge">
                                <i className="fas fa-bolt"></i>
                                Real-time Processing
                            </span>
                        </div>
                    </div>
                    <div className="footer-right">
                        <div className="version-info">
                            <i className="fas fa-code-branch"></i>
                            <span>v2.0.1 • AI Engine</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Notifications */}
            <div className="notifications-container">
                {notifications.map((notification) => (
                    <div key={notification.id} className={`notification ${notification.type}`}>
                        <div className="notification-icon">
                            <i className={`fas ${getStatusIcon(notification.type)}`}></i>
                        </div>
                        <div className="notification-content">
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">
                                {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <button 
                            className="notification-close"
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ))}
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="processing-overlay">
                    <div className="processing-modal">
                        <div className="ai-loader">
                            <div className="neuron"></div>
                            <div className="neuron"></div>
                            <div className="neuron"></div>
                            <div className="neuron"></div>
                            <div className="neuron"></div>
                        </div>
                        <h3 className="processing-title">AI Processing Your Photo</h3>
                        <p className="processing-subtitle">
                            Neural networks are removing background and optimizing for {PHOTO_PRESETS[currentPreset]?.name}
                        </p>
                        <div className="processing-steps">
                            <div className="processing-step active">
                                <span className="step-dot"></span>
                                <span>Uploading</span>
                            </div>
                            <div className="processing-step active">
                                <span className="step-dot"></span>
                                <span>Analyzing</span>
                            </div>
                            <div className="processing-step">
                                <span className="step-dot"></span>
                                <span>Processing</span>
                            </div>
                            <div className="processing-step">
                                <span className="step-dot"></span>
                                <span>Finalizing</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Main;