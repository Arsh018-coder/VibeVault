import React, { useEffect, useState } from 'react';
import { Calendar, Users, Ticket, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../services/api';
import SalesChart from '../../components/dashboard/SalesChart/SalesChart';
import './OrganizerDashboardPage.css';

const OrganizerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/organizer');
        setStats(response.data.summary);
        setSalesData(response.data.salesByMonth);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="no-data">
        <h2>No data available</h2>
        <p>We couldn't find any analytics data for your account.</p>
      </div>
    );
  }

  // Calculate percentage changes (mock data - replace with actual data)
  const statsWithChanges = {
    totalEvents: {
      value: stats.totalEvents,
      change: 12, // Example: 12% increase
      isPositive: true
    },
    totalTicketsSold: {
      value: stats.totalTicketsSold,
      change: 8, // Example: 8% increase
      isPositive: true
    },
    totalRevenue: {
      value: `$${stats.totalRevenue?.toLocaleString() || '0'}`,
      change: 5, // Example: 5% increase
      isPositive: true
    },
    avgAttendance: {
      value: `${stats.avgAttendance || 0}%`,
      change: 3, // Example: 3% decrease
      isPositive: false
    }
  };

  return (
    <div className="organizer-dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your events.</p>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3><Calendar size={18} /> Total Events</h3>
          <p>{statsWithChanges.totalEvents.value}</p>
          <span className={`stat-change ${statsWithChanges.totalEvents.isPositive ? 'positive' : 'negative'}`}>
            {statsWithChanges.totalEvents.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(statsWithChanges.totalEvents.change)}% from last month
          </span>
        </div>
        
        <div className="stat-card">
          <h3><Ticket size={18} /> Tickets Sold</h3>
          <p>{statsWithChanges.totalTicketsSold.value}</p>
          <span className={`stat-change ${statsWithChanges.totalTicketsSold.isPositive ? 'positive' : 'negative'}`}>
            {statsWithChanges.totalTicketsSold.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(statsWithChanges.totalTicketsSold.change)}% from last month
          </span>
        </div>
        
        <div className="stat-card">
          <h3><DollarSign size={18} /> Total Revenue</h3>
          <p>₹{stats.totalRevenue?.toLocaleString() || '0'}</p>
          <span className={`stat-change ${statsWithChanges.totalRevenue.isPositive ? 'positive' : 'negative'}`}>
            {statsWithChanges.totalRevenue.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(statsWithChanges.totalRevenue.change)}% from last month
          </span>
        </div>
        
        <div className="stat-card">
          <h3><Users size={18} /> Total Attendees</h3>
          <p>{stats.totalAttendees || '0'}</p>
          <span className={`stat-change ${statsWithChanges.avgAttendance.isPositive ? 'positive' : 'negative'}`}>
            {statsWithChanges.avgAttendance.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(statsWithChanges.avgAttendance.change)}% from last month
          </span>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Sales Overview</h3>
            <div className="time-filter">
              <button className="active">Week</button>
              <button>Month</button>
              <button>Year</button>
            </div>
          </div>
          <div className="chart-wrapper">
            <SalesChart data={salesData} />
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h3>Recent Activity</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="activity-list">
            {[1, 2, 3].map((item) => (
              <div key={item} className="activity-item">
                <div className="activity-icon">
                  <Ticket size={16} />
                </div>
                <div className="activity-details">
                  <p>New ticket sale for <strong>Summer Festival 2023</strong></p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrganizerDashboardPage;
