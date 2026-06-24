import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import FocusableButton from '../components/FocusableButton';
import TVKeyboard from '../components/TVKeyboard';
import QRCode from '../components/QRCode';
import { avatarEmojis, colors, fontSize, spacing, rounded, commonStyles } from '../theme';

export default function SettingsScreen() {
  const { nav, familyId, navigate, goBack } = useFamilyContext();

  if (nav.screen === 'settings-children') return <ManageChildren />;
  if (nav.screen === 'settings-checklist') return <ManageChecklist />;
  if (nav.screen === 'settings-rewards') return <ManageRewards />;

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="←"
          variant="ghost"
          size="sm"
          onPress={goBack}
        />
        <Text style={styles.title}>Settings</Text>
      </View>

      <TVFocusGuideView style={styles.menuList}>
        <FocusableButton
          label="Manage Children"
          icon="👦"
          variant="secondary"
          size="lg"
          onPress={() => navigate('settings-children')}
          style={styles.menuItem}
          hasTVPreferredFocus
        />
        <FocusableButton
          label="Manage Checklist Items"
          icon="✅"
          variant="secondary"
          size="lg"
          onPress={() => navigate('settings-checklist')}
          style={styles.menuItem}
        />
        <FocusableButton
          label="Manage Rewards"
          icon="🎁"
          variant="secondary"
          size="lg"
          onPress={() => navigate('settings-rewards')}
          style={styles.menuItem}
        />
      </TVFocusGuideView>

      <View style={styles.companionHint}>
        {familyId && (
          <View style={styles.qrRow}>
            <QRCode
              value={`https://bedtime.jg-it.net?code=${familyId}`}
              size={100}
              color="#FFFFFF"
              bgColor={colors.surface}
            />
            <View style={styles.qrInfo}>
              <Text style={styles.companionText}>
                Scan to manage on your phone
              </Text>
              <Text style={styles.companionCode}>{familyId}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function ManageChildren() {
  const { children, tonight, addNewChild, updateChildTimer, resetTonight, deleteChild, goBack } = useFamilyContext();
  const [addMode, setAddMode] = useState<'idle' | 'name' | 'avatar'>('idle');
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const handleNameDone = () => {
    if (!newName.trim()) return;
    setAddMode('avatar');
  };

  const handleAvatarDone = async (emoji: string) => {
    setSelectedAvatar(emoji);
    await addNewChild(newName.trim(), emoji);
    setNewName('');
    setSelectedAvatar('');
    setAddMode('idle');
  };

  if (addMode === 'name') {
    return (
      <View style={[commonStyles.screenContainer, styles.centeredContent]}>
        <Text style={styles.title}>Enter child's name</Text>
        <TVKeyboard
          value={newName}
          onChangeText={setNewName}
          onSubmit={handleNameDone}
          placeholder="Name"
          maxLength={15}
        />
        <FocusableButton
          label="Cancel"
          variant="ghost"
          size="sm"
          onPress={() => { setAddMode('idle'); setNewName(''); }}
          style={styles.cancelButton}
        />
      </View>
    );
  }

  if (addMode === 'avatar') {
    return (
      <View style={[commonStyles.screenContainer, styles.centeredContent]}>
        <Text style={styles.title}>Pick an avatar for {newName}</Text>
        <TVFocusGuideView style={styles.avatarGrid}>
          {avatarEmojis.map((emoji, idx) => (
            <FocusableButton
              key={emoji}
              label={emoji}
              variant="secondary"
              size="lg"
              onPress={() => handleAvatarDone(emoji)}
              style={styles.avatarButton}
              hasTVPreferredFocus={idx === 0}
            />
          ))}
        </TVFocusGuideView>
        <FocusableButton
          label="Cancel"
          variant="ghost"
          size="sm"
          onPress={() => { setAddMode('idle'); setNewName(''); }}
          style={styles.cancelButton}
        />
      </View>
    );
  }

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="←"
          variant="ghost"
          size="sm"
          onPress={goBack}
          hasTVPreferredFocus
        />
        <Text style={styles.title}>Manage Children</Text>
      </View>

      <ScrollView style={styles.content}>
        {children.map((child) => (
          <View key={child.id} style={styles.childCard}>
            <View style={styles.childCardTop}>
              <Text style={styles.itemAvatar}>{child.avatar}</Text>
              <Text style={styles.itemTitle}>{child.name}</Text>
              <FocusableButton
                label="Remove"
                variant="danger"
                size="sm"
                onPress={() => deleteChild(child.id)}
              />
            </View>
            <View style={styles.timerRow}>
              <Text style={styles.timerLabel}>Bedtime timer:</Text>
              <FocusableButton
                label="-"
                variant="secondary"
                size="sm"
                onPress={() => updateChildTimer(child.id, Math.max(5, (child.timerMinutes || 15) - 5))}
                style={styles.timerBtn}
              />
              <Text style={styles.timerValue}>{child.timerMinutes || 15} min</Text>
              <FocusableButton
                label="+"
                variant="secondary"
                size="sm"
                onPress={() => updateChildTimer(child.id, Math.min(60, (child.timerMinutes || 15) + 5))}
                style={styles.timerBtn}
              />
            </View>
            {tonight[child.id] && (
              <View style={styles.timerRow}>
                <FocusableButton
                  label="Reset Tonight"
                  icon="🔄"
                  variant="danger"
                  size="sm"
                  onPress={() => resetTonight(child.id)}
                />
              </View>
            )}
          </View>
        ))}

        {children.length < 4 && (
          <FocusableButton
            label="+ Add Child"
            icon="👶"
            variant="primary"
            size="md"
            onPress={() => setAddMode('name')}
            style={styles.addButton}
          />
        )}
      </ScrollView>
    </View>
  );
}

function ManageChecklist() {
  const {
    children,
    getChecklistForChild,
    addNewChecklistItem,
    deleteChecklistItem,
    goBack,
  } = useFamilyContext();
  const [selectedChild, setSelectedChild] = useState(0);
  const [addMode, setAddMode] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const child = children[selectedChild];
  const items = child ? getChecklistForChild(child.id) : [];

  const handleAddDone = async () => {
    if (!newTitle.trim() || !child) return;
    await addNewChecklistItem(child.id, newTitle.trim(), '✅');
    setNewTitle('');
    setAddMode(false);
  };

  if (addMode) {
    return (
      <View style={[commonStyles.screenContainer, styles.centeredContent]}>
        <Text style={styles.title}>
          New checklist item for {child?.name}
        </Text>
        <TVKeyboard
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmit={handleAddDone}
          placeholder="e.g. Brush teeth"
          maxLength={30}
        />
        <FocusableButton
          label="Cancel"
          variant="ghost"
          size="sm"
          onPress={() => { setAddMode(false); setNewTitle(''); }}
          style={styles.cancelButton}
        />
      </View>
    );
  }

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="←"
          variant="ghost"
          size="sm"
          onPress={goBack}
          hasTVPreferredFocus
        />
        <Text style={styles.title}>Checklist Items</Text>
      </View>

      <TVFocusGuideView style={styles.tabs}>
        {children.map((c, idx) => (
          <FocusableButton
            key={c.id}
            label={`${c.avatar} ${c.name}`}
            variant={idx === selectedChild ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setSelectedChild(idx)}
            style={styles.tab}
          />
        ))}
      </TVFocusGuideView>

      <ScrollView style={styles.content}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemAvatar}>{item.icon}</Text>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <FocusableButton
              label="Remove"
              variant="danger"
              size="sm"
              onPress={() => child && deleteChecklistItem(child.id, item.id)}
            />
          </View>
        ))}

        <FocusableButton
          label="+ Add Item"
          icon="➕"
          variant="primary"
          size="md"
          onPress={() => setAddMode(true)}
          style={styles.addButton}
        />
      </ScrollView>
    </View>
  );
}

function ManageRewards() {
  const { children, getRewardsForChild, addNewReward, deleteReward, goBack } = useFamilyContext();
  const [selectedChild, setSelectedChild] = useState(0);
  const [addMode, setAddMode] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const child = children[selectedChild];
  const childRewards = child ? getRewardsForChild(child.id) : [];

  const handleAddDone = async () => {
    if (!newTitle.trim() || !child) return;
    await addNewReward(child.id, newTitle.trim(), '🎁');
    setNewTitle('');
    setAddMode(false);
  };

  if (addMode) {
    return (
      <View style={[commonStyles.screenContainer, styles.centeredContent]}>
        <Text style={styles.title}>
          New reward for {child?.name}
        </Text>
        <TVKeyboard
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmit={handleAddDone}
          placeholder="e.g. Extra story time"
          maxLength={30}
        />
        <FocusableButton
          label="Cancel"
          variant="ghost"
          size="sm"
          onPress={() => { setAddMode(false); setNewTitle(''); }}
          style={styles.cancelButton}
        />
      </View>
    );
  }

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="←"
          variant="ghost"
          size="sm"
          onPress={goBack}
          hasTVPreferredFocus
        />
        <Text style={styles.title}>Reward Items</Text>
      </View>

      <TVFocusGuideView style={styles.tabs}>
        {children.map((c, idx) => (
          <FocusableButton
            key={c.id}
            label={`${c.avatar} ${c.name}`}
            variant={idx === selectedChild ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setSelectedChild(idx)}
            style={styles.tab}
          />
        ))}
      </TVFocusGuideView>

      <ScrollView style={styles.content}>
        {childRewards.map((reward) => (
          <View key={reward.id} style={styles.itemRow}>
            <Text style={styles.itemAvatar}>{reward.icon}</Text>
            <Text style={styles.itemTitle}>{reward.title}</Text>
            <FocusableButton
              label="Remove"
              variant="danger"
              size="sm"
              onPress={() => child && deleteReward(child.id, reward.id)}
            />
          </View>
        ))}

        <FocusableButton
          label="+ Add Reward"
          icon="➕"
          variant="primary"
          size="md"
          onPress={() => setAddMode(true)}
          style={styles.addButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.lg,
  },
  menuList: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  menuItem: {
    marginBottom: spacing.lg,
  },
  companionHint: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrInfo: {
    marginLeft: spacing.lg,
  },
  companionText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  companionCode: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 3,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  tab: {
    marginRight: spacing.sm,
  },
  childCard: {
    backgroundColor: colors.surface,
    ...rounded('lg'),
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingLeft: spacing.xxl,
  },
  timerLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  timerBtn: {
    width: 64,
    height: 52,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: spacing.xs,
  },
  timerValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.accent,
    minWidth: 100,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...rounded('lg'),
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemAvatar: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  itemTitle: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addButton: {
    marginTop: spacing.lg,
  },
  cancelButton: {
    marginTop: spacing.lg,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 700,
    marginTop: spacing.lg,
  },
  avatarButton: {
    width: 120,
    height: 120,
    margin: spacing.sm,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
