import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function OperationsLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    return (
        <div style={styles.app}>

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside style={styles.sidebar}>

                {/* LOGO */}

                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}>
                        ⚙️
                    </div>

                    <div>
                        <div style={styles.logo}>
                            EquipSync
                        </div>

                        <div style={styles.logoSubtitle}>
                            Operations
                        </div>
                    </div>
                </div>


                {/* NAVIGATION */}

                <nav style={styles.nav}>

                    <div style={styles.navLabel}>
                        OPERATIONS
                    </div>


                    <Link
                        to="/"
                        style={{
                            ...styles.navItem,
                            ...(isActive("/")
                                ? styles.activeNavItem
                                : {})
                        }}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </Link>


                    <Link
                        to="/customer/create"
                        style={{
                            ...styles.navItem,
                            ...(isActive("/customer/create")
                                ? styles.activeNavItem
                                : {})
                        }}
                    >
                        <span>➕</span>
                        <span>New Request</span>
                    </Link>


                    <Link
                        to="/customer/requests"
                        style={{
                            ...styles.navItem,
                            ...(isActive("/customer/requests")
                                ? styles.activeNavItem
                                : {})
                        }}
                    >
                        <span>📋</span>
                        <span>My Requests</span>
                    </Link>


                    <div style={styles.navLabel}>
                        SMART TOOLS
                    </div>


                    <Link
                        to="/assistant"
                        style={{
                            ...styles.navItem,
                            ...(isActive("/assistant")
                                ? styles.activeNavItem
                                : {})
                        }}
                    >
                        <span>🤖</span>
                        <span>AI Assistant</span>
                    </Link>


                    <Link
                        to="/notifications"
                        style={{
                            ...styles.navItem,
                            ...(isActive("/notifications")
                                ? styles.activeNavItem
                                : {})
                        }}
                    >
                        <span>🔔</span>
                        <span>Notifications</span>
                    </Link>


                    <div style={styles.navLabel}>
                        TECHNICIAN
                    </div>


                    <Link
                        to="/technician"
                        style={{
                            ...styles.navItem,
                            ...(isActive("/technician")
                                ? styles.activeNavItem
                                : {})
                        }}
                    >
                        <span>🔧</span>
                        <span>Technician Hub</span>
                    </Link>

                </nav>


                {/* BOTTOM */}

                <div style={styles.bottomSection}>

                    <div style={styles.systemStatus}>
                        <span style={styles.statusDot}></span>

                        <div>
                            <div style={styles.statusText}>
                                System Online
                            </div>

                            <div style={styles.statusSubtext}>
                                EquipSync Services
                            </div>
                        </div>
                    </div>


                    <button
                        onClick={logout}
                        style={styles.logoutButton}
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN AREA
            ========================= */}

            <main style={styles.main}>

                {/* TOP BAR */}

                <header style={styles.topbar}>

                    <div>
                        <div style={styles.breadcrumb}>
                            EquipSync
                        </div>
                    </div>


                    <div style={styles.topActions}>

                        <Link
                            to="/notifications"
                            style={styles.topButton}
                            title="Notifications"
                        >
                            🔔
                        </Link>


                        <Link
                            to="/assistant"
                            style={styles.aiButton}
                            title="AI Assistant"
                        >
                            🤖 AI
                        </Link>

                    </div>

                </header>


                {/* PAGE CONTENT */}

                <div style={styles.content}>
                    <Outlet />
                </div>

            </main>

        </div>
    );
}


const styles = {

    app: {
        minHeight: "100vh",
        display: "flex",
        background: "#f8fafc",
        color: "#0f172a"
    },


    /* =========================
       SIDEBAR
    ========================= */

    sidebar: {
        width: "245px",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100
    },


    logoSection: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "22px 20px",
        borderBottom: "1px solid #1e293b"
    },


    logoIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px"
    },


    logo: {
        fontSize: "19px",
        fontWeight: 800
    },


    logoSubtitle: {
        color: "#94a3b8",
        fontSize: "11px",
        marginTop: "2px"
    },


    /* =========================
       NAV
    ========================= */

    nav: {
        padding: "20px 12px",
        flex: 1,
        overflowY: "auto"
    },


    navLabel: {
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        letterSpacing: "1px",
        padding: "10px 12px 7px",
        marginTop: "5px"
    },


    navItem: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "11px 12px",
        marginBottom: "4px",
        borderRadius: "8px",
        color: "#cbd5e1",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 500,
        transition: "all 0.15s ease"
    },


    activeNavItem: {
        background: "#1d4ed8",
        color: "#ffffff",
        fontWeight: 700
    },


    /* =========================
       BOTTOM
    ========================= */

    bottomSection: {
        padding: "14px",
        borderTop: "1px solid #1e293b"
    },


    systemStatus: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        marginBottom: "10px"
    },


    statusDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#22c55e",
        display: "block"
    },


    statusText: {
        fontSize: "12px",
        fontWeight: 600
    },


    statusSubtext: {
        color: "#64748b",
        fontSize: "10px",
        marginTop: "2px"
    },


    logoutButton: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #334155",
        background: "transparent",
        color: "#cbd5e1",
        cursor: "pointer",
        fontSize: "13px"
    },


    /* =========================
       MAIN
    ========================= */

    main: {
        marginLeft: "245px",
        width: "calc(100% - 245px)",
        minHeight: "100vh"
    },


    topbar: {
        height: "62px",
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 25px",
        position: "sticky",
        top: 0,
        zIndex: 50
    },


    breadcrumb: {
        color: "#64748b",
        fontSize: "13px"
    },


    topActions: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },


    topButton: {
        width: "38px",
        height: "38px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        fontSize: "17px"
    },


    aiButton: {
        padding: "8px 12px",
        borderRadius: "8px",
        background: "#111827",
        color: "#ffffff",
        textDecoration: "none",
        fontSize: "12px",
        fontWeight: 700
    },


    content: {
        minHeight: "calc(100vh - 62px)"
    }
};