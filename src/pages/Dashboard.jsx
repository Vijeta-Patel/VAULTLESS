import React from "react";
import { useNavigate } from "react-router-dom";
import { useVaultless } from "../lib/VaultlessContext";

const FAKE_EMAILS = [
  {
    from: "Google Security",
    subject: "Your account was accessed from a new device",
    time: "2:14 PM",
    unread: true,
    preview: "We noticed a sign-in to your account from..."
  },
  {
    from: "GitHub",
    subject: "Your pull request was merged",
    time: "1:47 PM",
    unread: true,
    preview: "main ← feature/behavioural-auth · Merged by..."
  },
  {
    from: "Ethereum Foundation",
    subject: "EthDenver 2026 — Your proposal was accepted",
    time: "11:22 AM",
    unread: false,
    preview: "Congratulations! We are pleased to inform..."
  },
  {
    from: "Anthropic",
    subject: "Claude API — Monthly Usage Summary",
    time: "9:05 AM",
    unread: false,
    preview: "Here is your API usage summary for March..."
  },
  {
    from: "LinkedIn",
    subject: "14 people viewed your profile",
    time: "Yesterday",
    unread: false,
    preview: "You're getting noticed! Here are some people..."
  },
  {
    from: "Notion",
    subject: "Weekly digest — 3 updates in your workspace",
    time: "Yesterday",
    unread: false,
    preview: "Here's what happened this week in your..."
  },
  {
    from: "Stripe",
    subject: "Payment received: $2,400.00",
    time: "Mar 10",
    unread: false,
    preview: "A payment of $2,400.00 has been deposited..."
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    lastAuthScore,
    etherscanLinks,
    walletAddress,
    demoMode,
    clearEnrollment
  } = useVaultless();

  return (
    <div style={styles.root}>
      {/* --- GMAIL SIDEBAR --- */}
      <div style={styles.sidebar}>
        <div style={styles.gmailLogo}>
          <span style={{ color: "#4285F4" }}>G</span>
          <span style={{ color: "#EA4335" }}>m</span>
          <span style={{ color: "#FBBC05" }}>a</span>
          <span style={{ color: "#4285F4" }}>i</span>
          <span style={{ color: "#34A853" }}>l</span>
        </div>

        <button style={styles.composeBtn}>
          <span style={{ fontSize: 18 }}>+</span> Compose
        </button>

        {["Inbox", "Starred", "Sent", "Drafts", "Spam", "Trash"].map((label) => (
          <div
            key={label}
            style={{
              ...styles.navItem,
              ...(label === "Inbox" ? styles.navItemActive : {})
            }}
          >
            <span>{label}</span>
            {label === "Inbox" && <span style={styles.inboxCount}>7</span>}
          </div>
        ))}
      </div>

      {/* --- EMAIL LIST --- */}
      <div style={styles.emailList}>
        <div style={styles.emailListHeader}>
          <span style={styles.inboxTitle}>Inbox</span>
          <span style={styles.emailCount}>1–7 of 7</span>
        </div>

        {FAKE_EMAILS.map((email, i) => (
          <div
            key={i}
            style={{
              ...styles.emailRow,
              fontWeight: email.unread ? 600 : 400
            }}
          >
            <input type="checkbox" style={styles.checkbox} />
            <span style={styles.star}>☆</span>
            <div style={styles.emailFrom}>{email.from}</div>
            <div style={styles.emailBody}>
              <span style={styles.emailSubject}>{email.subject}</span>
              <span style={styles.emailPreview}> — {email.preview}</span>
            </div>
            <div style={styles.emailTime}>{email.time}</div>
          </div>
        ))}
      </div>

      {/* --- VAULTLESS SECURITY PANEL --- */}
      <div style={styles.securityPanel}>
        <div style={styles.panelHeader}>
          <span style={styles.panelLogo}>⬡</span>
          <span style={styles.panelTitle}>VAULTLESS</span>
        </div>

        <div style={styles.statusBadge}>
          <span style={styles.greenDot} />
          SESSION AUTHENTICATED
        </div>

        {lastAuthScore !== null && (
          <div style={styles.metric}>
            <div style={styles.metricLabel}>MATCH SCORE</div>
            <div style={styles.metricValue}>
              {(lastAuthScore * 100).toFixed(1)}%
            </div>
          </div>
        )}

        <div style={styles.metric}>
          <div style={styles.metricLabel}>WALLET</div>
          <div style={styles.metricValue}>
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "0xDEMO...1234"}
          </div>
        </div>

        <div style={styles.sectionLabel}>CHAIN EVENTS</div>

        <div style={styles.eventLog}>
          {etherscanLinks.length === 0 ? (
            <div style={styles.noEvents}>No events yet</div>
          ) : (
            etherscanLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                style={styles.eventLink}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ ...styles.greenDot, width: 6, height: 6 }} />
                  <span style={styles.eventLabel}>{link.label}</span>
                </div>
                <span style={styles.eventTime}>{link.timestamp || "1:42:12 AM"}</span>
              </a>
            ))
          )}
        </div>

        {/* --- FOOTER BUTTONS --- */}
        <div style={styles.panelFooter}>
          <button style={styles.logoutBtn} onClick={() => navigate("/")}>
            Sign Out
          </button>

          <button
            style={styles.reenrollBtn}
            onClick={() => {
              clearEnrollment();
              navigate("/enroll");
            }}
          >
            Re-enroll Identity
          </button>

          {demoMode && (
            <button
              style={styles.duressTestBtn}
              onClick={() => navigate("/auth")}
            >
              Test Duress →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    height: "100vh",
    fontFamily: "Roboto, sans-serif",
    background: "#f6f8fc",
    overflow: "hidden"
  },

  // --- Sidebar Styles ---
  sidebar: {
    width: 256,
    background: "#f6f8fc",
    padding: "12px 8px",
    borderRight: "1px solid #e0e0e0"
  },
  gmailLogo: {
    fontSize: 22,
    fontWeight: 700,
    padding: "8px 16px",
    marginBottom: 10
  },
  composeBtn: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 16,
    padding: "16px 24px",
    margin: "8px 12px 16px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#444",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    margin: "2px 8px",
    borderRadius: 24,
    fontSize: 14,
    cursor: "pointer",
    color: "#444"
  },
  navItemActive: {
    background: "#fce8e6",
    color: "#b3261e",
    fontWeight: 700
  },
  inboxCount: {
    background: "#b3261e",
    color: "#fff",
    fontSize: 11,
    padding: "2px 6px",
    borderRadius: 10
  },

  // --- Email List Styles ---
  emailList: {
    flex: 1,
    overflowY: "auto",
    background: "#fff"
  },
  emailListHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #f1f3f4",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1
  },
  inboxTitle: { fontSize: 20, fontWeight: 600, color: "#202124" },
  emailCount: { fontSize: 13, color: "#5f6368" },
  emailRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    borderBottom: "1px solid #f1f3f4",
    cursor: "pointer"
  },
  checkbox: { marginRight: 10 },
  star: { marginRight: 12, fontSize: 18, color: "#ccc" },
  emailFrom: { width: 180, fontSize: 14, color: "#202124" },
  emailBody: { flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontSize: 14 },
  emailSubject: { color: "#202124" },
  emailPreview: { color: "#5f6368" },
  emailTime: { width: 80, textAlign: "right", fontSize: 12, color: "#5f6368" },

  // --- SECURITY PANEL MODULES (Card Look) ---
  securityPanel: {
    width: 300,
    background: "#080808",
    padding: "24px 16px",
    color: "#fff",
    fontFamily: "'Courier New', monospace",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    borderLeft: "1px solid #1a1a1a",
    overflowY: "auto"
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
    paddingLeft: 4
  },
  panelLogo: { color: "#00ff88", fontSize: 22 },
  panelTitle: { color: "#00ff88", fontWeight: 700, fontSize: 14, letterSpacing: 3 },

  statusBadge: {
    background: "rgba(0, 255, 136, 0.04)",
    border: "1px solid rgba(0, 255, 136, 0.2)",
    borderRadius: 8,
    padding: "16px",
    color: "#00ff88",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "1.5px",
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  greenDot: { 
    width: 8, 
    height: 8, 
    background: "#00ff88", 
    borderRadius: "50%", 
    boxShadow: "0 0 10px rgba(0,255,136,0.5)" 
  },

  metric: {
    background: "#121212", 
    border: "1px solid #222",
    borderRadius: 12,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  metricLabel: {
    color: "#555",
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase"
  },
  metricValue: {
    color: "#00ff88",
    fontSize: "14px",
    
  },

  sectionLabel: {
    fontSize: "11px",
    color: "#444",
    letterSpacing: "2px",
    paddingLeft: 4,
    marginBottom: -8
  },

  eventLog: {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    borderRadius: 12,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minHeight: "80px"
  },
  noEvents: {
    color: "#fff",
    fontSize: "14px",
    opacity: 0.9
  },
  eventLink: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textDecoration: "none",
    fontSize: "13px"
  },
  eventLabel: { color: "#00ff88" },
  eventTime: { color: "#444", fontSize: "11px" },

  panelFooter: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingTop: 40
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #494848",
    color: "#e3dcdc",
    padding: "14px",
    fontSize: "11px",
    cursor: "pointer",
    borderRadius: 6,
    fontFamily: "inherit",
    letterSpacing: "1px"
  },
  reenrollBtn: {
    background: "transparent",
    border: "1px solid rgba(255, 68, 68, 0.4)",
    color: "#ff8888",
    padding: "14px",
    fontSize: "11px",
    cursor: "pointer",
    borderRadius: 6,
    fontFamily: "inherit",
    letterSpacing: "1px"
  },
  duressTestBtn: {
    background: "rgba(255, 170, 0, 0.05)",
    border: "1px solid #ffaa00",
    color: "#ffcc33",
    padding: "14px",
    fontSize: "11px",
    cursor: "pointer",
    borderRadius: 6,
    fontFamily: "inherit",
    fontWeight: "bold",
    letterSpacing: "1px"
  }
};