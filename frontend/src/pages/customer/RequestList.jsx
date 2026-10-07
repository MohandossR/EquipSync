import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../../services/api";

export default function RequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);

            const data = await apiService.getCustomerRequests();

            setRequests(data || []);
        } catch (error) {
            console.error("Unable to load requests:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                Loading your service requests...
            </div>
        );
    }

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        My Service Requests
                    </h1>

                    <p style={styles.subtitle}>
                        Track your equipment service requests.
                    </p>
                </div>

                <Link
                    to="/customer/create"
                    style={styles.createButton}
                >
                    + New Request
                </Link>
            </div>


            {requests.length === 0 ? (

                <div style={styles.empty}>
                    <div style={styles.emptyIcon}>
                        🔧
                    </div>

                    <h2>No service requests yet</h2>

                    <p>
                        Create your first service request to get started.
                    </p>

                    <Link
                        to="/customer/create"
                        style={styles.createButton}
                    >
                        Create Request
                    </Link>
                </div>

            ) : (

                <div style={styles.grid}>

                    {requests.map(request => (

                        <Link
                            key={request.id}
                            to={`/customer/request/${request.id}`}
                            style={styles.card}
                        >

                            <div style={styles.cardTop}>

                                <div>
                                    <div style={styles.requestCode}>
                                        {request.request_code}
                                    </div>

                                    <h2 style={styles.requestTitle}>
                                        {request.title}
                                    </h2>
                                </div>

                                <StatusBadge
                                    status={request.status}
                                />

                            </div>


                            <p style={styles.description}>
                                {request.description ||
                                    "No description provided."}
                            </p>


                            <div style={styles.details}>

                                <Detail
                                    icon="⚡"
                                    label="Priority"
                                    value={
                                        request.priority || "MEDIUM"
                                    }
                                />

                                <Detail
                                    icon="🔧"
                                    label="Machine"
                                    value={
                                        request.machine_id
                                    }
                                />

                                <Detail
                                    icon="📌"
                                    label="Status"
                                    value={
                                        request.status
                                    }
                                />

                            </div>


                            {request.sla_deadline && (

                                <div style={styles.sla}>
                                    ⏱️ SLA:
                                    {" "}
                                    {new Date(
                                        request.sla_deadline
                                    ).toLocaleString()}
                                </div>

                            )}


                            <div style={styles.view}>
                                Track Request →
                            </div>

                        </Link>

                    ))}

                </div>

            )}

        </div>
    );
}


function Detail({ icon, label, value }) {
    return (
        <div style={styles.detail}>
            <span>{icon}</span>

            <div>
                <div style={styles.detailLabel}>
                    {label}
                </div>

                <div style={styles.detailValue}>
                    {value}
                </div>
            </div>
        </div>
    );
}


function StatusBadge({ status }) {

    const stylesByStatus = {
        CREATED: ["#f1f5f9", "#475569"],
        VALIDATING: ["#eff6ff", "#1d4ed8"],
        PENDING_APPROVAL: ["#fff7ed", "#c2410c"],
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
        stylesByStatus[status] ||
        ["#f1f5f9", "#475569"];

    return (
        <span
            style={{
                ...styles.status,
                background,
                color
            }}
        >
            {status}
        </span>
    );
}


const styles = {

    page: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px",
        minHeight: "100vh",
        background: "#f8fafc"
    },

    loading: {
        padding: "60px",
        textAlign: "center",
        color: "#64748b"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
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

    createButton: {
        display: "inline-block",
        padding: "11px 16px",
        background: "#111827",
        color: "#ffffff",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: 700
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "16px"
    },

    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "20px",
        textDecoration: "none",
        color: "#0f172a",
        transition: "transform 0.15s ease"
    },

    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "10px"
    },

    requestCode: {
        color: "#2563eb",
        fontSize: "12px",
        fontWeight: 700
    },

    requestTitle: {
        margin: "5px 0 0",
        fontSize: "18px"
    },

    status: {
        padding: "6px 9px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: 700,
        whiteSpace: "nowrap"
    },

    description: {
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.5,
        marginTop: "15px"
    },

    details: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, 1fr)",
        gap: "10px",
        marginTop: "18px"
    },

    detail: {
        display: "flex",
        gap: "7px",
        alignItems: "center"
    },

    detailLabel: {
        color: "#94a3b8",
        fontSize: "10px"
    },

    detailValue: {
        fontSize: "12px",
        fontWeight: 600,
        marginTop: "2px"
    },

    sla: {
        marginTop: "15px",
        padding: "9px",
        borderRadius: "7px",
        background: "#fff7ed",
        color: "#c2410c",
        fontSize: "12px"
    },

    view: {
        marginTop: "18px",
        color: "#2563eb",
        fontSize: "13px",
        fontWeight: 700
    },

    empty: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "60px 20px",
        textAlign: "center",
        color: "#64748b"
    },

    emptyIcon: {
        fontSize: "45px"
    }
};