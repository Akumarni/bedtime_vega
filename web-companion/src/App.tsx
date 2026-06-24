import React, { useState, useEffect } from 'react';
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
    if (!code || !pin) {
      setError('Enter your family code and PIN');
      return;
    }
    const result = await verifyFamily(code, pin);
    if (!result.valid) {
      setError('Invalid code or PIN');
      return;
    }
    setAuthedFamilyId(code);
    setFamilyName(result.name);
    setPage('home');
    if (window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  if (page === 'login') {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <div style={{ fontSize: 64, textAlign: 'center' as const }}>🌙</div>
          <h1 style={styles.loginTitle}>Bedtime Checklist</h1>
          <p style={styles.loginSubtitle}>Parent Control Panel</p>
          {codeFromUrl && (
            <p style={styles.codeHint}>Family code detected from QR</p>
          )}
          <input
            style={styles.input}
            placeholder="Family Code (from TV)"
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value.toUpperCase())}
            maxLength={6}
            readOnly={!!codeFromUrl}
          />
          <input
            style={styles.input}
            placeholder="4-digit PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            inputMode="numeric"
            autoFocus={!!codeFromUrl}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btnPrimary} onClick={handleLogin}>
            Connect
          </button>
        </div>
      </div>
    );
  }

  if (page === 'children' && authedFamilyId) {
    return (
      <ManageChildrenPage
        familyId={authedFamilyId}
        children={children}
        onBack={() => setPage('home')}
      />
    );
  }

  if (page === 'checklist' && authedFamilyId) {
    return (
      <ManageChecklistPage
        familyId={authedFamilyId}
        children={children}
        onBack={() => setPage('home')}
      />
    );
  }

  if (page === 'rewards' && authedFamilyId) {
    return (
      <ManageRewardsPage
        familyId={authedFamilyId}
        children={children}
        onBack={() => setPage('home')}
      />
    );
  }

  if (page === 'history') {
    return (
      <div style={styles.container}>
        <div style={styles.page}>
          <button style={styles.backBtn} onClick={() => setPage('home')}>
            ← Back
          </button>
          <h2 style={styles.pageTitle}>Reward History</h2>

          <div style={styles.tabRow}>
            {children.map((c) => (
              <button
                key={c.id}
                style={{
                  ...styles.tab,
                  ...(historyChild === c.id ? styles.tabActive : {}),
                }}
                onClick={() => setHistoryChild(c.id)}>
                {c.avatar} {c.name}
              </button>
            ))}
          </div>

          {historyChild && historyEntries.length === 0 && (
            <p style={styles.emptyText}>No history yet</p>
          )}

          {historyEntries.map((entry) => (
            <div key={entry.id} style={styles.listItem}>
              <span>{entry.rewardIcon} {entry.rewardTitle}</span>
              <span style={{ color: '#9093A8', fontSize: 14 }}>{entry.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.page}>
        <div style={{ textAlign: 'center' as const, marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🌙</div>
          <h1 style={styles.pageTitle}>{familyName} Family</h1>
          <p style={{ color: '#9093A8', fontSize: 14 }}>
            Code: {authedFamilyId}
          </p>
        </div>

        <div style={styles.menuList}>
          <button style={styles.menuBtn} onClick={() => setPage('children')}>
            👦 Manage Children ({children.length})
          </button>
          <button style={styles.menuBtn} onClick={() => setPage('checklist')}>
            ✅ Checklist Items
          </button>
          <button style={styles.menuBtn} onClick={() => setPage('rewards')}>
            🎁 Rewards
          </button>
          <button
            style={styles.menuBtn}
            onClick={() => {
              setHistoryChild(children[0]?.id || null);
              setPage('history');
            }}>
            📊 Reward History
          </button>
        </div>

        <button
          style={{ ...styles.menuBtn, ...styles.logoutBtn }}
          onClick={() => {
            setAuthedFamilyId(null);
            setFamilyId('');
            setPin('');
            setPage('login');
          }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

function ManageChildrenPage({
  familyId,
  children,
  onBack,
}: {
  familyId: string;
  children: Child[];
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [editTimer, setEditTimer] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim() || children.length >= 4) return;
    await addItem(`families/${familyId}/children`, {
      name: name.trim(),
      avatar: AVATARS[avatar],
      order: children.length,
      timerMinutes: 15,
    });
    setName('');
    setAvatar((a) => (a + 1) % AVATARS.length);
  };

  return (
    <div style={styles.container}>
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <h2 style={styles.pageTitle}>Manage Children</h2>

        {children.map((child) => (
          <div key={child.id} style={styles.childCard}>
            <div style={styles.listItem}>
              <span style={{ fontSize: 24 }}>{child.avatar}</span>
              <span style={{ flex: 1, marginLeft: 12 }}>{child.name}</span>
              <button
                style={styles.btnDanger}
                onClick={() =>
                  removeItem(`families/${familyId}/children/${child.id}`)
                }>
                Remove
              </button>
            </div>
            <div style={styles.timerRow}>
              <span style={{ color: '#9093A8', fontSize: 14 }}>Timer:</span>
              <button
                style={styles.timerBtn}
                onClick={() =>
                  updateItem(`families/${familyId}/children/${child.id}`, {
                    timerMinutes: Math.max(5, (child.timerMinutes || 15) - 5),
                  })
                }>
                −
              </button>
              <span style={styles.timerValue}>{child.timerMinutes || 15} min</span>
              <button
                style={styles.timerBtn}
                onClick={() =>
                  updateItem(`families/${familyId}/children/${child.id}`, {
                    timerMinutes: Math.min(60, (child.timerMinutes || 15) + 5),
                  })
                }>
                +
              </button>
            </div>
          </div>
        ))}

        {children.length < 4 && (
          <div style={styles.addSection}>
            <h3 style={{ marginBottom: 12, color: '#F0EFFA' }}>Add Child</h3>
            <div style={styles.avatarRow}>
              {AVATARS.map((emoji, idx) => (
                <button
                  key={emoji}
                  style={{
                    ...styles.avatarBtn,
                    ...(idx === avatar ? styles.avatarBtnActive : {}),
                  }}
                  onClick={() => setAvatar(idx)}>
                  {emoji}
                </button>
              ))}
            </div>
            <input
              style={styles.input}
              placeholder="Child's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              style={styles.btnPrimary}
              onClick={handleAdd}
              disabled={!name.trim()}>
              Add Child
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ManageChecklistPage({
  familyId,
  children,
  onBack,
}: {
  familyId: string;
  children: Child[];
  onBack: () => void;
}) {
  const [selectedChild, setSelectedChild] = useState(0);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('✅');

  const child = children[selectedChild];

  useEffect(() => {
    if (!child) return;
    return subscribe<Record<string, ChecklistItem>>(
      `families/${familyId}/children/${child.id}/checklistItems`,
      (data) => {
        const arr = data ? Object.values(data) : [];
        arr.sort((a, b) => a.order - b.order);
        setItems(arr);
      },
    );
  }, [familyId, child?.id]);

  const handleAdd = async () => {
    if (!title.trim() || !child) return;
    await addItem(`families/${familyId}/children/${child.id}/checklistItems`, {
      title: title.trim(),
      icon,
      order: items.length,
    });
    setTitle('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <h2 style={styles.pageTitle}>Checklist Items</h2>

        <div style={styles.tabRow}>
          {children.map((c, idx) => (
            <button
              key={c.id}
              style={{
                ...styles.tab,
                ...(idx === selectedChild ? styles.tabActive : {}),
              }}
              onClick={() => setSelectedChild(idx)}>
              {c.avatar} {c.name}
            </button>
          ))}
        </div>

        {items.map((item) => (
          <div key={item.id} style={styles.listItem}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <span style={{ flex: 1, marginLeft: 12 }}>{item.title}</span>
            <button
              style={styles.btnDanger}
              onClick={() =>
                child && removeItem(`families/${familyId}/children/${child.id}/checklistItems/${item.id}`)
              }>
              Remove
            </button>
          </div>
        ))}

        <div style={styles.addSection}>
          <h3 style={{ marginBottom: 12, color: '#F0EFFA' }}>Add Item</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...styles.input, width: 60, textAlign: 'center' as const }}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Icon"
            />
            <input
              style={{ ...styles.input, flex: 1 }}
              placeholder="e.g. Brush teeth"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <button
            style={styles.btnPrimary}
            onClick={handleAdd}
            disabled={!title.trim()}>
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageRewardsPage({
  familyId,
  children,
  onBack,
}: {
  familyId: string;
  children: Child[];
  onBack: () => void;
}) {
  const [selectedChild, setSelectedChild] = useState(0);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🎁');

  const child = children[selectedChild];

  useEffect(() => {
    if (!child) return;
    return subscribe<Record<string, RewardItem>>(
      `families/${familyId}/children/${child.id}/rewards`,
      (data) => {
        const arr = data ? Object.values(data) : [];
        setRewards(arr);
      },
    );
  }, [familyId, child?.id]);

  const handleAdd = async () => {
    if (!title.trim() || !child) return;
    await addItem(`families/${familyId}/children/${child.id}/rewards`, {
      title: title.trim(),
      icon,
    });
    setTitle('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <h2 style={styles.pageTitle}>Reward Items</h2>

        <div style={styles.tabRow}>
          {children.map((c, idx) => (
            <button
              key={c.id}
              style={{
                ...styles.tab,
                ...(idx === selectedChild ? styles.tabActive : {}),
              }}
              onClick={() => setSelectedChild(idx)}>
              {c.avatar} {c.name}
            </button>
          ))}
        </div>

        {rewards.map((reward) => (
          <div key={reward.id} style={styles.listItem}>
            <span style={{ fontSize: 24 }}>{reward.icon}</span>
            <span style={{ flex: 1, marginLeft: 12 }}>{reward.title}</span>
            <button
              style={styles.btnDanger}
              onClick={() =>
                child && removeItem(`families/${familyId}/children/${child.id}/rewards/${reward.id}`)
              }>
              Remove
            </button>
          </div>
        ))}

        <div style={styles.addSection}>
          <h3 style={{ marginBottom: 12, color: '#F0EFFA' }}>Add Reward</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...styles.input, width: 60, textAlign: 'center' as const }}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Icon"
            />
            <input
              style={{ ...styles.input, flex: 1 }}
              placeholder="e.g. Extra story time"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <button
            style={styles.btnPrimary}
            onClick={handleAdd}
            disabled={!title.trim()}>
            Add Reward
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    paddingTop: 32,
  },
  loginCard: {
    background: '#111827',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: 40,
    border: '1px solid #1F2940',
  },
  loginTitle: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 800,
    color: '#F0EFFA',
    margin: 0,
  },
  loginSubtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9093A8',
    margin: 0,
    marginBottom: 8,
  },
  codeHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#00B894',
    margin: 0,
    fontWeight: 600,
  },
  page: {
    width: '100%',
    maxWidth: 500,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#F0EFFA',
    margin: '0 0 20px 0',
    textAlign: 'center',
  },
  input: {
    background: '#1A2236',
    border: '1px solid #1F2940',
    borderRadius: 12,
    padding: '14px 16px',
    fontSize: 16,
    color: '#F0EFFA',
    width: '100%',
    outline: 'none',
  },
  btnPrimary: {
    background: '#6C5CE7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  btnDanger: {
    background: '#7A3E30',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#A29BFE',
    fontSize: 16,
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: 12,
  },
  error: {
    color: '#E17055',
    fontSize: 14,
    textAlign: 'center',
    margin: 0,
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  menuBtn: {
    background: '#111827',
    border: '1px solid #1F2940',
    borderRadius: 14,
    padding: '18px 20px',
    fontSize: 17,
    fontWeight: 600,
    color: '#F0EFFA',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  logoutBtn: {
    marginTop: 24,
    background: 'transparent',
    borderColor: '#7A3E30',
    color: '#E17055',
    textAlign: 'center',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    background: '#111827',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 8,
    fontSize: 16,
    border: '1px solid #1F2940',
  },
  childCard: {
    background: '#111827',
    borderRadius: 14,
    marginBottom: 12,
    border: '1px solid #1F2940',
    overflow: 'hidden',
  },
  timerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 16px 12px',
  },
  timerBtn: {
    background: '#1A2236',
    border: '1px solid #2D3A55',
    borderRadius: 8,
    color: '#F0EFFA',
    fontSize: 18,
    fontWeight: 700,
    width: 36,
    height: 36,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    color: '#FDCB6E',
    fontWeight: 700,
    fontSize: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  addSection: {
    marginTop: 24,
    background: '#111827',
    borderRadius: 16,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    border: '1px solid #1F2940',
  },
  avatarRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  avatarBtn: {
    background: '#1A2236',
    border: '2px solid transparent',
    borderRadius: 10,
    padding: 8,
    fontSize: 24,
    cursor: 'pointer',
  },
  avatarBtnActive: {
    borderColor: '#FDCB6E',
    background: '#222D45',
  },
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tab: {
    background: '#111827',
    border: '1px solid transparent',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 15,
    fontWeight: 600,
    color: '#9093A8',
    cursor: 'pointer',
  },
  tabActive: {
    borderColor: '#A29BFE',
    color: '#F0EFFA',
    background: '#1A2236',
  },
  emptyText: {
    color: '#555972',
    textAlign: 'center',
    padding: 40,
    fontSize: 16,
  },
};
