import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import type { ListingType } from '@p2p-local/types';
import { Icon, type IconName } from '@/components/icon';
import { PublishStepHeader } from '@/components/publish-step-header';
import { useListingDraft } from '@/stores/listing-draft.store';

type TypeOption = {
  type: ListingType;
  label: string;
  description: string;
  icon: IconName;
  backgroundColor: string;
};

const typeOptions: TypeOption[] = [
  {
    type: 'DONATION',
    label: 'Donner',
    description: 'Offrir au quartier',
    icon: 'tag',
    backgroundColor: '#d9f3e5',
  },
  {
    type: 'BARTER',
    label: 'Troquer',
    description: 'Échanger sans argent',
    icon: 'exchange',
    backgroundColor: '#f9e0d6',
  },
  {
    type: 'SALE',
    label: 'Prix coûtant',
    description: 'Récupérer le prix payé',
    icon: 'dollar',
    backgroundColor: '#e8e3ff',
  },
  {
    type: 'REQUEST',
    label: 'Besoin',
    description: 'Dire ce que vous cherchez',
    icon: 'search',
    backgroundColor: '#eceeed',
  },
];

export default function PublishScreen() {
  const reset = useListingDraft((state) => state.reset);
  const setType = useListingDraft((state) => state.setType);

  function chooseType(type: ListingType): void {
    reset();
    setType(type);
    router.push('/publish-details');
  }

  return (
    <View style={styles.screen}>
      <PublishStepHeader step={1} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>CRÉER UNE ANNONCE</Text>
        <Text style={styles.title}>Que souhaitez-vous proposer ?</Text>
        <Text style={styles.intro}>
          Un choix suffit. Vous pourrez préciser les détails ensuite.
        </Text>
        <View style={styles.typeList}>
          {typeOptions.map((option) => (
            <Pressable
              key={option.type}
              accessibilityRole="button"
              accessibilityLabel={`${option.label}, ${option.description}`}
              onPress={() => chooseType(option.type)}
              style={[styles.typeCard, { backgroundColor: option.backgroundColor }]}
            >
              <View style={styles.typeIcon}>
                <Icon name={option.icon} size={23} color={colors.neutral[800]} />
              </View>
              <View style={styles.typeCopy}>
                <Text style={styles.typeLabel}>{option.label}</Text>
                <Text style={styles.typeDescription}>{option.description}</Text>
              </View>
              <Icon name="arrow-right" size={18} color={colors.neutral[600]} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[8], paddingBottom: spacing[8] },
  eyebrow: {
    color: colors.neutral[400],
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    maxWidth: 340,
    marginTop: spacing[2],
    color: colors.neutral[900],
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1.4,
    lineHeight: 34,
  },
  intro: {
    maxWidth: 320,
    marginTop: spacing[3],
    color: colors.neutral[500],
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  typeList: { gap: spacing[2], marginTop: spacing[6] },
  typeCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.lg,
  },
  typeIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  typeCopy: { flex: 1 },
  typeLabel: { color: colors.neutral[900], fontSize: fontSize.base, fontWeight: '700' },
  typeDescription: { marginTop: 3, color: colors.neutral[500], fontSize: fontSize.xs },
});
