import React, { useState, useEffect } from "react";
import "./main.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DashboardPage from "./pages/DashboardPage";
import PredictPage from "./pages/PredictPage";
import HistoryPage from "./pages/HistoryPage";
import ModelsSummaryPage from "./pages/ModelsSummaryPage";
import { getUploadStats, getUserUploads } from "../../helpers/uploadApi";
import { getHistory } from "../../helpers/historyApi";
import { saveToCache, getFromCache, CACHE_KEYS, clearCache, clearCacheByPrefix } from "../../helpers/cache";
import { errorToast } from "../../helpers/toast";

const Dashboard = () => {
    // State for current time
    const [currentTime, setCurrentTime] = useState(new Date());
    // State for active page
    const [activePage, setActivePage] = useState("dashboard");
    // State for dashboard data
    const [dashboardStats, setDashboardStats] = useState(null);
    const [userUploads, setUserUploads] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch dashboard stats from backend or cache
    const fetchDashboardStats = async () => {
        try {
            setIsLoading(true);

            // Check cache first
            const cachedStats = getFromCache(CACHE_KEYS.DASHBOARD_STATS);
            if (cachedStats) {
                console.log('Using cached dashboard stats');
                setDashboardStats(cachedStats);
                setIsLoading(false);
                return;
            }

            // Fetch from backend
            console.log('Fetching dashboard stats from backend');
            const response = await getUploadStats();
            if (response.success) {
                setDashboardStats(response.data);
                // Save to cache
                saveToCache(CACHE_KEYS.DASHBOARD_STATS, response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            errorToast('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user uploads from backend or cache
    const fetchUserUploads = async (options = {}) => {
        try {
            setIsLoading(true);

            // Check cache first
            const cacheKey = `${CACHE_KEYS.USER_UPLOADS}_${JSON.stringify(options)}`;
            const cachedUploads = getFromCache(cacheKey);
            if (cachedUploads) {
                console.log('Using cached user uploads');
                setUserUploads(cachedUploads);
                setIsLoading(false);
                return;
            }

            // Fetch from backend
            console.log('Fetching user uploads from backend');
            const response = await getUserUploads({ ...options, limit: 50 });
            if (response.success) {
                setUserUploads(response.data);
                // Save to cache
                saveToCache(cacheKey, response.data);
            }
        } catch (error) {
            console.error('Error fetching user uploads:', error);
            errorToast('Failed to load upload history');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch history from backend or cache
    const fetchHistory = async (options = {}) => {
        try {
            setIsHistoryLoading(true);

            // Check cache first
            const cacheKey = `${CACHE_KEYS.HISTORY}_${JSON.stringify(options)}`;
            const cachedHistory = getFromCache(cacheKey);
            if (cachedHistory) {
                console.log('Using cached history');
                setHistoryData(cachedHistory);
                setIsHistoryLoading(false);
                return;
            }

            // Fetch from backend
            console.log('Fetching history from backend');
            const response = await getHistory({ ...options, limit: 100 });
            if (response.success) {
                setHistoryData(response.data);
                // Save to cache
                saveToCache(cacheKey, response.data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            errorToast('Failed to load prediction history');
        } finally {
            setIsHistoryLoading(false);
        }
    };

    // Refresh data (clear cache and refetch)
    const refreshData = () => {
        clearCache(CACHE_KEYS.DASHBOARD_STATS);
        clearCacheByPrefix(CACHE_KEYS.USER_UPLOADS);
        clearCacheByPrefix(CACHE_KEYS.HISTORY);
        fetchDashboardStats();
        fetchUserUploads();
        if (activePage === 'history') {
            fetchHistory();
        }
    };

    // Fetch data on mount
    useEffect(() => {
        fetchDashboardStats();
        fetchUserUploads();
    }, []);

    // Fetch history when history page is active
    useEffect(() => {
        if (activePage === 'history') {
            fetchHistory();
        }
    }, [activePage]);

    // Page configurations
    const pageConfig = {
        dashboard: {
            title: "Dashboard Overview",
            subtitle: "Blood Cell Detection Analytics"
        },
        predict: {
            title: "Predict Blood Cell Type",
            subtitle: "Upload and analyze blood cell images"
        },
        history: {
            title: "Prediction History",
            subtitle: "View all previous predictions and results"
        },
        models: {
            title: "Models Summary",
            subtitle: "Available AI models for blood cell classification"
        }
    };

    // Render the active page component
    const renderPage = () => {
        switch (activePage) {
            case "dashboard":
                return (
                    <DashboardPage 
                        dashboardStats={dashboardStats}
                        userUploads={userUploads}
                        currentTime={currentTime}
                        isLoading={isLoading}
                        onRefresh={refreshData}
                    />
                );
            case "predict":
                return <PredictPage onUploadSuccess={refreshData} />;
            case "history":
                return (
                    <HistoryPage 
                        userUploads={historyData}
                        currentTime={currentTime}
                        isLoading={isHistoryLoading}
                        onRefresh={refreshData}
                    />
                );
            case "models":
                return <ModelsSummaryPage />;
            default:
                return (
                    <DashboardPage 
                        dashboardStats={dashboardStats}
                        userUploads={userUploads}
                        currentTime={currentTime}
                        isLoading={isLoading}
                        onRefresh={refreshData}
                    />
                );
        }
    };

    return (
        <div className="dashboard">
            <Sidebar activePage={activePage} onPageChange={setActivePage} />
            
            <main className="main">
                <Header 
                    currentTime={currentTime}
                    title={pageConfig[activePage].title}
                    subtitle={pageConfig[activePage].subtitle}
                />
                {renderPage()}
            </main>
        </div>
    );
};

export default Dashboard;