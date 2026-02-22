import React, { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const COLORS = ["#22d3ee", "#6366f1", "#f87171", "#facc15", "#10b981", "#ec4899", "#8b5cf6", "#f59e0b"];

const DashboardPage = ({ dashboardStats, userUploads = [], currentTime, isLoading, onRefresh }) => {
    // Transform backend data to match table format
    const uploads = useMemo(() => {
        return userUploads.map((upload) => ({
            id: upload._id,
            date: new Date(upload.createdAt).toLocaleDateString(),
            cellType: upload.prediction?.cellType || "Unknown",
            model: upload.prediction?.modelUsed || "DefaultModel",
            confidence: upload.prediction?.confidence ? `${upload.prediction.confidence}%` : "-"
        }));
    }, [userUploads]);

    // Use stats from backend if available, otherwise calculate from uploads
    const stats = useMemo(() => {
        if (dashboardStats) {
            return {
                totalUploads: dashboardStats.totalUploads || 0,
                uploadsToday: dashboardStats.uploadsToday || 0,
                mostUsedModel: dashboardStats.mostUsedModel || "-",
                uniqueCellTypes: dashboardStats.uniqueCellTypes || 0,
                distribution: dashboardStats.distribution || []
            };
        }

        // Fallback: calculate from uploads
        const totalUploads = uploads.length;
        const today = currentTime.toLocaleDateString();
        const uploadsToday = uploads.filter(u => u.date === today).length;
        
        const modelCounts = {};
        uploads.forEach(u => {
            modelCounts[u.model] = (modelCounts[u.model] || 0) + 1;
        });
        const sorted = Object.entries(modelCounts).sort((a, b) => b[1] - a[1]);
        const mostUsedModel = sorted.length > 0 ? sorted[0][0] : "-";
        
        const types = new Set(uploads.map(u => u.cellType));
        const uniqueCellTypes = types.size;

        const counts = {};
        uploads.forEach((u) => {
            counts[u.cellType] = (counts[u.cellType] || 0) + 1;
        });
        const distribution = Object.keys(counts).map((key) => ({
            name: key,
            value: counts[key]
        }));

        return { totalUploads, uploadsToday, mostUsedModel, uniqueCellTypes, distribution };
    }, [dashboardStats, uploads, currentTime]);

    if (isLoading && !dashboardStats) {
        return (
            <div className="page-content">
                <div className="loading-container">
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ================= STATS ================= */}
            <div className="row-top">
                <div className="card stat-card">
                    <div>
                        <div className="label">Total Uploads</div>
                        <h2>{stats.totalUploads}</h2>
                    </div>
                </div>

                <div className="card stat-card">
                    <div>
                        <div className="label">Uploads Today</div>
                        <h2>{stats.uploadsToday}</h2>
                    </div>
                </div>

                <div className="card stat-card">
                    <div>
                        <div className="label">Most Used Model</div>
                        <h2>{stats.mostUsedModel}</h2>
                    </div>
                </div>

                <div className="card stat-card">
                    <div>
                        <div className="label">Detected Cell Types</div>
                        <h2>{stats.uniqueCellTypes}</h2>
                    </div>
                </div>
            </div>

            {/* ================= TABLE + CHART ================= */}
            <div className="row-bottom">
                <div className="card">
                    <div className="section-title">
                        Recent Predictions
                        {onRefresh && (
                            <button 
                                className="refresh-btn" 
                                onClick={onRefresh}
                                disabled={isLoading}
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
                                    <th>Cell Type</th>
                                    <th>Model</th>
                                    <th>Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploads.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center" }}>
                                            {isLoading ? 'Loading...' : 'No uploads yet'}
                                        </td>
                                    </tr>
                                ) : (
                                    uploads.slice(0, 5).map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.date}</td>
                                            <td>{item.cellType}</td>
                                            <td>{item.model}</td>
                                            <td>{item.confidence}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card chart-card">
                    <div className="section-title">
                        Prediction Distribution
                    </div>

                    <div className="chart-container">
                        {stats.distribution.length === 0 ? (
                            <p style={{ marginTop: "20px", color: "#888" }}>
                                {isLoading ? 'Loading...' : 'No predictions available yet.'}
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.distribution}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="70%"
                                        label
                                    >
                                        {stats.distribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
