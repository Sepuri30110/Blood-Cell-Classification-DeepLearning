import React, { useState, useEffect } from "react";
import { getAllModels } from "../../../helpers/modelsApi";
import { errorToast } from "../../../helpers/toast";

const ModelsSummaryPage = () => {
    const [models, setModels] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            setIsLoading(true);
            const response = await getAllModels();
            if (response.success) {
                setModels(response.data);
            } else {
                errorToast('Failed to load models data');
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            errorToast('Failed to load models data');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="page-content">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading models...</p>
                </div>
            </div>
        );
    }

    if (!models || models.length === 0) {
        return (
            <div className="page-content">
                <div className="no-models">
                    <p>No models available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="models-grid">
                {models.map((model) => (
                    <div key={model.id} className="card model-card">
                        <div className="model-header">
                            <h3 className="model-name">{model.name}</h3>
                        </div>
                        
                        <p className="model-description">{model.description}</p>
                        
                        <div className="model-stats">
                            <div className="stat-item">
                                <span className="stat-label">Speed</span>
                                <span className="stat-value">{model.speed}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Accuracy</span>
                                <span className="stat-value">{model.accuracy}</span>
                            </div>
                        </div>

                        <div className="model-metrics">
                            <div className="metric">
                                <span className="metric-label">Precision:</span>
                                <span className="metric-value">{model.precision}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">Recall:</span>
                                <span className="metric-value">{model.recall}</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">F1-Score:</span>
                                <span className="metric-value">{model.f1Score}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModelsSummaryPage;
