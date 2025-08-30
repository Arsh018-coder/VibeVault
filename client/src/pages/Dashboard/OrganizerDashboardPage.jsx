import React, { useEffect, useState } from 'react';
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
    return <div>No data available.</div>;
  }

  return (
    <div className="container organizer-dashboard-page">
      <h2>Organizer Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p>{stats.totalEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Total Tickets Sold</h3>
          <p>{stats.totalTicketsSold}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Attendees</h3>
          <p>{stats.totalAttendees}</p>
        </div>
      </div>

      <section className="sales-chart-section">
        <h3>Sales Over Last 12 Months</h3>
        <SalesChart data={salesData} />
      </section>
    </div>
  );
};

export default OrganizerDashboardPage;
