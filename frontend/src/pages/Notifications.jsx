import { useEffect, useState } from "react";
import { apiService } from "../services/api";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);

            const data = await apiService.getNotifications();

            setNotifications(data || []);
        } catch (error) {
            console.error("Notification error:", error);
        } finally {
            setLoading(false);
        }
    };

    const markRead = async (id) => {
        try {
            await apiService.markNotificationRead(id);

            setNotifications(prev =>
                prev.map(n =>
                    n.id === id
                        ? { ...n, is_read: true }
                        : n
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            await apiService.markAllNotificationsRead();

            setNotifications(prev =>
                prev.map(n => ({
                    ...n,
                    is_read: true
                }))
            );
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter(
        n => !n.is_read
    ).length;

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        🔔 Notifications
                    </h1>

                    <p style={styles.subtitle}>
                        Service assignments, workflow updates
                        and operational alerts.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        style={styles.readAllButton}
                    >
                        Mark all as read
                    </button>
                )}
            </div>


            <div style={styles.summary}>
                <strong>{unreadCount}</strong>
                <span>unread notifications</span>
            </div>


            {loading ? (

                <div style={styles.empty}>
                    Loading notifications...
                </div>

            ) : notifications.length === 0 ? (

                <div style={styles.empty}>
                    <div style={styles.emptyIcon}>
                        🔕
                    </div>

                    <h3>No notifications</h3>

                    <p>
                        You're all caught up.
                    </p>
                </div>

            ) : (

                <div style={styles.list}>

                    {notifications.map(notification => (

                        <div
                            key={notification.id}
                            style={{
                                ...styles.notification,
                                ...(notification.is_read
                                    ? {}
                                    : styles.unread)
                            }}
                        >

                            <div style={styles.icon}>
                                {notification.is_read
                                    ? "🔔"
                                    : "🔵"}
                            </div>


                            <div style={styles.content}>

                                <div style={styles.notificationHeader}>

                                    <strong>
                                        {notification.title}
                                    </strong>

                                    {!notification.is_read && (
                                        <span style={styles.newBadge}>
                                            NEW
                                        </span>
                                    )}

                                </div>


                                <p style={styles.message}>
                                    {notification.message}
                                </p>


                                <div style={styles.footer}>

                                    <span>
                                        {notification.type}
                                    </span>

                                    {notification.created_at && (
                                        <span>
                                            {new Date(
                                                notification.created_at
                                            ).toLocaleString()}
                                        </span>
                                    )}

                                </div>

                            </div>


                            {!notification.is_read && (

                                <button
                                    style={styles.readButton}
                                    onClick={() =>
                                        markRead(notification.id)
                                    }
                                >
                                    Mark read
                                </button>

                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}


const styles = {

    page: {
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "25px",
        minHeight: "100vh",
        background: "#f8fafc"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        marginBottom: "20px"
    },

    title: {
        margin: 0,
        fontSize: "28px"
    },

    subtitle: {
        color: "#64748b",
        marginTop: "6px"
    },

    readAllButton: {
        padding: "10px 14px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 600
    },

    summary: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        marginBottom: "18px",
        color: "#64748b"
    },

    empty: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "50px",
        textAlign: "center",
        color: "#64748b"
    },

    emptyIcon: {
        fontSize: "40px"
    },

    list: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },

    notification: {
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "16px"
    },

    unread: {
        borderLeft: "4px solid #2563eb",
        background: "#f8fbff"
    },

    icon: {
        fontSize: "20px"
    },

    content: {
        flex: 1
    },

    notificationHeader: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },

    newBadge: {
        fontSize: "9px",
        fontWeight: 700,
        background: "#2563eb",
        color: "#ffffff",
        padding: "3px 6px",
        borderRadius: "5px"
    },

    message: {
        margin: "7px 0",
        color: "#475569",
        lineHeight: 1.5
    },

    footer: {
        display: "flex",
        gap: "15px",
        color: "#94a3b8",
        fontSize: "11px"
    },

    readButton: {
        border: "none",
        background: "transparent",
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: 600,
        whiteSpace: "nowrap"
    }
};