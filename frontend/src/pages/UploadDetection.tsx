import React, { useState, useRef } from 'react';

const UploadDetection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [detections, setDetections] = useState<any[]>([]);
    const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultImage(null);
            setVideoResultUrl(null);
            setDetections([]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const endpoint = activeTab === 'image'
                ? 'http://localhost:8000/detect/image'
                : 'http://localhost:8000/detect/video';

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Upload failed');
            }

            if (activeTab === 'image') {
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setResultImage(`data:image/jpeg;base64,${data.image}`);
                setDetections(data.detections);
            } else {
                // For video, we get a blob or file response
                const blob = await response.blob();
                const videoUrl = URL.createObjectURL(blob);
                setVideoResultUrl(videoUrl);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ padding: '2rem', color: '#fff', minHeight: '100vh', background: '#0f172a' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>
                <span style={{ color: '#ef4444' }}>Wildfire</span> Detection Upload
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('image')}
                    style={{
                        padding: '10px 20px',
                        marginRight: '1rem',
                        background: activeTab === 'image' ? '#ef4444' : '#1e293b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background 0.3s'
                    }}
                >
                    Image Detection
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'video' ? '#ef4444' : '#1e293b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background 0.3s'
                    }}
                >
                    Video Detection
                </button>
            </div>

            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: '#1e293b',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ marginBottom: '1.5rem', border: '2px dashed #475569', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
                    <input
                        type="file"
                        accept={activeTab === 'image' ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                        id="file-upload"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                        {selectedFile ? (
                            <div style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                                Selected: <span style={{ color: '#ef4444' }}>{selectedFile.name}</span>
                            </div>
                        ) : (
                            <div style={{ color: '#94a3b8' }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Click to upload {activeTab}</p>
                                <p style={{ fontSize: '0.9rem' }}>Supported formats: {activeTab === 'image' ? 'JPG, PNG' : 'MP4, AVI'}</p>
                            </div>
                        )}
                    </label>
                </div>

                {selectedFile && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <button
                            onClick={handleUpload}
                            disabled={isProcessing}
                            style={{
                                padding: '12px 30px',
                                background: isProcessing ? '#94a3b8' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                width: '100%',
                                transition: 'background 0.3s'
                            }}
                        >
                            {isProcessing ? 'Processing...' : `Analyze ${activeTab === 'image' ? 'Image' : 'Video'}`}
                        </button>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '1rem', background: '#450a0a', color: '#fca5a5', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #7f1d1d' }}>
                        Error: {error}
                    </div>
                )}

                {/* Results Area */}
                <div style={{ marginTop: '2rem' }}>
                    {activeTab === 'image' && resultImage && (
                        <div>
                            <h3 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Detection Results:</h3>
                            <img src={resultImage} alt="Processed" style={{ maxWidth: '100%', borderRadius: '0.5rem', border: '2px solid #475569' }} />

                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>Detected Objects:</h4>
                                {detections.length === 0 ? (
                                    <p style={{ color: '#94a3b8' }}>No objects detected.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {detections.map((det, idx) => (
                                            <span key={idx} style={{
                                                background: det.class.toLowerCase().includes('fire') ? '#7f1d1d' : '#14532d',
                                                color: '#f1f5f9',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.9rem',
                                                border: det.class.toLowerCase().includes('fire') ? '1px solid #ef4444' : '1px solid #22c55e'
                                            }}>
                                                {det.class} ({Math.round(det.confidence * 100)}%)
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'video' && videoResultUrl && (
                        <div>
                            <h3 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Processed Video:</h3>
                            <video controls src={videoResultUrl} style={{ width: '100%', borderRadius: '0.5rem', border: '2px solid #475569' }} />
                            <a
                                href={videoResultUrl}
                                download="processed_video.mp4"
                                style={{ display: 'inline-block', marginTop: '1rem', color: '#ef4444', textDecoration: 'none' }}
                            >
                                Download Processed Video
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadDetection;
