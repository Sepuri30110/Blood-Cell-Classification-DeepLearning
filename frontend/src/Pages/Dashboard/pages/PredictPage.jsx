import React, { useState, useEffect } from "react";
import { predictImage } from "../../../helpers/uploadApi";
import { saveToCache, getFromCache, clearCache, CACHE_KEYS } from "../../../helpers/cache";
import { errorToast, successToast } from "../../../helpers/toast";

const PredictPage = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Options state
    const [options, setOptions] = useState({
        classification: false,
        detection: false,
        count: false
    });
    
    // Classification model selection (multiple models)
    const [classificationModels, setClassificationModels] = useState([]);
    
    // Show labels option for detection/count
    const [showLabels, setShowLabels] = useState(true);

    // Load cached results on mount
    useEffect(() => {
        const cachedResults = getFromCache(CACHE_KEYS.PREDICTION_RESULTS);
        if (cachedResults) {
            setResults(cachedResults);
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Clear cache when new image is uploaded
            clearCache(CACHE_KEYS.PREDICTION_RESULTS);
            setResults(null);
            
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOptionChange = (option) => {
        setOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    const handleModelToggle = (model) => {
        setClassificationModels(prev => {
            if (prev.includes(model)) {
                return prev.filter(m => m !== model);
            } else {
                return [...prev, model];
            }
        });
    };

    const handlePredict = async () => {
        if (!selectedFile) {
            errorToast("Please select an image first");
            return;
        }

        if (!options.classification && !options.detection && !options.count) {
            errorToast("Please select at least one option");
            return;
        }

        if (options.classification && classificationModels.length === 0) {
            errorToast("Please select at least one classification model");
            return;
        }

        setIsLoading(true);
        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                
                const requestData = {
                    image: base64Image,
                    fileName: selectedFile.name,
                    fileSize: selectedFile.size,
                    mimeType: selectedFile.type,
                    options: {
                        classification: options.classification,
                        detection: options.detection,
                        count: options.count
                    }
                };

                // Add classification models if classification is selected
                if (options.classification) {
                    requestData.classificationModels = classificationModels;
                }
                
                // Add showLabels option if detection or count is selected
                if (options.detection || options.count) {
                    requestData.showLabels = showLabels;
                }

                const response = await predictImage(requestData);
                
                if (response.success) {
                    setResults(response.data);
                    // Save to cache
                    saveToCache(CACHE_KEYS.PREDICTION_RESULTS, response.data);
                    successToast("Prediction completed successfully");
                    
                    // If data was saved to database, refresh dashboard data
                    if (response.recordId && onUploadSuccess) {
                        onUploadSuccess();
                    }
                } else {
                    errorToast(response.message || "Prediction failed. Please try again.");
                }
                setIsLoading(false);
            };
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error("Prediction error:", error);
            errorToast("Failed to process prediction. Please check your connection and try again.");
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreview(null);
        setResults(null);
        setOptions({
            classification: false,
            detection: false,
            count: false
        });
        setClassificationModels([]);
        setShowLabels(true);
        clearCache(CACHE_KEYS.PREDICTION_RESULTS);
    };

    return (
        <div className="page-content">
            {/* Upload & Options */}
            <div className="card upload-and-options">
                <div className="upload-section">
                    <div className="section-title">Upload Blood Cell Image</div>
                    
                    <div className="upload-area">
                        <input
                            type="file"
                            id="file-input"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        <label htmlFor="file-input" className="upload-label">
                            {preview ? (
                                <img src={preview} alt="Preview" className="preview-image" />
                            ) : (
                                <div className="upload-placeholder">
                                    <div className="upload-icon">📁</div>
                                    <p>Click to upload or drag and drop</p>
                                    <p className="upload-hint">PNG, JPG, JPEG (max. 5MB)</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                <div className="options-section">
                    <div className="section-title">Analysis Options</div>
                        
                        <div className="options-list">
                            {/* Classification Option */}
                            <div className="option-group">
                                <label className="option-label">
                                    <input
                                        type="checkbox"
                                        checked={options.classification}
                                        onChange={() => handleOptionChange('classification')}
                                    />
                                    <span>Classification</span>
                                </label>
                                
                                {options.classification && (
                                    <div className="sub-options">
                                        <div className="sub-option-title">Select Models (one or more):</div>
                                        {/* {['ResNet', 'DenseNet', 'MobileNet', 'EfficientNet', 'CNN', 'ViT'].map((model) => ( */}
                                        {['ResNet', 'DenseNet', 'MobileNet', 'ViT'].map((model) => (
                                            <label key={model} className="sub-option-label">
                                                <input
                                                    type="checkbox"
                                                    checked={classificationModels.includes(model)}
                                                    onChange={() => handleModelToggle(model)}
                                                />
                                                <span>{model} {model === 'MobileNet' && <span className="recommended-badge">Recommended</span>}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Detection Option */}
                            <div className="option-group">
                                <label className="option-label">
                                    <input
                                        type="checkbox"
                                        checked={options.detection}
                                        onChange={() => handleOptionChange('detection')}
                                    />
                                    <span>Detection</span>
                                </label>
                            </div>

                            {/* Count Option */}
                            <div className="option-group">
                                <label className="option-label">
                                    <input
                                        type="checkbox"
                                        checked={options.count}
                                        onChange={() => handleOptionChange('count')}
                                    />
                                    <span>Detection Count</span>
                                </label>
                            </div>
                        </div>
                        
                        {/* Show Labels Option (only visible when detection or count is selected) */}
                        {(options.detection || options.count) && (
                            <div className="advanced-options">
                                <label className="option-label">
                                    <input
                                        type="checkbox"
                                        checked={showLabels}
                                        onChange={() => setShowLabels(!showLabels)}
                                    />
                                    <span>Show cell type labels on bounding boxes</span>
                                </label>
                            </div>
                        )}

                    <div className="button-group">
                        <button 
                            className="btn btn-primary" 
                            onClick={handlePredict}
                            disabled={!selectedFile || isLoading}
                        >
                            {isLoading ? "Analyzing..." : "Submit"}
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={handleClear}
                            disabled={!selectedFile && !results}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {results && (
                        <div className="card results-container">
                            <div className="section-title">Results</div>
                            
                            {/* Classification Results */}
                            {results.classification && results.classification.length > 0 && (
                                <div className="result-section">
                                    <h3 className="result-section-title">Classification Results</h3>
                                    <table className="results-table">
                                        <thead>
                                            <tr>
                                                <th>Model</th>
                                                <th>Cell Type</th>
                                                <th>Confidence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.classification.map((result, index) => (
                                                <tr key={index}>
                                                    <td><strong>{result.model}</strong></td>
                                                    <td>
                                                        <span className="cell-type-badge">
                                                            {result.cellType}
                                                        </span>
                                                    </td>
                                                    <td>{result.confidence}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Detection Results */}
                            {results.detection && (
                                <div className="result-section">
                                    <h3 className="result-section-title">Detection</h3>
                                    <div className="detection-image-container">
                                        <img 
                                            src={results.detection.image} 
                                            alt="Detection Result" 
                                            className="detection-image"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Count Results */}
                            {results.count && (
                                <div className="result-section">
                                    <h3 className="result-section-title">Detection Count</h3>
                                    <div className="detection-image-container">
                                        <img 
                                            src={results.count.image} 
                                            alt="Count Result" 
                                            className="detection-image"
                                        />
                                    </div>
                                    <div className="count-stats">
                                        <div className="count-item">
                                            <span className="count-label">WBC Count:</span>
                                            <span className="count-value">{results.count.wbc}</span>
                                        </div>
                                        <div className="count-item">
                                            <span className="count-label">RBC Count:</span>
                                            <span className="count-value">{results.count.rbc}</span>
                                        </div>
                                        <div className="count-item">
                                            <span className="count-label">Total Cells:</span>
                                            <span className="count-value">{results.count.wbc + results.count.rbc}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!results && (
                        <div className="card empty-results">
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <p>Results will appear here</p>
                                <p className="empty-hint">Upload an image and select analysis options to get started</p>
                            </div>
                        </div>
                    )}
        </div>
    );
};

export default PredictPage;
