import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import BodyText from './BodyText';

interface Props {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  onPress,
  accessibilityLabel,
}: Props) {
  const { colors } = useTheme();

  // When the header is pressable (active-enumeration section → Settings),
  // use Pressable for correct web/native event handling. Otherwise plain View.
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
      >
        <BodyText
          size="sectionHeader"
          style={[styles.title, { color: colors.accent }]}
        >
          {title}
        </BodyText>
        {subtitle ? (
          <BodyText size="caption" muted style={styles.subtitle}>
            {subtitle}
          </BodyText>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <BodyText
        size="sectionHeader"
        style={[styles.title, { color: colors.textMuted }]}
      >
        {title}
      </BodyText>
      {subtitle ? (
        <BodyText size="caption" muted style={styles.subtitle}>
          {subtitle}
        </BodyText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 18,
  },
});
