import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from '@p2p-local/design-tokens';
import { Icon } from '@/components/icon';

type PublishStepHeaderProps = {
  step: number;
  onBack: () => void;
};

export function PublishStepHeader({ step, onBack }: PublishStepHeaderProps) {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: top + spacing[2] }]}>
      <Pressable accessibilityLabel="Retour" onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-left" size={22} color={colors.neutral[700]} />
      </Pressable>
      <View accessibilityLabel={`Étape ${step} sur 3`} style={styles.progress}>
        <Text style={styles.step}>
          {step} <Text style={styles.total}>/ 3</Text>
        </Text>
        <View style={styles.track}>
          {[1, 2, 3].map((part) => (
            <View key={part} style={[styles.segment, part <= step && styles.activeSegment]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    backgroundColor: colors.neutral[50],
  },
  backButton: { padding: spacing[1] },
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  step: { color: colors.neutral[900], fontSize: fontSize.sm, fontWeight: '800' },
  total: { color: colors.neutral[400], fontSize: fontSize.xs },
  track: { flexDirection: 'row', gap: 3 },
  segment: { width: 18, height: 4, borderRadius: 4, backgroundColor: colors.primary[100] },
  activeSegment: { backgroundColor: colors.primary[500] },
});
