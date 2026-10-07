import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiService } from "../../services/api";

export default function RequestDetail() {
    const { id } = useParams();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadRequest();
    }, [id]);

    const loadRequest = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiService.getJobDetail(id);

            setRequest(data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load service request."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                Loading service request...
            </div>
        );
    }

    if (error || !request) {
        return (
            <div style={styles.center}>
                <h2>Unable to load request</h2>
                <p>{error}</p>

                <Link to="/customer/requests">
                    ← Back to Requests
                </Link>
            </div>
        );
    }

    const status = request.status || "CREATED";

    return (
        <div style={styles.page}>

            {/* HEADER */}

            <div style={styles.header}>

                <div>
                    <Link
                        to="/customer/requests"
                        style={styles.back}
                    >
                        ← My Requests
                    </Link>

                    <div style={styles.code}>
                        {request.request_code}
                    </div>

                    <h1 style={styles.title}>
                        {request.title}
                    </h1>

                    <p style={styles.description}>
                        {request.description ||
                            "No description provided."}
                    </p>
                </div>

                <StatusBadge status={status} />

            </div>


            {/* REQUEST SUMMARY */}

            <div style={styles.grid}>

                <InfoCard
                    icon="⚡"
                    label="Priority"
                    value={request.priority || "MEDIUM"}
                />

                <InfoCard
                    icon="🔧"
                    label="Machine"
                    value={
                        request.machine_id ||
                        "Not assigned"
                    }
                />

                <InfoCard
                    icon="🛠️"
                    label="Required Skill"
                    value={
                        request.required_skill ||
                        "Not specified"
                    }
                />

                <InfoCard
                    icon="📅"
                    label="Created"
                    value={
                        request.created_at
                            ? new Date(
                                request.created_at
                            ).toLocaleString()
                            : "—"
                    }
                />

            </div>


            {/* SLA */}

            {request.sla_deadline && (

                <div style={styles.slaCard}>

                    <div style={styles.slaIcon}>
                        ⏱️
                    </div>

                    <div>
                        <strong>
                            SLA Deadline
                        </strong>

                        <div style={styles.slaTime}>
                            {new Date(
                                request.sla_deadline
                            ).toLocaleString()}
                        </div>
                    </div>

                </div>

            )}


            {/* STATUS TIMELINE */}

            <div style={styles.card}>

                <div style={styles.cardHeader}>
                    <div>
                        <h2 style={styles.cardTitle}>
                            Service Progress
                        </h2>

                        <p style={styles.cardSubtitle}>
                            Track your request through the service lifecycle.
                        </p>
                    </div>
                </div>

                <Timeline currentStatus={status} />

            </div>


            {/* TECHNICIAN */}

            {(status === "ASSIGNED" ||
                status === "ACCEPTED" ||
                status === "TRAVELLING" ||
                status === "IN_PROGRESS" ||
                status === "COMPLETED" ||
                status === "VERIFICATION_PENDING" ||
                status === "VERIFIED" ||
                status === "CLOSED") && (

                <div style={styles.card}>

                    <h2 style={styles.cardTitle}>
                        👨‍🔧 Assigned Technician
                    </h2>

                    <div style={styles.technicianCard}>

                        <div style={styles.avatar}>
                            👨‍🔧
                        </div>

                        <div>
                            <strong>
                                Technician Assigned
                            </strong>

                            <p style={styles.muted}>
                                Your service request has been
                                assigned to a technician.
                            </p>
                        </div>

                        <div style={styles.techStatus}>
                            {status === "ASSIGNED"
                                ? "Assigned"
                                : status === "ACCEPTED"
                                    ? "Accepted"
                                    : "Working"}
                        </div>

                    </div>

                </div>

            )}


            {/* VERIFICATION */}

            {(status === "VERIFICATION_PENDING" ||
                status === "VERIFIED" ||
                status === "CLOSED") && (

                <div style={styles.card}>

                    <h2 style={styles.cardTitle}>
                        ✅ Service Verification
                    </h2>

                    <div style={styles.verification}>

                        {status === "VERIFICATION_PENDING" && (
                            <>
                                <div style={styles.verifyIcon}>
                                    🔍
                                </div>

                                <div>
                                    <strong>
                                        Verification Pending
                                    </strong>

                                    <p style={styles.muted}>
                                        The technician has completed
                                        the service. Your request is
                                        awaiting verification.
                                    </p>
                                </div>
                            </>
                        )}

                        {status === "VERIFIED" && (
                            <>
                                <div style={styles.verifyIcon}>
                                    ✅
                                </div>

                                <div>
                                    <strong>
                                        Service Verified
                                    </strong>

                                    <p style={styles.muted}>
                                        The completed service has
                                        been verified successfully.
                                    </p>
                                </div>
                            </>
                        )}

                        {status === "CLOSED" && (
                            <>
                                <div style={styles.verifyIcon}>
                                    🎉
                                </div>

                                <div>
                                    <strong>
                                        Request Closed
                                    </strong>

                                    <p style={styles.muted}>
                                        This service request has
                                        been successfully completed.
                                    </p>
                                </div>
                            </>
                        )}

                    </div>

                </div>

            )}


            {/* REFRESH */}

            <button
                onClick={loadRequest}
                style={styles.refresh}
            >
                ↻ Refresh Status
            </button>

        </div>
    );
}


/* =========================
   TIMELINE
========================= */

function Timeline({ currentStatus }) {

    const statuses = [
        "CREATED",
        "APPROVED",
        "ASSIGNED",
        "ACCEPTED",
        "TRAVELLING",
        "IN_PROGRESS",
        "COMPLETED",
        "VERIFICATION_PENDING",
        "VERIFIED",
        "CLOSED"
    ];

    const currentIndex =
        statuses.indexOf(currentStatus);

    return (
        <div style={styles.timeline}>

            {statuses.map((status, index) => {

                const completed =
                    currentIndex >= 0 &&
                    index <= currentIndex;

                const current =
                    status === currentStatus;

                return (
                    <div
                        key={status}
                        style={styles.timelineItem}
                    >

                        <div
                            style={{
                                ...styles.timelineDot,

                                ...(completed
                                    ? styles.timelineCompleted
                                    : {}),

                                ...(current
                                    ? styles.timelineCurrent
                                    : {})
                            }}
                        >
                            {completed ? "✓" : ""}
                        </div>

                        <div
                            style={{
                                ...styles.timelineText,

                                ...(current
                                    ? styles.timelineCurrentText
                                    : {})
                            }}
                        >
                            {formatStatus(status)}
                        </div>

                        {index < statuses.length - 1 && (
                            <div
                                style={{
                                    ...styles.timelineLine,

                                    ...(currentIndex > index
                                        ? styles.timelineLineCompleted
                                        : {})
                                }}
                            />
                        )}

                    </div>
                );
            })}

        </div>
    );
}


function formatStatus(status) {
    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
}


/* =========================
   INFO CARD
========================= */

function InfoCard({ icon, label, value }) {
    return (
        <div style={styles.infoCard}>

            <div style={styles.infoIcon}>
                {icon}
            </div>

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


/* =========================
   STATUS BADGE
========================= */

function StatusBadge({ status }) {

    const map = {
        CREATED: ["#f1f5f9", "#475569"],
        APPROVED: ["#ecfdf5", "#047857"],
        ASSIGNED: ["#ede9fe", "#6d28d9"],
        ACCEPTED: ["#ecfdf5", "#047857"],
        TRAVELLING: ["#eff6ff", "#1d4ed8"],
        IN_PROGRESS: ["#dbeafe", "#1e40af"],
        COMPLETED: ["#f0fdf4", "#15803d"],
        VERIFICATION_PENDING: ["#fff7ed", "#c2410c"],
        VERIFIED: ["#ecfdf5", "#047857"],
        CLOSED: ["#f1f5f9", "#475569"],
        REASSIGNMENT_REQUIRED: ["#fef2f2", "#b91c1c"],
        SLA_BREACHED: ["#fef2f2", "#b91c1c"]
    };

    const [background, color] =
        map[status] || ["#f1f5f9", "#475569"];

    return (
        <span
            style={{
                ...styles.status,
                background,
                color
            }}
        >
            {formatStatus(status)}
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
        padding: "30px",
        minHeight: "100vh",
        background: "#f8fafc"
    },

    center: {
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        marginBottom: "25px"
    },

    back: {
        color: "#2563eb",
        textDecoration: "none",
        fontSize: "13px"
    },

    code: {
        color: "#2563eb",
        fontWeight: 700,
        fontSize: "12px",
        marginTop: "15px"
    },

    title: {
        fontSize: "30px",
        margin: "5px 0"
    },

    description: {
        color: "#64748b",
        maxWidth: "750px",
        lineHeight: 1.5
    },

    status: {
        padding: "8px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 700,
        whiteSpace: "nowrap"
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "14px",
        marginBottom: "20px"
    },

    infoCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "17px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    infoIcon: {
        fontSize: "22px"
    },

    infoLabel: {
        color: "#94a3b8",
        fontSize: "11px"
    },

    infoValue: {
        fontWeight: 600,
        fontSize: "13px",
        marginTop: "3px"
    },

    slaCard: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        borderRadius: "12px",
        padding: "15px",
        marginBottom: "20px",
        color: "#9a3412"
    },

    slaIcon: {
        fontSize: "25px"
    },

    slaTime: {
        marginTop: "4px",
        fontSize: "13px"
    },

    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "22px",
        marginBottom: "20px"
    },

    cardHeader: {
        marginBottom: "25px"
    },

    cardTitle: {
        margin: 0,
        fontSize: "20px"
    },

    cardSubtitle: {
        color: "#64748b",
        fontSize: "13px",
        marginTop: "5px"
    },

    timeline: {
        display: "flex",
        alignItems: "flex-start",
        overflowX: "auto",
        padding: "10px 0 15px"
    },

    timelineItem: {
        minWidth: "105px",
        position: "relative",
        textAlign: "center"
    },

    timelineDot: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        border: "2px solid #cbd5e1",
        background: "#ffffff",
        color: "#ffffff",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 700,
        position: "relative",
        zIndex: 2
    },

    timelineCompleted: {
        background: "#16a34a",
        borderColor: "#16a34a"
    },

    timelineCurrent: {
        boxShadow: "0 0 0 5px #dcfce7"
    },

    timelineText: {
        marginTop: "10px",
        fontSize: "10px",
        color: "#94a3b8",
        fontWeight: 500
    },

    timelineCurrentText: {
        color: "#15803d",
        fontWeight: 700
    },

    timelineLine: {
        position: "absolute",
        height: "2px",
        background: "#e2e8f0",
        width: "105px",
        top: "14px",
        left: "50%"
    },

    timelineLineCompleted: {
        background: "#16a34a"
    },

    technicianCard: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "15px",
        borderRadius: "10px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0"
    },

    avatar: {
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        background: "#e0e7ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px"
    },

    techStatus: {
        marginLeft: "auto",
        color: "#15803d",
        fontWeight: 700,
        fontSize: "13px"
    },

    muted: {
        color: "#64748b",
        fontSize: "13px",
        marginBottom: 0
    },

    verification: {
        display: "flex",
        gap: "15px",
        alignItems: "center",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "10px"
    },

    verifyIcon: {
        fontSize: "28px"
    },

    refresh: {
        padding: "10px 15px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 600
    }
};