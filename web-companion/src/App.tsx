import React, { useState, useEffect, useCallback } from 'react';
import {
  verifyFamily,
  subscribe,
  addItem,
  removeItem,
  updateItem,
  Child,
  ChecklistItem,
  RewardItem,
  HistoryEntry,
} from './firebase';

type Page = 'login' | 'home' | 'children' | 'checklist' | 'rewards' | 'history';

const AVATARS = ['🌙', '⭐', '🦉', '🐻', '🦊', '🐰', '🌈', '🦋'];

function getCodeFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return (params.get('code') || '').toUpperCase();
}

function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={s.pageHeader}>
      <button style={s.backBtn} onClick={onBack}>
        <span style={s.backArrow}>&#8592;</span>
      </button>
      <h2 style={s.pageTitle}>{title}</h2>
    </div>
  );
}

function ChildTabs({
  children,
  selected,
  onSelect,
}: {
  children: Child[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div style={s.tabRow}>
      {children.map((c, idx) => (
        <button
          key={c.id}
          style={{ ...s.tab, ...(idx === selected ? s.tabActive : {}) }}
          onClick={() => onSelect(idx)}>
          <span style={s.tabAvatar}>{c.avatar}</span>
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  );
}

function InlineEdit({
  value,
  onSave,
  placeholder,
  style: extraStyle,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    if (draft.trim() && draft.trim() !== value) {
      onSave(draft.trim());
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        style={{ ...s.inlineInput, ...extraStyle }}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        autoFocus
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      style={{ ...s.editableText, ...extraStyle }}
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Tap to edit">
      {value}
    </span>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [familyId, setFamilyId] = useState(() => getCodeFromUrl());
  const [pin, setPin] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [authedFamilyId, setAuthedFamilyId] = useState<string | null>(null);

  const [children, setChildren] = useState<Child[]>([]);
  const [historyChild, setHistoryChild] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  const codeFromUrl = getCodeFromUrl();

  useEffect(() => {
    if (!authedFamilyId) return;
    return subscribe<Record<string, Child>>(
      `families/${authedFamilyId}/children`,
      (data) => {
        const arr = data ? Object.values(data) : [];
        arr.sort((a, b) => a.order - b.order);
        setChildren(arr);
      },
    );
  }, [authedFamilyId]);

  useEffect(() => {
    if (!authedFamilyId || !historyChild) return;
    return subscribe<Record<string, HistoryEntry>>(
      `history/${authedFamilyId}/${historyChild}`,
      (data) => {
        const arr = data ? Object.values(data) : [];
        arr.sort((a, b) => b.timestamp - a.timestamp);
        setHistoryEntries(arr);
      },
    );
  }, [authedFamilyId, historyChild]);

  const handleLogin = async () => {
    setError('');
    const code = familyId.trim().toUpperCase();
    if (!code || !pin) { setError('Enter your family code and PIN'); return; }
    const result = await verifyFamily(code, pin);
    if (!result.valid) { setError('Invalid code or PIN'); return; }
    setAuthedFamilyId(code);
    setFamilyName(result.name);
    setPage('home');
    if (window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  if (page === 'login') {
    return (
      <div style={s.container}>
        <div style={s.loginCard}>
          <div style={s.loginLogo}>🌙</div>
          <h1 style={s.loginTitle}>Bedtime Checklist</h1>
          <p style={s.loginSubtitle}>Parent Control Panel</p>
          {codeFromUrl && (
            <div style={s.qrBadge}>
              <span style={s.qrDot} />
              Family code detected from QR
            </div>
          )}
          <div style={s.inputGroup}>
            <label style={s.inputLabel}>Family Code</label>
            <input style={s.input} placeholder="Enter 6-character code" value={familyId}
              onChange={(e) => setFamilyId(e.target.value.toUpperCase())} maxLength={6} readOnly={!!codeFromUrl} />
          </div>
          <div style={s.inputGroup}>
            <label style={s.inputLabel}>PIN</label>
            <input style={s.input} placeholder="4-digit PIN" type="password" value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4}
              inputMode="numeric" autoFocus={!!codeFromUrl} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btnPrimary} onClick={handleLogin}>Connect</button>
        </div>
      </div>
    );
  }

  if (page === 'children' && authedFamilyId)
    return <ManageChildrenPage familyId={authedFamilyId} children={children} onBack={() => setPage('home')} />;
  if (page === 'checklist' && authedFamilyId)
    return <ManageChecklistPage familyId={authedFamilyId} children={children} onBack={() => setPage('home')} />;
  if (page === 'rewards' && authedFamilyId)
    return <ManageRewardsPage familyId={authedFamilyId} children={children} onBack={() => setPage('home')} />;
  if (page === 'history' && authedFamilyId)
    return <HistoryPage familyId={authedFamilyId} children={children} historyChild={historyChild}
      historyEntries={historyEntries} setHistoryChild={setHistoryChild} onBack={() => setPage('home')} />;

  return (
    <div style={s.container}>
      <div style={s.page}>
        <div style={s.homeHeader}>
          <div style={s.homeLogo}>🌙</div>
          <h1 style={s.homeTitle}>{familyName} Family</h1>
          <p style={s.homeCode}>Code: {authedFamilyId}</p>
        </div>
        <div style={s.menuGrid}>
          <button style={s.menuCard} onClick={() => setPage('children')}>
            <span style={s.menuIcon}>👦</span><span style={s.menuLabel}>Children</span>
            <span style={s.menuCount}>{children.length}</span>
          </button>
          <button style={s.menuCard} onClick={() => setPage('checklist')}>
            <span style={s.menuIcon}>✅</span><span style={s.menuLabel}>Checklists</span>
            <span style={s.menuChevron}>&#8250;</span>
          </button>
          <button style={s.menuCard} onClick={() => setPage('rewards')}>
            <span style={s.menuIcon}>🎁</span><span style={s.menuLabel}>Rewards</span>
            <span style={s.menuChevron}>&#8250;</span>
          </button>
          <button style={s.menuCard} onClick={() => { setHistoryChild(children[0]?.id || null); setPage('history'); }}>
            <span style={s.menuIcon}>📊</span><span style={s.menuLabel}>History</span>
            <span style={s.menuChevron}>&#8250;</span>
          </button>
        </div>
        <button style={s.logoutBtn} onClick={() => { setAuthedFamilyId(null); setFamilyId(''); setPin(''); setPage('login'); }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

// --- Manage Children ---
function ManageChildrenPage({ familyId, children, onBack }: { familyId: string; children: Child[]; onBack: () => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(0);

  const handleAdd = async () => {
    if (!name.trim() || children.length >= 4) return;
    await addItem(`families/${familyId}/children`, { name: name.trim(), avatar: AVATARS[avatar], order: children.length, timerMinutes: 15 });
    setName('');
    setAvatar((a) => (a + 1) % AVATARS.length);
  };

  return (
    <div style={s.container}>
      <div style={s.page}>
        <PageHeader title="Manage Children" onBack={onBack} />
        {children.map((child) => (
          <div key={child.id} style={s.childCard}>
            <div style={s.childMain}>
              <span style={s.childAvatar}>{child.avatar}</span>
              <InlineEdit value={child.name} onSave={(v) => updateItem(`families/${familyId}/children/${child.id}`, { name: v })} style={{ flex: 1, fontSize: 17, fontWeight: 600 }} />
              <button style={s.btnSmallDanger} onClick={() => removeItem(`families/${familyId}/children/${child.id}`)}>Remove</button>
            </div>
            <div style={s.timerRow}>
              <span style={s.timerLabel}>Timer</span>
              <div style={s.timerControls}>
                <button style={s.timerBtn} onClick={() => updateItem(`families/${familyId}/children/${child.id}`, { timerMinutes: Math.max(5, (child.timerMinutes || 15) - 5) })}>&minus;</button>
                <span style={s.timerValue}>{child.timerMinutes || 15} min</span>
                <button style={s.timerBtn} onClick={() => updateItem(`families/${familyId}/children/${child.id}`, { timerMinutes: Math.min(60, (child.timerMinutes || 15) + 5) })}>+</button>
              </div>
            </div>
          </div>
        ))}
        {children.length < 4 && (
          <div style={s.addCard}>
            <h3 style={s.addTitle}>Add Child</h3>
            <div style={s.avatarRow}>
              {AVATARS.map((emoji, idx) => (
                <button key={emoji} style={{ ...s.avatarBtn, ...(idx === avatar ? s.avatarBtnActive : {}) }} onClick={() => setAvatar(idx)}>{emoji}</button>
              ))}
            </div>
            <input style={s.input} placeholder="Child's name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            <button style={s.btnPrimary} onClick={handleAdd} disabled={!name.trim()}>Add Child</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Manage Checklists ---
function ManageChecklistPage({ familyId, children, onBack }: { familyId: string; children: Child[]; onBack: () => void }) {
  const [selectedChild, setSelectedChild] = useState(0);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('✅');
  const child = children[selectedChild];

  useEffect(() => {
    if (!child) return;
    return subscribe<Record<string, ChecklistItem>>(
      `families/${familyId}/children/${child.id}/checklistItems`,
      (data) => { const arr = data ? Object.values(data) : []; arr.sort((a, b) => a.order - b.order); setItems(arr); },
    );
  }, [familyId, child?.id]);

  const handleAdd = async () => {
    if (!title.trim() || !child) return;
    await addItem(`families/${familyId}/children/${child.id}/checklistItems`, { title: title.trim(), icon, order: items.length });
    setTitle('');
  };

  const swapOrder = async (idx: number, dir: -1 | 1) => {
    if (!child) return;
    const other = idx + dir;
    if (other < 0 || other >= items.length) return;
    const a = items[idx], b = items[other];
    await updateItem(`families/${familyId}/children/${child.id}/checklistItems/${a.id}`, { order: b.order });
    await updateItem(`families/${familyId}/children/${child.id}/checklistItems/${b.id}`, { order: a.order });
  };

  return (
    <div style={s.container}>
      <div style={s.page}>
        <PageHeader title="Checklist Items" onBack={onBack} />
        <ChildTabs children={children} selected={selectedChild} onSelect={setSelectedChild} />
        {items.length === 0 && (
          <div style={s.emptyState}><div style={s.emptyIcon}>✅</div><p style={s.emptyText}>No items yet</p><p style={s.emptyHint}>Add checklist items for {child?.name} below</p></div>
        )}
        {items.map((item, idx) => (
          <div key={item.id} style={s.listItem}>
            <div style={s.reorderBtns}>
              <button style={{ ...s.reorderBtn, opacity: idx === 0 ? 0.25 : 1 }} onClick={() => swapOrder(idx, -1)} disabled={idx === 0}>&#9650;</button>
              <button style={{ ...s.reorderBtn, opacity: idx === items.length - 1 ? 0.25 : 1 }} onClick={() => swapOrder(idx, 1)} disabled={idx === items.length - 1}>&#9660;</button>
            </div>
            <InlineEdit value={item.icon} onSave={(v) => child && updateItem(`families/${familyId}/children/${child.id}/checklistItems/${item.id}`, { icon: v })} style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }} />
            <InlineEdit value={item.title} onSave={(v) => child && updateItem(`families/${familyId}/children/${child.id}/checklistItems/${item.id}`, { title: v })} style={{ flex: 1, fontSize: 15, fontWeight: 500 }} />
            <button style={s.btnSmallDanger} onClick={() => child && removeItem(`families/${familyId}/children/${child.id}/checklistItems/${item.id}`)}>Remove</button>
          </div>
        ))}
        <div style={s.addCard}>
          <h3 style={s.addTitle}>Add Item</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...s.input, width: 56, textAlign: 'center' as const, padding: '12px 4px' }} value={icon} onChange={(e) => setIcon(e.target.value)} />
            <input style={{ ...s.input, flex: 1 }} placeholder="e.g. Brush teeth" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          </div>
          <button style={s.btnPrimary} onClick={handleAdd} disabled={!title.trim()}>Add Item</button>
        </div>
      </div>
    </div>
  );
}

// --- Manage Rewards ---
function ManageRewardsPage({ familyId, children, onBack }: { familyId: string; children: Child[]; onBack: () => void }) {
  const [selectedChild, setSelectedChild] = useState(0);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🎁');
  const child = children[selectedChild];

  useEffect(() => {
    if (!child) return;
    return subscribe<Record<string, RewardItem>>(
      `families/${familyId}/children/${child.id}/rewards`,
      (data) => { const arr = data ? Object.values(data) : []; setRewards(arr); },
    );
  }, [familyId, child?.id]);

  const handleAdd = async () => {
    if (!title.trim() || !child) return;
    await addItem(`families/${familyId}/children/${child.id}/rewards`, { title: title.trim(), icon });
    setTitle('');
  };

  return (
    <div style={s.container}>
      <div style={s.page}>
        <PageHeader title="Reward Items" onBack={onBack} />
        <ChildTabs children={children} selected={selectedChild} onSelect={setSelectedChild} />
        {rewards.length === 0 && (
          <div style={s.emptyState}><div style={s.emptyIcon}>🎁</div><p style={s.emptyText}>No rewards yet</p><p style={s.emptyHint}>Add rewards for {child?.name} below</p></div>
        )}
        {rewards.map((reward) => (
          <div key={reward.id} style={s.listItem}>
            <InlineEdit value={reward.icon} onSave={(v) => child && updateItem(`families/${familyId}/children/${child.id}/rewards/${reward.id}`, { icon: v })} style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }} />
            <InlineEdit value={reward.title} onSave={(v) => child && updateItem(`families/${familyId}/children/${child.id}/rewards/${reward.id}`, { title: v })} style={{ flex: 1, fontSize: 15, fontWeight: 500 }} />
            <button style={s.btnSmallDanger} onClick={() => child && removeItem(`families/${familyId}/children/${child.id}/rewards/${reward.id}`)}>Remove</button>
          </div>
        ))}
        <div style={s.addCard}>
          <h3 style={s.addTitle}>Add Reward</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...s.input, width: 56, textAlign: 'center' as const, padding: '12px 4px' }} value={icon} onChange={(e) => setIcon(e.target.value)} />
            <input style={{ ...s.input, flex: 1 }} placeholder="e.g. Extra story time" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          </div>
          <button style={s.btnPrimary} onClick={handleAdd} disabled={!title.trim()}>Add Reward</button>
        </div>
      </div>
    </div>
  );
}

// --- History with Stats ---
function HistoryPage({
  familyId, children, historyChild, historyEntries, setHistoryChild, onBack,
}: {
  familyId: string; children: Child[]; historyChild: string | null;
  historyEntries: HistoryEntry[]; setHistoryChild: (id: string | null) => void; onBack: () => void;
}) {
  const [allHistory, setAllHistory] = useState<Record<string, HistoryEntry[]>>({});

  useEffect(() => {
    if (!familyId || children.length === 0) return;
    const unsubs = children.map((child) =>
      subscribe<Record<string, HistoryEntry>>(
        `history/${familyId}/${child.id}`,
        (data) => {
          const arr = data ? Object.values(data) : [];
          arr.sort((a, b) => b.timestamp - a.timestamp);
          setAllHistory((prev) => ({ ...prev, [child.id]: arr }));
        },
      ),
    );
    return () => unsubs.forEach((fn) => fn());
  }, [familyId, children]);

  const child = children.find((c) => c.id === historyChild);
  const entries = historyChild ? (allHistory[historyChild] || historyEntries) : [];

  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
  const weekStr = weekAgo.toISOString().split('T')[0];
  const monthStr = monthAgo.toISOString().split('T')[0];

  const weekEntries = entries.filter((e) => e.date >= weekStr);
  const monthEntries = entries.filter((e) => e.date >= monthStr);

  const streak = computeStreak(entries.map((e) => e.date));

  const topReward = (() => {
    const counts: Record<string, number> = {};
    for (const e of entries) { counts[e.rewardTitle] = (counts[e.rewardTitle] || 0) + 1; }
    let best = ''; let bestCount = 0;
    for (const [k, v] of Object.entries(counts)) { if (v > bestCount) { best = k; bestCount = v; } }
    return best || '--';
  })();

  return (
    <div style={s.container}>
      <div style={s.page}>
        <PageHeader title="Reward History" onBack={onBack} />
        <ChildTabs
          children={children}
          selected={Math.max(0, children.findIndex((c) => c.id === historyChild))}
          onSelect={(i) => setHistoryChild(children[i]?.id || null)}
        />

        {child && entries.length > 0 && (
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <div style={s.statValue}>{streak}</div>
              <div style={s.statLabel}>🔥 Streak</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{weekEntries.length}</div>
              <div style={s.statLabel}>📅 This Week</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{monthEntries.length}</div>
              <div style={s.statLabel}>📆 This Month</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{entries.length}</div>
              <div style={s.statLabel}>⭐ All Time</div>
            </div>
          </div>
        )}

        {child && entries.length > 0 && (
          <div style={s.topRewardBanner}>
            <span style={s.topRewardLabel}>Most earned reward</span>
            <span style={s.topRewardValue}>{topReward}</span>
          </div>
        )}

        {historyChild && entries.length === 0 && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>📊</div>
            <p style={s.emptyText}>No history yet</p>
            <p style={s.emptyHint}>Complete a bedtime checklist to see rewards here</p>
          </div>
        )}

        {entries.map((entry) => (
          <div key={entry.id} style={s.historyItem}>
            <span style={s.historyIcon}>{entry.rewardIcon}</span>
            <div style={s.historyInfo}>
              <span style={s.historyTitle}>{entry.rewardTitle}</span>
              <span style={s.historyDate}>{entry.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const uniqueDates = [...new Set(dates)].sort().reverse();
  let streak = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedKey = expected.toISOString().split('T')[0];
    if (uniqueDates[i] === expectedKey) streak++;
    else break;
  }
  return streak;
}

// --- Styles ---
const c = {
  bg: '#080D1F', surface: '#111827', surfaceLight: '#1A2236', surfaceHighlight: '#222D45',
  primary: '#6C5CE7', primaryLight: '#A29BFE', accent: '#FDCB6E', success: '#00B894',
  danger: '#E17055', dangerDim: '#7A3E30', text: '#F0EFFA', textSec: '#9093A8',
  textMuted: '#555972', border: '#1F2940', borderLight: '#2D3A55',
};

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
    padding: '24px 16px', background: `linear-gradient(180deg, ${c.bg} 0%, #0C1229 100%)`,
  },
  loginCard: {
    background: c.surface, borderRadius: 24, padding: '40px 28px 32px', width: '100%', maxWidth: 400,
    display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32, border: `1px solid ${c.border}`,
  },
  loginLogo: { fontSize: 56, textAlign: 'center' as const, marginBottom: -8 },
  loginTitle: { textAlign: 'center' as const, fontSize: 26, fontWeight: 800, color: c.text, margin: 0, letterSpacing: -0.5 },
  loginSubtitle: { textAlign: 'center' as const, fontSize: 14, color: c.textSec, margin: '0 0 8px', fontWeight: 500 },
  qrBadge: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: c.success, fontWeight: 600, background: '#0A2A22', borderRadius: 8, padding: '8px 12px' },
  qrDot: { width: 8, height: 8, borderRadius: 4, background: c.success, display: 'inline-block' },
  inputGroup: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: 600, color: c.textSec, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  error: { color: c.danger, fontSize: 14, textAlign: 'center' as const, margin: 0, fontWeight: 500 },
  page: { width: '100%', maxWidth: 500 },
  pageHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  backBtn: { background: c.surfaceLight, border: `1px solid ${c.border}`, borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.primaryLight, fontSize: 20, cursor: 'pointer' },
  backArrow: { fontSize: 18, lineHeight: 1 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: c.text, margin: 0 },
  homeHeader: { textAlign: 'center' as const, marginBottom: 32, paddingTop: 8 },
  homeLogo: { fontSize: 48, marginBottom: 8 },
  homeTitle: { fontSize: 24, fontWeight: 800, color: c.text, margin: 0, letterSpacing: -0.3 },
  homeCode: { fontSize: 12, color: c.textMuted, marginTop: 6, letterSpacing: 1.5, fontWeight: 600 },
  menuGrid: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  menuCard: { display: 'flex', alignItems: 'center', gap: 14, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: '18px 20px', fontSize: 16, fontWeight: 600, color: c.text, cursor: 'pointer', textAlign: 'left' as const, width: '100%', fontFamily: 'inherit' },
  menuIcon: { fontSize: 24, width: 32, textAlign: 'center' as const },
  menuLabel: { flex: 1 },
  menuCount: { background: c.primary, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 700 },
  menuChevron: { color: c.textMuted, fontSize: 22, fontWeight: 300 },
  logoutBtn: { marginTop: 28, width: '100%', padding: '14px 20px', background: 'transparent', border: `1px solid ${c.dangerDim}`, borderRadius: 14, color: c.danger, fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'center' as const, fontFamily: 'inherit' },
  input: { background: c.surfaceLight, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px', fontSize: 16, color: c.text, width: '100%', outline: 'none', fontFamily: 'inherit' },
  inlineInput: { background: c.surfaceLight, border: `1px solid ${c.primaryLight}`, borderRadius: 8, padding: '4px 8px', color: c.text, outline: 'none', fontFamily: 'inherit' },
  editableText: { cursor: 'pointer', borderBottom: `1px dashed ${c.border}`, paddingBottom: 1 },
  btnPrimary: { background: c.primary, color: '#fff', border: 'none', borderRadius: 14, padding: '15px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit', letterSpacing: -0.2 },
  btnSmallDanger: { background: c.dangerDim, color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  tabRow: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const },
  tab: { display: 'flex', alignItems: 'center', gap: 6, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: '10px 16px', fontSize: 14, fontWeight: 600, color: c.textSec, cursor: 'pointer', fontFamily: 'inherit' },
  tabActive: { borderColor: c.primaryLight, color: c.text, background: c.surfaceLight },
  tabAvatar: { fontSize: 18 },
  listItem: { display: 'flex', alignItems: 'center', gap: 10, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8 },
  reorderBtns: { display: 'flex', flexDirection: 'column' as const, gap: 2, flexShrink: 0 },
  reorderBtn: { background: c.surfaceLight, border: `1px solid ${c.border}`, borderRadius: 6, color: c.textSec, fontSize: 10, width: 24, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: 'inherit' },
  childCard: { background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, marginBottom: 12, overflow: 'hidden' as const },
  childMain: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px' },
  childAvatar: { fontSize: 28 },
  timerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 14px', gap: 12 },
  timerLabel: { fontSize: 13, color: c.textSec, fontWeight: 600 },
  timerControls: { display: 'flex', alignItems: 'center', gap: 8 },
  timerBtn: { background: c.surfaceLight, border: `1px solid ${c.borderLight}`, borderRadius: 10, color: c.text, fontSize: 18, fontWeight: 700, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' },
  timerValue: { color: c.accent, fontWeight: 700, fontSize: 15, minWidth: 56, textAlign: 'center' as const },
  addCard: { marginTop: 20, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  addTitle: { fontSize: 16, fontWeight: 700, color: c.text, margin: 0 },
  avatarRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 4 },
  avatarBtn: { background: c.surfaceLight, border: '2px solid transparent', borderRadius: 12, padding: 8, fontSize: 24, cursor: 'pointer', lineHeight: 1 },
  avatarBtnActive: { borderColor: c.accent, background: c.surfaceHighlight },
  historyItem: { display: 'flex', alignItems: 'center', gap: 14, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 8 },
  historyIcon: { fontSize: 26 },
  historyInfo: { flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 2 },
  historyTitle: { fontSize: 15, fontWeight: 600, color: c.text },
  historyDate: { fontSize: 12, color: c.textMuted, fontWeight: 500 },
  emptyState: { textAlign: 'center' as const, padding: '48px 20px' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, color: c.textSec, fontWeight: 600, margin: '0 0 6px' },
  emptyHint: { fontSize: 14, color: c.textMuted, margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  statCard: { background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: '16px 12px', textAlign: 'center' as const },
  statValue: { fontSize: 28, fontWeight: 800, color: c.accent, lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: c.textSec, marginTop: 6, fontWeight: 600 },
  topRewardBanner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: '14px 18px', marginBottom: 16 },
  topRewardLabel: { fontSize: 13, color: c.textSec, fontWeight: 600 },
  topRewardValue: { fontSize: 15, color: c.success, fontWeight: 700 },
};
