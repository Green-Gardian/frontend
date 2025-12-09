import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Users,
    BarChart3,
    Calendar,
    MessageSquare,
    Smile,
    Meh,
    Frown,
    ThumbsUp,
    ThumbsDown,
    Star,
    Activity
} from 'lucide-react';
import {
    getSentimentOverview,
    getSentimentTrends,
    getDriverRankings,
    getUrgentFeedback,
    getSentimentByServiceType,
    getSystemFeedbackStats
} from '../../services/sentimentAnalytics';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const SENTIMENT_COLORS = {
    very_positive: '#10b981',
    positive: '#34d399',
    neutral: '#fbbf24',
    negative: '#f87171',
    very_negative: '#dc2626'
};

const SentimentAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    // Data states - Initialize with empty arrays/null
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [driverRankings, setDriverRankings] = useState([]);
    const [urgentFeedback, setUrgentFeedback] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [systemStats, setSystemStats] = useState(null);

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { startDate, endDate } = dateRange;

            // Load overview data
            try {
                const overviewData = await getSentimentOverview(startDate, endDate);
                setOverview(overviewData?.overview || null);
            } catch (err) {
                console.error('Error loading overview:', err);
            }

            // Load trends
            try {
                const trendsData = await getSentimentTrends('week', 12);
                setTrends(trendsData?.trends || []);
            } catch (err) {
                console.error('Error loading trends:', err);
            }

            // Load driver rankings
            try {
                const rankingsData = await getDriverRankings(startDate, endDate);
                setDriverRankings(rankingsData?.rankings || []);
            } catch (err) {
                console.error('Error loading driver rankings:', err);
            }

            // Load urgent feedback
            try {
                const urgentData = await getUrgentFeedback();
                setUrgentFeedback(urgentData?.urgent_feedback || []);
            } catch (err) {
                console.error('Error loading urgent feedback:', err);
            }

            // Load service types
            try {
                const serviceData = await getSentimentByServiceType();
                setServiceTypes(serviceData?.service_types || []);
            } catch (err) {
                console.error('Error loading service types:', err);
            }

            // Load system feedback stats
            try {
                const statsData = await getSystemFeedbackStats(startDate, endDate);
                setSystemStats(statsData?.stats || null);
            } catch (err) {
                console.error('Error loading system stats:', err);
            }

        } catch (error) {
            console.error('Error loading sentiment data:', error);
            setError(error.message || 'Failed to load sentiment analytics data');
        } finally {
            setLoading(false);
        }
    };

    const getSentimentIcon = (label) => {
        switch (label) {
            case 'very_positive':
                return <Smile className="w-5 h-5 text-green-500" />;
            case 'positive':
                return <ThumbsUp className="w-5 h-5 text-green-400" />;
            case 'neutral':
                return <Meh className="w-5 h-5 text-yellow-500" />;
            case 'negative':
                return <ThumbsDown className="w-5 h-5 text-red-400" />;
            case 'very_negative':
                return <Frown className="w-5 h-5 text-red-500" />;
            default:
                return <MessageSquare className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatSentimentLabel = (label) => {
        return label.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={() => loadData()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">{/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Activity className="w-8 h-8 text-green-600" />
                    Sentiment Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                    Analyze customer feedback sentiment and driver performance
                </p>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Date Range:</label>
                    </div>
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => setDateRange({ startDate: '', endDate: '' })}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'trends', label: 'Trends', icon: TrendingUp },
                            { id: 'drivers', label: 'Driver Rankings', icon: Users },
                            { id: 'urgent', label: 'Urgent Feedback', icon: AlertCircle },
                            { id: 'system', label: 'System Feedback', icon: MessageSquare }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                `}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && overview && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Feedback</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {overview.total_feedback}
                                        </p>
                                    </div>
                                    <MessageSquare className="w-12 h-12 text-blue-500 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Sentiment Score</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {overview.avg_sentiment_score || 'N/A'}
                                        </p>
                                    </div>
                                    <Activity className="w-12 h-12 text-green-500 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Rating</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2 flex items-center gap-1">
                                            {overview.avg_rating || 'N/A'}
                                            <Star className="w-6 h-6 text-yellow-500" />
                                        </p>
                                    </div>
                                    <Star className="w-12 h-12 text-yellow-500 opacity-20" />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Urgent Feedback</p>
                                        <p className="text-3xl font-bold text-red-600 mt-2">
                                            {overview.urgent_feedback_count}
                                        </p>
                                    </div>
                                    <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
                                </div>
                            </div>
                        </div>

                        {/* Sentiment Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Distribution Chart */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Sentiment Distribution
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(overview.distribution).map(([key, value]) => ({
                                                name: formatSentimentLabel(key),
                                                value: value
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {Object.keys(overview.distribution).map((key, index) => (
                                                <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[key]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Distribution Breakdown */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Sentiment Breakdown
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(overview.distribution).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getSentimentIcon(key)}
                                                <span className="text-sm font-medium text-gray-700">
                                                    {formatSentimentLabel(key)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${(value / overview.total_feedback) * 100}%`,
                                                            backgroundColor: SENTIMENT_COLORS[key]
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 w-12 text-right">
                                                    {value}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Service Types */}
                        {serviceTypes && serviceTypes.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Sentiment by Service Type
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={serviceTypes}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="avg_sentiment_score" fill="#10b981" name="Avg Sentiment Score" />
                                        <Bar dataKey="avg_rating" fill="#fbbf24" name="Avg Rating" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                )}

                {/* Trends Tab */}
                {activeTab === 'trends' && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Sentiment Trends Over Time
                        </h3>
                        {trends && trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="avg_sentiment_score"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        name="Avg Sentiment Score"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg_rating"
                                        stroke="#fbbf24"
                                        strokeWidth={2}
                                        name="Avg Rating"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total_feedback"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        name="Total Feedback"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No trend data available</p>
                        )}
                    </div>
                )}

                {/* Driver Rankings Tab */}
                {activeTab === 'drivers' && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Top Performing Drivers
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Driver
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Feedback
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Sentiment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Rating
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Positive
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Negative
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {driverRankings && driverRankings.map((ranking) => (
                                        <tr key={ranking.driver.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                          ${ranking.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                        ranking.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                                            ranking.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-100 text-blue-800'}
                        `}>
                                                    {ranking.rank}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {ranking.driver.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {ranking.driver.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {ranking.stats.total_feedback}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {ranking.stats.avg_sentiment_score}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                    <span className="text-sm text-gray-900">{ranking.stats.avg_rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    {ranking.stats.positive_feedback}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-sm text-red-600">
                                                    <ThumbsDown className="w-4 h-4" />
                                                    {ranking.stats.negative_feedback}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {driverRankings.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No driver rankings available (minimum 5 feedback required)
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Urgent Feedback Tab */}
                {activeTab === 'urgent' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Urgent Feedback Requiring Attention
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                These feedback items have been flagged as requiring urgent attention
                            </p>

                            {urgentFeedback && urgentFeedback.length > 0 ? (
                                <div className="space-y-4">
                                    {urgentFeedback.map((feedback) => (
                                        <div
                                            key={feedback.id}
                                            className="border border-red-200 bg-red-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                                    <span className="font-medium text-gray-900">
                                                        Request #{feedback.request_number}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(feedback.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h4 className="font-semibold text-gray-900 mb-2">
                                                {feedback.request_title}
                                            </h4>

                                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                <div>
                                                    <span className="text-gray-600">Resident: </span>
                                                    <span className="text-gray-900">
                                                        {feedback.resident_first_name} {feedback.resident_last_name}
                                                    </span>
                                                </div>
                                                {feedback.driver_first_name && (
                                                    <div>
                                                        <span className="text-gray-600">Driver: </span>
                                                        <span className="text-gray-900">
                                                            {feedback.driver_first_name} {feedback.driver_last_name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {feedback.comments && (
                                                <p className="text-sm text-gray-700 mb-2 italic">
                                                    "{feedback.comments}"
                                                </p>
                                            )}

                                            {feedback.sentiment_summary && (
                                                <div className="bg-white rounded p-3 text-sm">
                                                    <span className="font-medium text-gray-700">AI Summary: </span>
                                                    <span className="text-gray-600">{feedback.sentiment_summary}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No urgent feedback at this time
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* System Feedback Tab */}
                {activeTab === 'system' && systemStats && (
                    <div className="space-y-6">
                        {/* System Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Total System Feedback</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {systemStats.total_feedback}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Open</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {systemStats.open_count}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Resolved</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {systemStats.resolved_count}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Urgent</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">
                                    {systemStats.urgent_count}
                                </p>
                            </div>
                        </div>

                        {/* By Category, Type, and Role */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* By Category */}
                            {systemStats.by_category && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">By Category</h4>
                                    <div className="space-y-2">
                                        {Object.entries(systemStats.by_category).map(([category, count]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 capitalize">{category}</span>
                                                <span className="text-sm font-semibold text-gray-900">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* By Type */}
                            {systemStats.by_type && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">By Type</h4>
                                    <div className="space-y-2">
                                        {Object.entries(systemStats.by_type).map(([type, count]) => (
                                            <div key={type} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 capitalize">{type}</span>
                                                <span className="text-sm font-semibold text-gray-900">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* By Role */}
                            {systemStats.by_role && (
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">By User Role</h4>
                                    <div className="space-y-2">
                                        {Object.entries(systemStats.by_role).map(([role, count]) => (
                                            <div key={role} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 capitalize">{role}</span>
                                                <span className="text-sm font-semibold text-gray-900">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SentimentAnalytics;
