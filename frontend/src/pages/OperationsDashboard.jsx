import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiService } from "../services/api";
import RequestTable from "../components/RequestTable";


export default function OperationsDashboard() {
    const [summary, setSummary] = useState(null);
    const [slaData, setSlaData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Smart Dispatch
    const [smartRequestId, setSmartRequestId] = useState("");
    const [ranking, setRanking] = useState([]);
    const [rankingLoading, setRankingLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [smartMessage, setSmartMessage] = useState("");


    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {
        try {
            setLoading(true);

            const [summaryResult, slaResult] = await Promise.all([
                apiService.getDashboardSummary(),
                apiService.getDashboardSla()
            ]);

            setSummary(summaryResult);
            setSlaData(slaResult);

        } catch (error) {
            console.error("Dashboard loading error:", error);
        } finally {
            setLoading(false);
        }
    };


    // =========================
    // SMART TECHNICIAN RANKING
    // =========================

    const loadTechnicianRanking = async () => {
        if (!smartRequestId) {
            setSmartMessage("Enter a service request ID.");
            return;
        }

        try {
            setRankingLoading(true);
            setSmartMessage("");

            const data = await apiService.getTechnicianRanking(
                smartRequestId
            );

            setRanking(data.candidates || []);

            if (!data.candidates || data.candidates.length === 0) {
                setSmartMessage(
                    "No suitable technicians are currently available."
                );
            }

        } catch (error) {
            console.error("Ranking error:", error);

            setRanking([]);

            setSmartMessage(
                error.response?.data?.detail ||
                "Unable to find technicians."
            );

        } finally {
            setRankingLoading(false);
        }
    };


    // =========================
    // AI AUTO ASSIGN
    // =========================

    const autoAssignTechnician = async () => {
        if (!smartRequestId) {
            setSmartMessage("Enter a service request ID.");
            return;
        }

        try {
            setAssigning(true);
            setSmartMessage("");

            const result = await apiService.autoAssign(
                smartRequestId
            );

            const technicianName =
                result?.technician?.name || "technician";

            setSmartMessage(
                `✅ ${technicianName} was automatically assigned to request ${smartRequestId}.`
            );

            // Refresh ranking
            await loadTechnicianRanking();

            // Refresh dashboard numbers
            await loadDashboard();

        } catch (error) {
            console.error("Auto assignment error:", error);

            setSmartMessage(
                error.response?.data?.detail ||
                "Unable to auto-assign technician."
            );

        } finally {
            setAssigning(false);
        }
    };


    if (loading) {
        return (
            <div style={styles.loading}>
                Loading Operations Dashboard...
            </div>
        );
    }


    return (
        <div style={styles.page}>

            {/* =========================
                HEADER
            ========================= */}

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Operations Dashboard
                    </h1>

                    <p style={styles.subtitle}>
                        Monitor service operations, SLA performance
                        and technician dispatch.
                    </p>
                </div>

                <Link
                    to="/customer/create"
                    style={styles.primaryButton}
                >
                    + New Service Request
                </Link>
            </div>


            {/* =========================
                KPI CARDS
            ========================= */}

            <div style={styles.kpiGrid}>

                <KpiCard
                    title="Total Requests"
                    value={summary?.total_requests ?? 0}
                    icon="📋"
                />

                <KpiCard
                    title="Pending Approval"
                    value={summary?.pending_approval ?? 0}
                    icon="⏳"
                />

                <KpiCard
                    title="Active Jobs"
                    value={summary?.active_jobs ?? 0}
                    icon="🔧"
                />

                <KpiCard
                    title="SLA Breached"
                    value={summary?.sla_breached ?? 0}
                    icon="🚨"
                />

            </div>


            {/* =========================
                SLA OVERVIEW
            ========================= */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>
                    <div>
                        <h2 style={styles.sectionTitle}>
                            SLA Overview
                        </h2>

                        <p style={styles.sectionSubtitle}>
                            Current service-level performance
                        </p>
                    </div>
                </div>


                <div style={styles.slaGrid}>

                    <div style={styles.slaBox}>
                        <div style={styles.slaNumber}>
                            {slaData?.safe ?? 0}
                        </div>

                        <div style={styles.slaLabel}>
                            Safe
                        </div>
                    </div>


                    <div style={styles.slaBox}>
                        <div style={styles.slaNumber}>
                            {slaData?.at_risk ?? 0}
                        </div>

                        <div style={styles.slaLabel}>
                            At Risk
                        </div>
                    </div>


                    <div style={styles.slaBox}>
                        <div style={styles.slaNumber}>
                            {slaData?.breached ?? 0}
                        </div>

                        <div style={styles.slaLabel}>
                            Breached
                        </div>
                    </div>

                </div>

            </div>


            {/* =========================
                SMART DISPATCH
            ========================= */}

            <div style={styles.smartCard}>

                <div style={styles.smartHeader}>

                    <div>
                        <div style={styles.aiTitle}>
                            🤖 Smart Technician Dispatch
                        </div>

                        <p style={styles.smartDescription}>
                            EquipSync analyzes technician skill,
                            distance, availability and workload
                            to recommend the best technician.
                        </p>
                    </div>

                    <div style={styles.aiBadge}>
                        AI POWERED
                    </div>

                </div>


                {/* SEARCH */}

                <div style={styles.dispatchControls}>

                    <input
                        type="number"
                        min="1"
                        placeholder="Service Request ID"
                        value={smartRequestId}
                        onChange={(e) => {
                            setSmartRequestId(e.target.value);
                            setSmartMessage("");
                        }}
                        style={styles.input}
                    />


                    <button
                        onClick={loadTechnicianRanking}
                        disabled={rankingLoading}
                        style={styles.secondaryButton}
                    >
                        {rankingLoading
                            ? "Finding..."
                            : "🔎 Find Best Technician"}
                    </button>


                    <button
                        onClick={autoAssignTechnician}
                        disabled={
                            !smartRequestId ||
                            assigning
                        }
                        style={{
                            ...styles.autoAssignButton,
                            opacity:
                                !smartRequestId || assigning
                                    ? 0.6
                                    : 1
                        }}
                    >
                        {assigning
                            ? "Assigning..."
                            : "⚡ AI Auto Assign"}
                    </button>

                </div>


                {/* MESSAGE */}

                {smartMessage && (
                    <div style={styles.smartMessage}>
                        {smartMessage}
                    </div>
                )}


                {/* RANKING */}

                {ranking.length > 0 && (

                    <div style={styles.rankingContainer}>

                        <div style={styles.rankingHeader}>

                            <div>
                                <h3 style={styles.rankingTitle}>
                                    Technician Ranking
                                </h3>

                                <p style={styles.rankingSubtitle}>
                                    Ranked using explainable dispatch
                                    scoring.
                                </p>
                            </div>

                            <span style={styles.candidateCount}>
                                {ranking.length} candidates
                            </span>

                        </div>


                        {ranking.map((tech, index) => (

                            <div
                                key={tech.technician_id}
                                style={{
                                    ...styles.technicianCard,

                                    ...(index === 0
                                        ? styles.bestTechnician
                                        : {})
                                }}
                            >

                                {/* LEFT */}

                                <div style={styles.techIdentity}>

                                    <div style={styles.rank}>
                                        #{index + 1}
                                    </div>

                                    <div>

                                        <div style={styles.techName}>
                                            {tech.name}
                                        </div>

                                        <div style={styles.employeeCode}>
                                            {tech.employee_code}
                                        </div>

                                    </div>

                                    {index === 0 && (
                                        <span style={styles.recommendedBadge}>
                                            ⭐ AI RECOMMENDED
                                        </span>
                                    )}

                                </div>


                                {/* SCORE */}

                                <div style={styles.scoreBox}>

                                    <div style={styles.score}>
                                        {tech.total_score}
                                    </div>

                                    <div style={styles.scoreLabel}>
                                        SCORE
                                    </div>

                                </div>


                                {/* METRICS */}

                                <div style={styles.metrics}>

                                    <Metric
                                        icon="🎯"
                                        label="Skill"
                                        value={
                                            tech.skill_match
                                                ? "Match"
                                                : "No Match"
                                        }
                                    />

                                    <Metric
                                        icon="📍"
                                        label="Distance"
                                        value={`${tech.distance_km} km`}
                                    />

                                    <Metric
                                        icon="📊"
                                        label="Workload"
                                        value={tech.workload}
                                    />

                                    <Metric
                                        icon="🟢"
                                        label="Status"
                                        value={tech.availability}
                                    />

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* =========================
                REQUEST TABLE
            ========================= */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>

                    <div>
                        <h2 style={styles.sectionTitle}>
                            Service Requests
                        </h2>

                        <p style={styles.sectionSubtitle}>
                            Monitor and manage incoming service requests.
                        </p>
                    </div>

                    <Link
                        to="/customer/requests"
                        style={styles.viewAll}
                    >
                        View All →
                    </Link>

                </div>


                <RequestTable />

            </div>

        </div>
    );
}


/* =========================
   KPI CARD
========================= */

function KpiCard({ title, value, icon }) {
    return (
        <div style={styles.kpiCard}>

            <div style={styles.kpiIcon}>
                {icon}
            </div>

            <div>
                <div style={styles.kpiValue}>
                    {value}
                </div>

                <div style={styles.kpiTitle}>
                    {title}
                </div>
            </div>

        </div>
    );
}


/* =========================
   METRIC
========================= */

function Metric({ icon, label, value }) {
    return (
        <div style={styles.metric}>

            <span style={styles.metricIcon}>
                {icon}
            </span>

            <div>
                <div style={styles.metricLabel}>
                    {label}
                </div>

                <div style={styles.metricValue}>
                    {value}
                </div>
            </div>

        </div>
    );
}


/* =========================
   STYLES
========================= */

const styles = {

    page: {
        padding: "30px",
        maxWidth: "1500px",
        margin: "0 auto",
        background: "#f8fafc",
        minHeight: "100vh"
    },

    loading: {
        padding: "50px",
        textAlign: "center",
        fontSize: "18px"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
        gap: "20px"
    },

    title: {
        margin: 0,
        fontSize: "30px",
        fontWeight: 700
    },

    subtitle: {
        marginTop: "6px",
        color: "#64748b"
    },

    primaryButton: {
        background: "#111827",
        color: "#ffffff",
        padding: "12px 18px",
        borderRadius: "9px",
        textDecoration: "none",
        fontWeight: 600
    },

    kpiGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "18px",
        marginBottom: "22px"
    },

    kpiCard: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "15px"
    },

    kpiIcon: {
        fontSize: "28px"
    },

    kpiValue: {
        fontSize: "28px",
        fontWeight: 700
    },

    kpiTitle: {
        color: "#64748b",
        fontSize: "14px"
    },

    card: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "22px",
        marginBottom: "22px"
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },

    sectionTitle: {
        margin: 0,
        fontSize: "20px"
    },

    sectionSubtitle: {
        marginTop: "5px",
        color: "#64748b",
        fontSize: "14px"
    },

    slaGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "15px"
    },

    slaBox: {
        padding: "18px",
        borderRadius: "10px",
        background: "#f8fafc",
        textAlign: "center"
    },

    slaNumber: {
        fontSize: "28px",
        fontWeight: 700
    },

    slaLabel: {
        color: "#64748b",
        marginTop: "4px"
    },

    viewAll: {
        color: "#2563eb",
        textDecoration: "none",
        fontWeight: 600
    },

    /* SMART DISPATCH */

    smartCard: {
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "22px",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)"
    },

    smartHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        marginBottom: "20px"
    },

    aiTitle: {
        fontSize: "22px",
        fontWeight: 700
    },

    smartDescription: {
        color: "#64748b",
        maxWidth: "800px",
        lineHeight: 1.5
    },

    aiBadge: {
        padding: "7px 11px",
        borderRadius: "20px",
        background: "#ede9fe",
        color: "#6d28d9",
        fontSize: "11px",
        fontWeight: 700,
        whiteSpace: "nowrap"
    },

    dispatchControls: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "15px"
    },

    input: {
        padding: "11px 13px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        minWidth: "220px",
        fontSize: "14px"
    },

    secondaryButton: {
        padding: "11px 16px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        cursor: "pointer",
        fontWeight: 600
    },

    autoAssignButton: {
        padding: "11px 16px",
        borderRadius: "8px",
        border: "none",
        background: "#111827",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 700
    },

    smartMessage: {
        padding: "12px 15px",
        background: "#f1f5f9",
        borderRadius: "8px",
        marginBottom: "18px",
        color: "#334155"
    },

    rankingContainer: {
        marginTop: "20px"
    },

    rankingHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
    },

    rankingTitle: {
        margin: 0,
        fontSize: "18px"
    },

    rankingSubtitle: {
        margin: "4px 0 0",
        color: "#64748b",
        fontSize: "13px"
    },

    candidateCount: {
        fontSize: "13px",
        color: "#64748b"
    },

    technicianCard: {
        display: "grid",
        gridTemplateColumns:
            "minmax(260px, 1.4fr) 90px minmax(400px, 2fr)",
        alignItems: "center",
        gap: "20px",
        padding: "16px",
        marginBottom: "10px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        background: "#ffffff"
    },

    bestTechnician: {
        border: "2px solid #22c55e",
        background: "#f0fdf4"
    },

    techIdentity: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap"
    },

    rank: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700
    },

    techName: {
        fontWeight: 700,
        fontSize: "16px"
    },

    employeeCode: {
        color: "#64748b",
        fontSize: "12px",
        marginTop: "3px"
    },

    recommendedBadge: {
        background: "#16a34a",
        color: "#ffffff",
        padding: "5px 8px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: 700
    },

    scoreBox: {
        textAlign: "center"
    },

    score: {
        fontSize: "25px",
        fontWeight: 800
    },

    scoreLabel: {
        fontSize: "10px",
        color: "#64748b",
        fontWeight: 700
    },

    metrics: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "10px"
    },

    metric: {
        display: "flex",
        alignItems: "center",
        gap: "7px"
    },

    metricIcon: {
        fontSize: "16px"
    },

    metricLabel: {
        fontSize: "10px",
        color: "#64748b"
    },

    metricValue: {
        fontSize: "13px",
        fontWeight: 600,
        marginTop: "2px"
    }
};