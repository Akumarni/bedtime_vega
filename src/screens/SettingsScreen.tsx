import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import FocusableButton from '../components/FocusableButton';
import { avatarEmojis, colors, fontSize, spacing, borderRadius, commonStyles } from '../theme';

export default function SettingsScreen() {
  const { nav, navigate, goBack } = useFamilyContext();

  if (nav.screen === 'settings-children') return <ManageChildren />;
  if (nav.screen === 'settings-checklist') return <ManageChecklist />;
  if (nav.screen === 'settings-rewards') return <ManageRewards />;

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="← Back"
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
    </View>
  );
}

function ManageChildren() {
  const { children, addNewChild, editChild, deleteChild, goBack } =
    useFamilyContext();
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addNewChild(newName.trim(), avatarEmojis[selectedAvatar]);
    setNewName('');
    setSelectedAvatar((s) => (s + 1) % avatarEmojis.length);
  };

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="← Back"
          variant="ghost"
          size="sm"
          onPress={goBack}
          hasTVPreferredFocus
        />
        <Text style={styles.title}>Manage Children</Text>
      </View>

      <ScrollView style={styles.content}>
        {children.map((child) => (
          <View key={child.id} style={styles.itemRow}>
            <Text style={styles.itemIcon}>{child.avatar}</Text>
            <Text style={styles.itemTitle}>{child.name}</Text>
            <FocusableButton
              label="Remove"
              variant="danger"
              size="sm"
              onPress={() => deleteChild(child.id)}
            />
          </View>
        ))}

        {children.length < 4 && (
          <View style={styles.addSection}>
            <Text style={styles.addLabel}>Add a child</Text>
            <TVFocusGuideView style={styles.avatarPicker}>
              {avatarEmojis.map((emoji, idx) => (
                <FocusableButton
                  key={emoji}
                  label={emoji}
                  variant={idx === selectedAvatar ? 'accent' : 'ghost'}
                  size="sm"
                  onPress={() => setSelectedAvatar(idx)}
                  style={styles.avatarOption}
                />
              ))}
            </TVFocusGuideView>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Child's name"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={handleAdd}
            />
            <FocusableButton
              label="Add Child"
              icon="➕"
              variant="primary"
              onPress={handleAdd}
              disabled={!newName.trim()}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ManageChecklist() {
  const { children, getChecklistForChild, addNewChecklistItem, deleteChecklistItem, goBack } =
    useFamilyContext();
  const [selectedChild, setSelectedChild] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('✅');

  const child = children[selectedChild];
  const items = child ? getChecklistForChild(child.id) : [];

  const handleAdd = async () => {
    if (!newTitle.trim() || !child) return;
    await addNewChecklistItem(child.id, newTitle.trim(), newIcon);
    setNewTitle('');
  };

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="← Back"
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
            style={{ marginRight: spacing.sm }}
          />
        ))}
      </TVFocusGuideView>

      <ScrollView style={styles.content}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <FocusableButton
              label="Remove"
              variant="danger"
              size="sm"
              onPress={() => child && deleteChecklistItem(child.id, item.id)}
            />
          </View>
        ))}

        <View style={styles.addSection}>
          <Text style={styles.addLabel}>Add an item</Text>
          <View style={commonStyles.row}>
            <TextInput
              style={[styles.input, styles.iconInput]}
              value={newIcon}
              onChangeText={setNewIcon}
              placeholder="Icon"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: spacing.md }]}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Item name (e.g. Brush teeth)"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={handleAdd}
            />
          </View>
          <FocusableButton
            label="Add Item"
            icon="➕"
            variant="primary"
            onPress={handleAdd}
            disabled={!newTitle.trim()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ManageRewards() {
  const { rewards, addNewReward, deleteReward, goBack } = useFamilyContext();
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('🎁');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addNewReward(newTitle.trim(), newIcon);
    setNewTitle('');
  };

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="← Back"
          variant="ghost"
          size="sm"
          onPress={goBack}
          hasTVPreferredFocus
        />
        <Text style={styles.title}>Reward Items</Text>
      </View>

      <ScrollView style={styles.content}>
        {rewards.map((reward) => (
          <View key={reward.id} style={styles.itemRow}>
            <Text style={styles.itemIcon}>{reward.icon}</Text>
            <Text style={styles.itemTitle}>{reward.title}</Text>
            <FocusableButton
              label="Remove"
              variant="danger"
              size="sm"
              onPress={() => deleteReward(reward.id)}
            />
          </View>
        ))}

        <View style={styles.addSection}>
          <Text style={styles.addLabel}>Add a reward</Text>
          <View style={commonStyles.row}>
            <TextInput
              style={[styles.input, styles.iconInput]}
              value={newIcon}
              onChangeText={setNewIcon}
              placeholder="Icon"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: spacing.md }]}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Reward name (e.g. Extra story time)"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={handleAdd}
            />
          </View>
          <FocusableButton
            label="Add Reward"
            icon="➕"
            variant="primary"
            onPress={handleAdd}
            disabled={!newTitle.trim()}
          />
        </View>
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
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  itemTitle: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addSection: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  addLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  avatarPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  avatarOption: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  iconInput: {
    width: 80,
    textAlign: 'center',
  },
});
