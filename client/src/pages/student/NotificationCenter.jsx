import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCheck,
  ChevronRight,
  Clock,
  Megaphone,
  Star,
  Trash2,
  GraduationCap,
  BellOff,
  RefreshCw,
} from 'lucide-react';

// --- Helper: icon + color per notification type ---
const TYPE_META = {
  attendance: { icon: Calendar,    label: 'Attendance',   color: '#ef4444', bg: '#fee2e2' },
  homework:   { icon: BookOpen,    label: 'Homework',     color: '#3b82f6', bg: '#dbeafe' },
  notice:     { icon: Megaphone,   label: 'Notice',       color: '#f59e0b', bg: '#fef3c7' },
  result:     { icon: Star,        label: 'Result',       color: '#10b981', bg: '#d1fae5' },
  note:       { icon: GraduationCap, label: 'Note',       color: '#8b5cf6', bg: '#ede9fe' },
  general:    { icon: Bell,        label: 'Notification', color: '#1e3a8a', bg: '#eff6ff' },
};

const getTypeMeta = (type) => TYPE_META[type] || TYPE_META.general;

const formatTimeAgo = (dateStr) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return past.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

// --- Notification Card Component ---
const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const meta = getTypeMeta(notification.type);
  const Icon = meta.icon;

  return (
    <div
      className="notif-card"
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
        padding: '1rem 1.25rem',
        backgroundColor: notification.isRead ? '#ffffff' : '#f0f7ff',
        borderBottom: '1px solid #f1f5f9',
        transition: 'background-color 0.2s ease',
        borderLeft: notification.isRead ? '4px solid transparent' : `4px solid ${meta.color}`,
        cursor: 'default',
      }}
    >
      {/* Icon */}
      <div
        className="notif-icon-wrapper"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: meta.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color: meta.color }} />
      </div>

      {/* Content */}
      <div className="notif-content" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.1rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: meta.bg,
              color: meta.color,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {meta.label}
          </span>
          {!notification.isRead && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                flexShrink: 0,
              }}
            />
          )}
        </div>

        <h4
          style={{
            fontSize: '0.875rem',
            fontWeight: notification.isRead ? 500 : 700,
            color: '#1e293b',
            margin: '0 0 0.25rem 0',
            lineHeight: 1.3,
          }}
        >
          {notification.title}
        </h4>
        <p
          style={{
            fontSize: '0.8rem',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {notification.message}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginTop: '0.4rem',
            color: '#94a3b8',
            fontSize: '0.72rem',
          }}
        >
          <Clock size={11} />
          <span>{formatTimeAgo(notification.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="notif-actions" style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
        {!notification.isRead && (
          <button
            onClick={() => onMarkRead(notification._id)}
            title="Mark as read"
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.3rem 0.45rem',
              cursor: 'pointer',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <CheckCheck size={14} />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          title="Delete"
          style={{
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '0.3rem 0.45rem',
            cursor: 'pointer',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// --- Filter Tab ---
const FilterTab = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.45rem 1rem',
      fontSize: '0.8rem',
      fontWeight: 600,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: active ? '#1e3a8a' : 'transparent',
      color: active ? '#ffffff' : '#64748b',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
    {count != null && (
      <span
        style={{
          padding: '0.05rem 0.4rem',
          borderRadius: '10px',
          fontSize: '0.65rem',
          fontWeight: 700,
          backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
          color: active ? '#ffffff' : '#64748b',
        }}
      >
        {count}
      </span>
    )}
  </button>
);

// ========================================================
// MAIN COMPONENT: NotificationCenter
// ========================================================
const NotificationCenter = () => {
  const { apiRequest } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/student/notifications?limit=100');
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await apiRequest(`/student/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await apiRequest('/student/notifications/read-all', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const notif = notifications.find(n => n._id === id);
      await apiRequest(`/student/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n._id !== id));
      setTotal(prev => prev - 1);
      if (notif && !notif.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Filter notifications by type
  const filtered = notifications.filter(n => {
    if (activeFilter === 'all')    return true;
    if (activeFilter === 'unread') return !n.isRead;
    return n.type === activeFilter;
  });

  // Count per filter
  const counts = {
    all:        notifications.length,
    unread:     notifications.filter(n => !n.isRead).length,
    attendance: notifications.filter(n => n.type === 'attendance').length,
    homework:   notifications.filter(n => n.type === 'homework').length,
    notice:     notifications.filter(n => n.type === 'notice').length,
    result:     notifications.filter(n => n.type === 'result').length,
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={22} style={{ color: '#1e3a8a' }} />
            Notification Center
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>
            {unreadCount > 0 ? (
              <><strong style={{ color: '#3b82f6' }}>{unreadCount} unread</strong> of {total} total notifications</>
            ) : (
              `${total} total notifications — all caught up ✓`
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchNotifications}
            title="Refresh"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 600,
              border: '1px solid #e2e8f0', borderRadius: '8px',
              background: '#ffffff', color: '#64748b', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 600,
                border: 'none', borderRadius: '8px',
                background: '#1e3a8a', color: '#ffffff', cursor: 'pointer',
                opacity: markingAll ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!markingAll) e.currentTarget.style.background = '#172554'; }}
              onMouseLeave={e => e.currentTarget.style.background = '#1e3a8a'}
            >
              <CheckCheck size={13} />
              {markingAll ? 'Marking...' : 'Mark All Read'}
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          padding: '0.75rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px 12px 0 0',
          border: '1px solid #e2e8f0',
          borderBottom: 'none',
          flexWrap: 'nowrap',
        }}
      >
        {[
          { id: 'all',        label: 'All' },
          { id: 'unread',     label: 'Unread' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'homework',   label: 'Homework' },
          { id: 'notice',     label: 'Notices' },
          { id: 'result',     label: 'Results' },
        ].map(f => (
          <FilterTab
            key={f.id}
            active={activeFilter === f.id}
            label={f.label}
            count={counts[f.id]}
            onClick={() => setActiveFilter(f.id)}
          />
        ))}
      </div>

      {/* NOTIFICATION LIST */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
          minHeight: '200px',
        }}
      >
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <RefreshCw size={24} style={{ marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading notifications...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <div
              style={{
                width: '64px', height: '64px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <BellOff size={28} style={{ color: '#cbd5e1' }} />
            </div>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: '#64748b', fontSize: '0.95rem' }}>
              {activeFilter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>
              {activeFilter === 'unread'
                ? 'You have no unread notifications.'
                : 'Notifications from your teacher and school will appear here.'}
            </p>
          </div>
        ) : (
          filtered.map(notification => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* FOOTER NOTE */}
      {filtered.length > 0 && (
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
          Showing {filtered.length} of {total} notifications
        </p>
      )}
      {/* Local Responsive styles for Notification Center */}
      <style>{`
        @media (max-width: 576px) {
          .notif-card {
            padding: 0.75rem 1rem !important;
            gap: 0.75rem !important;
          }
          .notif-icon-wrapper {
            width: 32px !important;
            height: 32px !important;
            border-radius: 8px !important;
          }
          .notif-icon-wrapper svg {
            width: 14px !important;
            height: 14px !important;
          }
          .notif-actions {
            flex-direction: column !important;
            align-self: center !important;
            gap: 0.4rem !important;
          }
          .notif-actions button {
            padding: 0.25rem 0.35rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
