import React, { useMemo } from "react";

const HistoryPage = ({ userUploads = [], currentTime, isLoading, onRefresh }) => {
    const uploads = useMemo(() => {
        return userUploads.map((upload) => ({
            id: upload._id,
            date: new Date(upload.createdAt).toLocaleDateString(),
            time: new Date(upload.createdAt).toLocaleTimeString(),
            cellType: upload.prediction?.cellType || "Unknown",
            model: upload.prediction?.modelUsed || "DefaultModel",
            confidence: upload.prediction?.confidence ? `${upload.prediction.confidence}%` : "-",
            image: upload.imagePath || null
        }));
    }, [userUploads]);

    return (
        <div className="page-content">
            <div className="card history-card">
                <div className="section-title">
                    Prediction History
                    {onRefresh && (
                        <button 
                            className="refresh-btn" 
                            onClick={onRefresh}
                            disabled={isLoading}
                            style={{ marginLeft: 'auto' }}
                        >
                            🔄 {isLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    )}
                </div>
                
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Cell Type</th>
                                <th>Model</th>
                                <th>Confidence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && uploads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                                        Loading prediction history...
                                    </td>
                                </tr>
                            ) : uploads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                                        No prediction history available
                                    </td>
                                </tr>
                            ) : (
                                uploads.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.date}</td>
                                        <td>{item.time}</td>
                                        <td>
                                            <span className="cell-type-badge">{item.cellType}</span>
                                        </td>
                                        <td>{item.model}</td>
                                        <td>{item.confidence}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
