import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../../../../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications/my');
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error('Error fetching notifications', error);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="notification-bell">
      <button className="bell-btn" onClick={() => setOpen(!open)}>
        <Bell size={24} />
        {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No new notifications.</p>
          ) : (
            <ul>
              {notifications.map((note) => (
                <li key={note._id} className={note.isRead ? '' : 'unread'}>
                  <p>{note.message}</p>
                  <small>{new Date(note.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
