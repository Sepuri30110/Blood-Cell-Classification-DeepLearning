import React, { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const COLORS = ["#22d3ee", "#6366f1", "#f87171", "#facc15"];

const Content = ({ uploadedImages = [], currentTime }) => {
    // Simulated uploads data from uploadedImages
    // Each uploadedImage should have: id, prediction (cellType), model, confidence, date
    const uploads = useMemo(() => {
        // If uploadedImages already has all fields, use as is. Otherwise, map to expected structure.
        return uploadedImages.map((img, idx) => ({
            id: img.id || idx,
            date: img.date || currentTime.toLocaleDateString(),
            cellType: img.prediction || "Unknown",
            model: img.model || "DefaultModel",
            confidence: img.confidence || "-"
        }));
    }, [uploadedImages, currentTime]);

    // Stats
    const totalUploads = uploads.length;
    const uploadsToday = uploads.filter(u => u.date === currentTime.toLocaleDateString()).length;
    const mostUsedModel = useMemo(() => {
        const modelCounts = {};
        uploads.forEach(u => {
            modelCounts[u.model] = (modelCounts[u.model] || 0) + 1;
        });
        const sorted = Object.entries(modelCounts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : "-";
    }, [uploads]);
    const uniqueCellTypes = useMemo(() => {
        const types = new Set(uploads.map(u => u.cellType));
        return types.size;
    }, [uploads]);

    // 🔹 Dynamic Distribution Calculation
    const predictionData = useMemo(() => {
        const counts = {};
        uploads.forEach((img) => {
            const label = img.cellType || "Unknown";
            counts[label] = (counts[label] || 0) + 1;
        });
        return Object.keys(counts).map((key) => ({
            name: key,
            value: counts[key]
        }));
    }, [uploads]);

    return (
        <>
            {/* ================= STATS ================= */}
            <div className="row-top">
                <div className="card stat-card">
                    <div>
                        <div className="label">Total Uploads</div>
                        <h2>{totalUploads}</h2>
                    </div>
                </div>

                <div className="card stat-card">
                    <div>
                        <div className="label">Uploads Today</div>
                        <h2>{uploadsToday}</h2>
                    </div>
                </div>

                <div className="card stat-card">
                    <div>
                        <div className="label">Most Used Model</div>
                        <h2>{mostUsedModel}</h2>
                    </div>
                </div>

                <div className="card stat-card">
                    <div>
                        <div className="label">Detected Cell Types</div>
                        <h2>{uniqueCellTypes}</h2>
                    </div>
                </div>
            </div>

            {/* ================= TABLE + CHART ================= */}
            <div className="row-bottom">
                <div className="card">
                    <div className="section-title">Recent Predictions</div>

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
                                            No uploads yet
                                        </td>
                                    </tr>
                                ) : (
                                    uploads.map((item) => (
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

                <div className="card">
                    <div className="section-title">
                        Prediction Distribution
                    </div>

                    <div className="chart-container">
                        {predictionData.length === 0 ? (
                            <p style={{ marginTop: "20px", color: "#888" }}>
                                No predictions available yet.
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={predictionData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={100}
                                        label
                                    >
                                        {predictionData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Content;
