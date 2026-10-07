import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";

export default function TechnicianDashboard() {
    const navigate = useNavigate();
    const [previousJobCount, setPreviousJobCount] = useState(0);

    const [jobs, setJobs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    useEffect(() => {
    if ("Notification" in window) {
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }
    }
}, []);
    useEffect(() => {
    loadData();

    const interval = setInterval(() => {
        loadData();
    }, 15000);

    return () => clearInterval(interval);
}, []);

    const loadData = async () => {
    try {
        setLoading(true);

        const [jobsData, notificationData] = await Promise.all([
            apiService.getAssignedJobs(),
            apiService.getNotifications()
        ]);

        const newJobs = jobsData || [];

        if (
            previousJobCount > 0 &&
            newJobs.length > previousJobCount &&
            "Notification" in window
        ) {
            if (Notification.permission === "granted") {
                new Notification(
                    "EquipSync — New Assignment",
                    {
                        body: "You have received a new service assignment.",
                        icon: "/favicon.ico"
                    }
                );
            }
        }

        setPreviousJobCount(newJobs.length);
        setJobs(newJobs);
        setNotifications(notificationData || []);

    } catch (error) {
        console.error("Technician dashboard error:", error);
    } finally {
        setLoading(false);
    }
};

    const acceptJob = async (assignmentId) => {
        try {
            setActionLoading(assignmentId);

            await apiService.acceptAssignment(assignmentId);

            await loadData();
        } catch (error) {
            alert(
                error.response?.data?.detail ||
                "Unable to accept assignment."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const rejectJob = async (assignmentId) => {
        try {
            setActionLoading(assignmentId);

            await apiService.rejectAssignment(
                assignmentId,
                rejectReason || "Technician rejected the assignment"
            );

            setRejectingId(null);
            setRejectReason("");

            await loadData();
        } catch (error) {
            alert(
                error.response?.data?.detail ||
                "Unable to reject assignment."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const unreadCount = notifications.filter(
        n => !n.is_read
    ).length;

    if (loading) {
        return (
            <div style={styles.loading}>
                Loading technician dashboard...
            </div>
        );
    }

    return (
        <div style={styles.page}>

            {/* HEADER */}

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Technician Hub
                    </h1>

                    <p style={styles.subtitle}>
                        Manage assignments, jobs and service activity.
                    </p>
                </div>

                <button
                    style={styles.notificationButton}
                    onClick={() => navigate("/notifications")}
                >
                    🔔
                    {unreadCount > 0 && (
                        <span style={styles.notificationBadge}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>


            {/* QUICK STATS */}

            <div style={styles.statsGrid}>

                <Stat
                    label="My Jobs"
                    value={jobs.length}
                    icon="🔧"
                />

                <Stat
                    label="New Assignments"
                    value={
                        jobs.filter(
                            j => j.status === "ASSIGNED"
                        ).length
                    }
                    icon="📥"
                />

                <Stat
                    label="Accepted"
                    value={
                        jobs.filter(
                            j => j.status === "ACCEPTED"
                        ).length
                    }
                    icon="✅"
                />

                <Stat
                    label="Notifications"
                    value={unreadCount}
                    icon="🔔"
                />

            </div>


            {/* JOBS */}

            <div style={styles.section}>

                <div style={styles.sectionHeader}>
                    <div>
                        <h2>My Assignments</h2>
                        <p>
                            Accept or reject incoming service jobs.
                        </p>
                    </div>

                    <button
                        style={styles.refreshButton}
                        onClick={loadData}
                    >
                        ↻ Refresh
                    </button>
                </div>


                {jobs.length === 0 ? (

                    <div style={styles.empty}>
                        <div style={styles.emptyIcon}>
                            🧰
                        </div>

                        <h3>No active assignments</h3>

                        <p>
                            New technician assignments will appear here.
                        </p>
                    </div>

                ) : (

                    <div style={styles.jobs}>

                        {jobs.map((job) => (

                            <div
                                key={job.id}
                                style={styles.jobCard}
                            >

                                {/* JOB HEADER */}

                                <div style={styles.jobHeader}>

                                    <div>
                                        <div style={styles.requestCode}>
                                            {job.request_code ||
                                                `Request #${job.service_request_id}`}
                                        </div>

                                        <h3 style={styles.jobTitle}>
                                            {job.title ||
                                                "Service Request"}
                                        </h3>
                                    </div>

                                    <StatusBadge
                                        status={job.status}
                                    />

                                </div>


                                {/* JOB INFO */}

                                <div style={styles.infoGrid}>

                                    <Info
                                        label="Priority"
                                        value={
                                            job.priority || "MEDIUM"
                                        }
                                        icon="⚡"
                                    />

                                    <Info
                                        label="Assignment"
                                        value={job.status}
                                        icon="📌"
                                    />

                                    <Info
                                        label="Request"
                                        value={
                                            job.service_request_id
                                        }
                                        icon="🆔"
                                    />

                                </div>


                                {/* ACTIONS */}

                                <div style={styles.actions}>

                                    <button
                                        style={styles.detailsButton}
                                        onClick={() =>
                                            navigate(
                                                `/technician/job/${job.service_request_id}`
                                            )
                                        }
                                    >
                                        View Details
                                    </button>


                                    {job.status === "ASSIGNED" && (

                                        <>
                                            <button
                                                style={styles.acceptButton}
                                                disabled={
                                                    actionLoading === job.id
                                                }
                                                onClick={() =>
                                                    acceptJob(job.id)
                                                }
                                            >
                                                {actionLoading === job.id
                                                    ? "Processing..."
                                                    : "✓ Accept Job"}
                                            </button>

                                            <button
                                                style={styles.rejectButton}
                                                disabled={
                                                    actionLoading === job.id
                                                }
                                                onClick={() => {
                                                    setRejectingId(job.id);
                                                    setRejectReason("");
                                                }}
                                            >
                                                ✕ Reject
                                            </button>
                                        </>

                                    )}

                                </div>


                                {/* REJECTION PANEL */}

                                {rejectingId === job.id && (

                                    <div style={styles.rejectPanel}>

                                        <strong>
                                            Why are you rejecting this job?
                                        </strong>

                                        <textarea
                                            value={rejectReason}
                                            onChange={e =>
                                                setRejectReason(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter reason..."
                                            rows={3}
                                            style={styles.textarea}
                                        />

                                        <div style={styles.rejectActions}>

                                            <button
                                                style={styles.cancelButton}
                                                onClick={() => {
                                                    setRejectingId(null);
                                                    setRejectReason("");
                                                }}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                style={styles.confirmReject}
                                                onClick={() =>
                                                    rejectJob(job.id)
                                                }
                                            >
                                                Confirm Rejection
                                            </button>

                                        </div>

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* NOTIFICATIONS */}

            <div style={styles.section}>

                <div style={styles.sectionHeader}>

                    <div>
                        <h2>Recent Notifications</h2>

                        <p>
                            Latest updates from operations.
                        </p>
                    </div>

                    <button
                        style={styles.refreshButton}
                        onClick={() =>
                            navigate("/notifications")
                        }
                    >
                        View All →
                    </button>

                </div>


                {notifications.length === 0 ? (

                    <p style={styles.muted}>
                        No notifications yet.
                    </p>

                ) : (

                    notifications.slice(0, 5).map(notification => (

                        <div
                            key={notification.id}
                            style={{
                                ...styles.notificationRow,
                                background:
                                    notification.is_read
                                        ? "#ffffff"
                                        : "#f0f9ff"
                            }}
                        >

                            <div style={styles.notificationIcon}>
                                {notification.is_read
                                    ? "🔔"
                                    : "🔵"}
                            </div>

                            <div>

                                <strong>
                                    {notification.title}
                                </strong>

                                <p style={styles.notificationText}>
                                    {notification.message}
                                </p>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
}


/* =========================
   COMPONENTS
========================= */

function Stat({ label, value, icon }) {
    return (
        <div style={styles.statCard}>

            <div style={styles.statIcon}>
                {icon}
            </div>

            <div>
                <div style={styles.statValue}>
                    {value}
                </div>

                <div style={styles.statLabel}>
                    {label}
                </div>
            </div>

        </div>
    );
}


function Info({ label, value, icon }) {
    return (
        <div style={styles.info}>
            <span>{icon}</span>

            <div>
                <div style={styles.infoLabel}>
                    {label}
                </div>

                <div style={styles.infoValue}>
                    {value}
                </div>
            </div>
        </div>
    );
}


function StatusBadge({ status }) {

    const colors = {
        ASSIGNED: {
            background: "#fff7ed",
            color: "#c2410c"
        },

        ACCEPTED: {
            background: "#ecfdf5",
            color: "#047857"
        },

        IN_PROGRESS: {
            background: "#eff6ff",
            color: "#1d4ed8"
        },

        COMPLETED: {
            background: "#f0fdf4",
            color: "#15803d"
        }
    };

    const color =
        colors[status] || {
            background: "#f1f5f9",
            color: "#475569"
        };

    return (
        <span
            style={{
                ...styles.status,
                background: color.background,
                color: color.color
            }}
        >
            {status}
        </span>
    );
}


/* =========================
   STYLES
========================= */

const styles = {

    page: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        minHeight: "100vh",
        background: "#f8fafc"
    },

    loading: {
        padding: "60px",
        textAlign: "center",
        fontSize: "18px"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px"
    },

    title: {
        margin: 0,
        fontSize: "28px"
    },

    subtitle: {
        color: "#64748b",
        marginTop: "6px"
    },

    notificationButton: {
        position: "relative",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "20px",
        cursor: "pointer"
    },

    notificationBadge: {
        position: "absolute",
        top: "-6px",
        right: "-6px",
        background: "#dc2626",
        color: "#ffffff",
        borderRadius: "50%",
        minWidth: "20px",
        height: "20px",
        fontSize: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "14px",
        marginBottom: "25px"
    },

    statCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "18px",
        display: "flex",
        gap: "12px",
        alignItems: "center"
    },

    statIcon: {
        fontSize: "24px"
    },

    statValue: {
        fontSize: "25px",
        fontWeight: 700
    },

    statLabel: {
        color: "#64748b",
        fontSize: "13px"
    },

    section: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "20px",
        marginBottom: "22px"
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px"
    },


    refreshButton: {
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        borderRadius: "8px",
        padding: "9px 13px",
        cursor: "pointer"
    },

    jobs: {
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },

    jobCard: {
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "18px"
    },

    jobHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px"
    },

    requestCode: {
        color: "#2563eb",
        fontSize: "12px",
        fontWeight: 700
    },

    jobTitle: {
        margin: "5px 0 0",
        fontSize: "18px"
    },

    status: {
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 700
    },

    infoGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, 1fr)",
        gap: "12px",
        marginTop: "18px"
    },

    info: {
        display: "flex",
        gap: "8px",
        alignItems: "center"
    },

    infoLabel: {
        fontSize: "11px",
        color: "#64748b"
    },

    infoValue: {
        fontSize: "13px",
        fontWeight: 600,
        marginTop: "2px"
    },

    actions: {
        display: "flex",
        gap: "9px",
        flexWrap: "wrap",
        marginTop: "18px"
    },

    detailsButton: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        cursor: "pointer"
    },

    acceptButton: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        background: "#16a34a",
        color: "#ffffff",
        fontWeight: 700,
        cursor: "pointer"
    },

    rejectButton: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #fecaca",
        background: "#fff1f2",
        color: "#dc2626",
        fontWeight: 600,
        cursor: "pointer"
    },

    rejectPanel: {
        marginTop: "15px",
        padding: "15px",
        borderRadius: "10px",
        background: "#fff7ed",
        border: "1px solid #fed7aa"
    },

    textarea: {
        width: "100%",
        boxSizing: "border-box",
        marginTop: "10px",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        resize: "vertical"
    },

    rejectActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
        marginTop: "10px"
    },

    cancelButton: {
        padding: "9px 13px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        borderRadius: "7px"
    },

    confirmReject: {
        padding: "9px 13px",
        border: "none",
        background: "#dc2626",
        color: "#ffffff",
        borderRadius: "7px",
        fontWeight: 600
    },

    empty: {
        textAlign: "center",
        padding: "50px 20px",
        color: "#64748b"
    },

    emptyIcon: {
        fontSize: "40px"
    },

    muted: {
        color: "#64748b"
    },

    notificationRow: {
        display: "flex",
        gap: "12px",
        padding: "13px",
        borderRadius: "8px",
        marginBottom: "8px"
    },

    notificationIcon: {
        fontSize: "18px"
    },

    notificationText: {
        margin: "4px 0 0",
        color: "#64748b",
        fontSize: "13px"
    }
};