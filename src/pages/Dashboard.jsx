import { useNavigate } from 'react-router-dom';
import { useVaultless } from '../lib/VaultlessContext';
import { useState } from 'react';
import { useViewport } from '../hooks/useViewport';

const FAKE_EMAILS = [
  { from: 'Google Security', subject: 'Your account was accessed from a new device', time: '2:14 PM', unread: true, preview: 'We noticed a sign-in to your account from a new location...', avatar: 'G', avatarBg: '#4285F4' },
  { from: 'GitHub', subject: 'Your pull request was merged', time: '1:47 PM', unread: true, preview: 'main ← feature/behavioural-auth · Merged by collaborator...', avatar: 'GH', avatarBg: '#24292e' },
  { from: 'Ethereum Foundation', subject: 'EthDenver 2026 — Your proposal was accepted', time: '11:22 AM', unread: false, preview: 'Congratulations! We are pleased to inform you that...', avatar: 'E', avatarBg: '#627EEA' },
  { from: 'Anthropic', subject: 'Claude API — Monthly Usage Summary', time: '9:05 AM', unread: false, preview: 'Here is your API usage summary for March 2026...', avatar: 'A', avatarBg: '#cc785c' },
  { from: 'LinkedIn', subject: '14 people viewed your profile', time: 'Yesterday', unread: false, preview: "You're getting noticed! Here are some people who viewed...", avatar: 'in', avatarBg: '#0A66C2' },
  { from: 'Notion', subject: 'Weekly digest — 3 updates in your workspace', time: 'Yesterday', unread: false, preview: "Here's what happened this week in your workspace...", avatar: 'N', avatarBg: '#000' },
  { from: 'Stripe', subject: 'Payment received: $2,400.00', time: 'Mar 10', unread: false, preview: 'A payment of $2,400.00 has been deposited to your account...', avatar: 'S', avatarBg: '#635BFF' },
];

const NAV_ITEMS = [
  { label: 'Inbox', icon: '📥', count: 7 },
  { label: 'Starred', icon: '⭐' },
  { label: 'Snoozed', icon: '🕐' },
  { label: 'Sent', icon: '📤' },
  { label: 'Drafts', icon: '📝', count: 3 },
  { label: 'More', icon: '⌄' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { lastAuthScore, etherscanLinks, walletAddress, demoMode, clearEnrollment } = useVaultless();
  const { isMobile, isTablet } = useViewport();
  const [activeNav, setActiveNav] = useState('Inbox');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const compactLayout = isMobile || isTablet;
  const ui = {
    root: compactLayout ? { ...s.root, height: 'auto', minHeight: '100vh', overflow: 'visible' } : s.root,
    topbar: compactLayout ? { ...s.topbar, height: 'auto', padding: '10px 12px', flexWrap: 'wrap', gap: 10 } : s.topbar,
    topLeft: compactLayout ? { ...s.topLeft, minWidth: 0, flex: '1 1 auto' } : s.topLeft,
    searchWrap: compactLayout ? { ...s.searchWrap, order: 3, width: '100%', maxWidth: '100%', minWidth: 0 } : s.searchWrap,
    topRight: compactLayout ? { ...s.topRight, marginLeft: 0, gap: 2 } : s.topRight,
    body: compactLayout ? { ...s.body, flexDirection: 'column', overflow: 'visible', gap: 8, padding: '0 8px 12px' } : s.body,
    sidebar: compactLayout ? { ...s.sidebar, width: '100%', padding: '8px 0 0', overflow: 'visible' } : s.sidebar,
    composeBtn: isMobile ? { ...s.composeBtn, width: '100%', justifyContent: 'center', margin: '8px 0 12px', padding: '14px 18px' } : s.composeBtn,
    nav: compactLayout ? { ...s.nav, flexDirection: 'row', overflowX: 'auto', paddingBottom: 4 } : s.nav,
    navItem: compactLayout ? { ...s.navItem, marginRight: 8, borderRadius: 18, padding: '0 14px', whiteSpace: 'nowrap', flexShrink: 0 } : s.navItem,
    labelsHeader: compactLayout ? { ...s.labelsHeader, padding: '8px 0' } : s.labelsHeader,
    labelItem: compactLayout ? { ...s.labelItem, padding: '4px 0' } : s.labelItem,
    emailPane: compactLayout ? { ...s.emailPane, borderRadius: 16, borderRight: '1px solid #e0e0e0', margin: 0, minHeight: 0 } : s.emailPane,
    emailToolbar: isMobile ? { ...s.emailToolbar, padding: '8px 10px' } : s.emailToolbar,
    tabBar: compactLayout ? { ...s.tabBar, overflowX: 'auto' } : s.tabBar,
    tab: isMobile ? { ...s.tab, padding: '12px 14px', whiteSpace: 'nowrap', flexShrink: 0 } : s.tab,
    emailRow: isMobile ? { ...s.emailRow, display: 'grid', gridTemplateColumns: '92px minmax(0, 1fr)', alignItems: 'start', height: 'auto', padding: '12px', gap: 0, rowGap: 4, columnGap: 8 } : s.emailRow,
    emailRowLeft: isMobile ? { ...s.emailRowLeft, width: 84, paddingTop: 2, gap: 6, gridColumn: '1', gridRow: '1 / span 3', alignSelf: 'start', justifyContent: 'flex-start' } : s.emailRowLeft,
    emailFrom: isMobile ? { ...s.emailFrom, width: 'auto', fontSize: 12, gridColumn: '2', marginBottom: 2 } : s.emailFrom,
    emailBody: isMobile ? { ...s.emailBody, minWidth: 0, whiteSpace: 'normal', lineHeight: 1.35, gridColumn: '2', marginBottom: 2 } : s.emailBody,
    emailTime: isMobile ? { ...s.emailTime, fontSize: 11, textAlign: 'left', gridColumn: '2', color: '#6f7277' } : s.emailTime,
    securityPanel: compactLayout ? { ...s.securityPanel, width: '100%', borderRadius: 16, margin: 0, maxHeight: 'none', padding: isMobile ? '18px 16px' : s.securityPanel.padding } : s.securityPanel,
    metric: isMobile ? { ...s.metric, padding: '10px 12px' } : s.metric,
    eventLog: isMobile ? { ...s.eventLog, padding: 10 } : s.eventLog,
    panelFooter: isMobile ? { ...s.panelFooter, gap: 10 } : s.panelFooter,
    profileMenu: isMobile ? { ...s.profileMenu, width: 240, right: -8 } : s.profileMenu,
  };

  return (
    <div style={ui.root}>

      {/* ── TOP BAR ── */}
      <div style={ui.topbar}>
        {/* Left: hamburger + Gmail logo */}
        <div style={ui.topLeft}>
          <button style={s.iconBtn}>☰</button>
          <div style={s.gmailLogo}>
            <span style={{ color: '#4285F4' }}>G</span>
            <span style={{ color: '#EA4335' }}>m</span>
            <span style={{ color: '#FBBC05' }}>a</span>
            <span style={{ color: '#4285F4' }}>i</span>
            <span style={{ color: '#34A853' }}>l</span>
          </div>
        </div>

        {/* Center: search bar */}
        <div style={{ ...ui.searchWrap, ...(searchFocused ? s.searchWrapFocused : {}) }}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Search mail"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <button style={s.searchFilter}>⚙</button>
        </div>

        {/* Right: icons + avatar */}
        <div style={ui.topRight}>
          <button style={s.iconBtn} title="Help">?</button>
          <button style={s.iconBtn} title="Settings">⚙</button>
          <button style={s.iconBtn} title="Google apps">⊞</button>
          <div style={s.avatarWrap} onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div style={s.avatar}>H</div>
            {showProfileMenu && (
              <div style={ui.profileMenu}>
                <div style={s.profileMenuHeader}>
                  <div style={s.profileMenuAvatar}>H</div>
                  <div>
                    <div style={s.profileMenuName}>Harit Mehta</div>
                    <div style={s.profileMenuEmail}>harittm3@gmail.com</div>
                  </div>
                </div>
                <div style={s.profileMenuDivider} />
                <div style={s.profileMenuItem}>Manage your Google Account</div>
                <div style={s.profileMenuDivider} />
                <div style={s.profileMenuItem} onClick={() => navigate('/gmail')}>Sign out</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={ui.body}>

        {/* ── SIDEBAR ── */}
        <div style={ui.sidebar}>
          <button style={ui.composeBtn}>
            <span style={s.composePlus}>+</span>
            <span>Compose</span>
          </button>
          <nav style={ui.nav}>
            {NAV_ITEMS.map(item => (
              <div
                key={item.label}
                style={{ ...ui.navItem, ...(activeNav === item.label ? s.navItemActive : {}) }}
                onClick={() => setActiveNav(item.label)}
              >
                <span style={s.navIcon}>{item.icon}</span>
                <span style={s.navLabel}>{item.label}</span>
                {item.count && <span style={s.navCount}>{item.count}</span>}
              </div>
            ))}
          </nav>

          <div style={s.sidebarDivider} />
          <div style={ui.labelsHeader}>Labels</div>
          {['VAULTLESS', 'Blockchain', 'Work'].map(l => (
            <div key={l} style={ui.labelItem}>
              <span style={s.labelDot} />
              {l}
            </div>
          ))}
        </div>

        {/* ── EMAIL LIST ── */}
        <div style={ui.emailPane}>
          {/* Toolbar */}
          <div style={ui.emailToolbar}>
            <div style={s.toolbarLeft}>
              <input type="checkbox" style={s.checkbox} />
              <button style={s.toolbarBtn}>↻</button>
              <button style={s.toolbarBtn}>⋮</button>
            </div>
            <div style={s.toolbarRight}>
              <span style={s.emailCount}>1–7 of 7</span>
              <button style={s.toolbarBtn}>‹</button>
              <button style={s.toolbarBtn}>›</button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={ui.tabBar}>
            {['Primary', 'Promotions', 'Social', 'Updates'].map((tab, i) => (
              <div key={tab} style={{ ...ui.tab, ...(i === 0 ? s.tabActive : {}) }}>
                {tab}
              </div>
            ))}
          </div>

          {/* Email rows */}
          {FAKE_EMAILS.map((email, i) => (
            <div
              key={i}
              style={{
                ...s.emailRow,
                ...ui.emailRow,
                background: hoveredRow === i ? '#f2f6fc' : email.unread ? '#fff' : '#f6f8fc',
                fontWeight: email.unread ? 600 : 400,
              }}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div style={ui.emailRowLeft}>
                <input type="checkbox" style={s.checkbox} onClick={e => e.stopPropagation()} />
                <span style={s.starBtn}>☆</span>
                <div style={{ ...s.emailAvatar, background: email.avatarBg }}>
                  {email.avatar}
                </div>
              </div>
              <div style={ui.emailFrom}>{email.from}</div>
              <div style={ui.emailBody}>
                <span style={s.emailSubject}>{email.subject}</span>
                <span style={s.emailPreview}> — {email.preview}</span>
              </div>
              <div style={ui.emailTime}>{email.time}</div>
            </div>
          ))}
        </div>

        {/* ── VAULTLESS PANEL ── */}
        <div style={ui.securityPanel}>
          <div style={s.panelHeader}>
            <span style={s.panelLogo}>⬡</span>
            <span style={s.panelTitle}>VAULTLESS</span>
          </div>

          <div style={s.statusBadge}>
            <span style={s.greenDot} />
            SESSION AUTHENTICATED
          </div>

          {lastAuthScore !== null && (
            <div style={ui.metric}>
              <div style={s.metricLabel}>MATCH SCORE</div>
              <div style={s.metricValue}>{(lastAuthScore * 100).toFixed(1)}%</div>
            </div>
          )}

          {walletAddress && (
            <div style={ui.metric}>
              <div style={s.metricLabel}>WALLET</div>
              <div style={{ ...s.metricValue, fontSize: 10, wordBreak: 'break-all' }}>
                {walletAddress.slice(0, 20)}...
              </div>
            </div>
          )}

          <div style={s.metricLabel}>CHAIN EVENTS</div>
          <div style={ui.eventLog}>
            {etherscanLinks.length === 0 ? (
              <div style={s.noEvents}>No events yet</div>
            ) : (
              etherscanLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" style={s.eventLink}>
                  <span style={s.eventDot} />
                  <span style={s.eventLabel}>{link.label}</span>
                  <span style={s.eventTime}>{link.timestamp}</span>
                </a>
              ))
            )}
          </div>

          <div style={ui.panelFooter}>
            <button style={s.logoutBtn} onClick={() => navigate('/gmail')}>Sign Out</button>
            {demoMode && (
              <button style={s.reenrollBtn} onClick={() => { clearEnrollment(); navigate('/enroll'); }}>
                Re-enroll Identity
              </button>
            )}
            {demoMode && (
              <button style={s.duressTestBtn} onClick={() => navigate('/auth')}>
                Test Duress →
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
    background: '#f6f8fc',
    overflow: 'hidden',
  },

  // ── TOPBAR ──
  topbar: {
    display: 'flex',
    alignItems: 'center',
    height: 64,
    padding: '0 8px',
    background: '#f6f8fc',
    borderBottom: '1px solid #e0e0e0',
    gap: 8,
    flexShrink: 0,
    position: 'relative',
    zIndex: 10,
  },
  topLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 220,
  },
  gmailLogo: {
    fontSize: 22,
    fontWeight: 400,
    letterSpacing: -0.5,
    userSelect: 'none',
    padding: '0 8px',
  },
  searchWrap: {
    flex: 1,
    maxWidth: 720,
    display: 'flex',
    alignItems: 'center',
    background: '#eaf1fb',
    borderRadius: 24,
    padding: '0 8px 0 16px',
    height: 46,
    gap: 8,
    transition: 'box-shadow 0.2s, background 0.2s',
  },
  searchWrapFocused: {
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  searchIcon: { fontSize: 16, opacity: 0.6 },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: 16,
    outline: 'none',
    color: '#202124',
  },
  searchFilter: {
    background: 'transparent',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    color: '#5f6368',
    padding: '4px 8px',
    borderRadius: '50%',
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  iconBtn: {
    width: 40,
    height: 40,
    border: 'none',
    background: 'transparent',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 16,
    color: '#5f6368',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginLeft: 8,
    cursor: 'pointer',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#1a73e8',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 500,
    userSelect: 'none',
  },
  profileMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 280,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    zIndex: 100,
  },
  profileMenuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px',
  },
  profileMenuAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#1a73e8',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 500,
    flexShrink: 0,
  },
  profileMenuName: { fontSize: 15, fontWeight: 500, color: '#202124' },
  profileMenuEmail: { fontSize: 13, color: '#5f6368' },
  profileMenuDivider: { height: 1, background: '#e0e0e0' },
  profileMenuItem: {
    padding: '12px 16px',
    fontSize: 14,
    color: '#202124',
    cursor: 'pointer',
  },

  // ── BODY ──
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  // ── SIDEBAR ──
  sidebar: {
    width: 256,
    padding: '8px 0',
    flexShrink: 0,
    overflowY: 'auto',
    background: '#f6f8fc',
  },
  composeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '8px 16px 16px',
    padding: '16px 24px',
    background: '#c2e7ff',
    border: 'none',
    borderRadius: 16,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    color: '#202124',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  composePlus: { fontSize: 20, fontWeight: 300 },
  nav: { display: 'flex', flexDirection: 'column' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '4px 16px',
    height: 36,
    borderRadius: '0 18px 18px 0',
    cursor: 'pointer',
    fontSize: 14,
    color: '#202124',
    marginRight: 16,
  },
  navItemActive: {
    background: '#d3e3fd',
    fontWeight: 700,
  },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  navLabel: { flex: 1 },
  navCount: {
    fontSize: 12,
    fontWeight: 700,
    color: '#202124',
  },
  sidebarDivider: { height: 1, background: '#e0e0e0', margin: '8px 16px' },
  labelsHeader: { fontSize: 14, fontWeight: 500, color: '#202124', padding: '8px 16px', letterSpacing: 0.1 },
  labelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 16px',
    fontSize: 14,
    color: '#202124',
    cursor: 'pointer',
    height: 32,
  },
  labelDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#00ff88',
    flexShrink: 0,
  },

  // ── EMAIL PANE ──
  emailPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: '16px 0 0 16px',
    margin: '8px 0 8px 0',
    border: '1px solid #e0e0e0',
    borderRight: 'none',
  },
  emailToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    borderBottom: '1px solid #f0f0f0',
    flexShrink: 0,
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: 4 },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: 4 },
  toolbarBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    color: '#5f6368',
    padding: '6px 8px',
    borderRadius: 4,
  },
  checkbox: { cursor: 'pointer', margin: '0 4px' },
  emailCount: { fontSize: 13, color: '#5f6368', padding: '0 8px' },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0',
    flexShrink: 0,
  },
  tab: {
    padding: '12px 24px',
    fontSize: 14,
    color: '#5f6368',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    fontWeight: 500,
  },
  tabActive: {
    color: '#1a73e8',
    borderBottom: '3px solid #1a73e8',
  },
  emailRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    height: 52,
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    gap: 8,
    fontSize: 14,
    transition: 'background 0.1s',
  },
  emailRowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  starBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    color: '#5f6368',
    padding: '0 4px',
  },
  emailAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    marginRight: 4,
  },
  emailFrom: {
    width: 160,
    flexShrink: 0,
    color: '#202124',
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emailBody: {
    flex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  emailSubject: { color: '#202124' },
  emailPreview: { color: '#5f6368', fontWeight: 400 },
  emailTime: { color: '#5f6368', fontSize: 12, flexShrink: 0 },

  // ── SECURITY PANEL ──
  securityPanel: {
    width: 280,
    background: '#0d0d0d',
    padding: '24px 20px',
    color: '#fff',
    fontFamily: "'Courier New', monospace",
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    overflowY: 'auto',
    flexShrink: 0,
    borderRadius: '0 16px 16px 0',
    margin: '8px 8px 8px 0',
  },
  panelHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  panelLogo: { color: '#00ff88', fontSize: 20 },
  panelTitle: { color: '#00ff88', fontWeight: 700, fontSize: 13, letterSpacing: 3 },
  statusBadge: {
    background: '#00ff8815',
    border: '1px solid #00ff8833',
    borderRadius: 4,
    padding: '8px 12px',
    color: '#00ff88',
    fontSize: 11,
    letterSpacing: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    background: '#00ff88',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulse 2s ease-in-out infinite',
    flexShrink: 0,
  },
  metric: { background: '#111', borderRadius: 6, padding: '12px 14px' },
  metricLabel: { color: '#444', fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  metricValue: { color: '#00ff88', fontSize: 20, fontWeight: 700 },
  eventLog: {
    background: '#060606',
    border: '1px solid #111',
    borderRadius: 6,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 180,
    overflowY: 'auto',
  },
  noEvents: { color: '#333', fontSize: 12, textAlign: 'center', padding: 8 },
  eventLink: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 11 },
  eventDot: { width: 5, height: 5, background: '#00ff88', borderRadius: '50%', flexShrink: 0 },
  eventLabel: { color: '#00ff88', flex: 1 },
  eventTime: { color: '#444', fontSize: 10 },
  panelFooter: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #222',
    color: '#555',
    padding: 8,
    fontSize: 11,
    cursor: 'pointer',
    borderRadius: 4,
    letterSpacing: 1,
    fontFamily: "'Courier New', monospace",
  },
  reenrollBtn: {
    background: 'transparent',
    border: '1px solid #ff444433',
    color: '#ff6666',
    padding: 8,
    fontSize: 11,
    cursor: 'pointer',
    borderRadius: 4,
    letterSpacing: 1,
    fontFamily: "'Courier New', monospace",
  },
  duressTestBtn: {
    background: '#ffaa0022',
    border: '1px solid #ffaa0044',
    color: '#ffaa00',
    padding: 8,
    fontSize: 11,
    cursor: 'pointer',
    borderRadius: 4,
    letterSpacing: 1,
    fontFamily: "'Courier New', monospace",
  },
};
