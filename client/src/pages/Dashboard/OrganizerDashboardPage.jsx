import React, { useEffect, useState } from 'react';
import { Calendar, Users, Ticket, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../services/api';
import SalesChart from '../../components/dashboard/SalesChart/SalesChart';
import AttendanceChart from '../../components/dashboard/AttendanceChart/AttendanceChart';
import './OrganizerDashboardPage.css';

const OrganizerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setStats(response.data.stats);
        // Create mock sales data for the charts since the API doesn't return it yet
        setSalesData([
          { month: 'Jan', revenue: 4000, ticketsSold: 240 },
          { month: 'Feb', revenue: 3000, ticketsSold: 139 },
          { month: 'Mar', revenue: 2000, ticketsSold: 980 },
          { month: 'Apr', revenue: 2780, ticketsSold: 390 },
          { month: 'May', revenue: 1890, ticketsSold: 480 },
          { month: 'Jun', revenue: 2390, ticketsSold: 380 },
        ]);
        
        // Mock attendance data for events
        setAttendanceData([
          { name: 'Music Festival', attendees: 1250, capacity: 1500 },
          { name: 'Tech Conference', attendees: 480, capacity: 500 },
          { name: 'Food Expo', attendees: 920, capacity: 1000 },
          { name: 'Art Exhibition', attendees: 320, capacity: 400 },
          { name: 'Startup Pitch', attendees: 180, capacity: 200 },
        ]);
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
      value: stats.totalEvents || 0,
      change: 12, // Example: 12% increase
      isPositive: true
    },
    totalBookings: {
      value: stats.totalBookings || 0,
      change: 8, // Example: 8% increase
      isPositive: true
    },
    totalRevenue: {
      value: stats.totalRevenue || 0,
      change: 5, // Example: 5% increase
      isPositive: true
    },
    activeEvents: {
      value: stats.activeEvents || 0,
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
          <h3><Ticket size={18} /> Total Bookings</h3>
          <p>{statsWithChanges.totalBookings.value}</p>
          <span className={`stat-change ${statsWithChanges.totalBookings.isPositive ? 'positive' : 'negative'}`}>
            {statsWithChanges.totalBookings.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(statsWithChanges.totalBookings.change)}% from last month
          </span>
        </div>

        <div className="stat-card">
          <h3><DollarSign size={18} /> Total Revenue</h3>
          <p>₹{statsWithChanges.totalRevenue.value.toLocaleString()}</p>
          <span className={`stat-change ${statsWithChanges.totalRevenue.isPositive ? 'positive' : 'negative'}`}>
            {statsWithChanges.totalRevenue.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(statsWithChanges.totalRevenue.change)}% from last month
          </span>
        </div>

        <div className="stat-card">
          <h3><Users size={18} /> Active Events</h3>
          <p>{statsWithChanges.activeEvents.value}</p>
          <span className={`stat-change ${statsWithChanges.activeEvents.isPositive ? 'positive' : 'negative'}`}>
            {statsWithChanges.activeEvents.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(statsWithChanges.activeEvents.change)}% from last month
          </span>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              <h3>Event Attendance</h3>
              <div className="time-filter">
                <button className="active">This Month</button>
                <button>All Time</button>
              </div>
            </div>
            <div className="chart-wrapper" style={{ height: '300px' }}>
              <AttendanceChart data={attendanceData} />
            </div>
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