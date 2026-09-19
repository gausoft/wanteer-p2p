import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import fallbackImage from '../assets/listing-books-1.jpg';
import { findNeighborhood } from '@p2p-local/config';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import { requiresPrice } from '@p2p-local/types';
import { Icon } from '@/components/icon';
import { PublishStepHeader } from '@/components/publish-step-header';
import { listingAuthorSchema, draftListingSchema } from '@/features/listings/listing.schema';
import { usePublishListing } from '@/features/listings/use-listings';
import { useContactProfile } from '@/features/contact/contact-profile';
import { photoUri } from '@/lib/photos';
import { useListingDraft } from '@/stores/listing-draft.store';
import { LISTING_TYPE_LABELS } from '@/components/type-filter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PublishConfirmScreen() {
  const { bottom } = useSafeAreaInsets();
  const draft = useListingDraft();
  const publish = usePublishListing();
  const { profile, save } = useContactProfile();
  const [firstNameOverride, setFirstName] = useState<string | null>(null);
  const [phoneOverride, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (draft.type === null) {
      router.replace('/publish');
      return;
    }
  }, [draft.type]);

  const firstName = firstNameOverride ?? profile?.firstName ?? '';
  const phone = phoneOverride ?? profile?.phone ?? '';
  const type = draft.type ?? 'DONATION';
  const neighborhoodName = findNeighborhood(draft.neighborhoodId)?.name ?? draft.neighborhoodId;

  async function submit(): Promise<void> {
    const parsedDraft = draftListingSchema.safeParse({
      title: draft.title,
      description: draft.description,
      type: draft.type,
      price:
        draft.type !== null && requiresPrice(draft.type) && draft.price.trim()
          ? Number(draft.price.replace(/\D/g, ''))
          : null,
      neighborhoodId: draft.neighborhoodId,
      photoFileName: draft.photoFileName,
    });
    const parsedAuthor = listingAuthorSchema.safeParse({ firstName, phone });

    if (!parsedDraft.success) {
      setError(parsedDraft.error.issues[0]?.message ?? 'Vérifiez votre annonce.');
      return;
    }
    if (!parsedAuthor.success) {
      setError(parsedAuthor.error.issues[0]?.message ?? 'Vérifiez vos coordonnées.');
      return;
    }

    setError(null);
    const author = await save(parsedAuthor.data);
    await publish.mutateAsync({ draft: parsedDraft.data, author });
    draft.reset();
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.screen}>
      <PublishStepHeader step={3} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 106 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>APERÇU</Text>
        <Text style={styles.title}>Tout est prêt.</Text>
        <Text style={styles.intro}>
          Vérifiez une dernière fois avant de publier dans votre quartier.
        </Text>

        <View style={styles.previewCard}>
          <Image
            source={draft.photoFileName ? { uri: photoUri(draft.photoFileName) } : fallbackImage}
            style={styles.previewImage}
            contentFit="cover"
          />
          <View style={styles.previewBody}>
            <Text style={styles.badge}>{LISTING_TYPE_LABELS[type].toUpperCase()}</Text>
            <Text style={styles.previewTitle}>{draft.title || 'Votre annonce'}</Text>
            <View style={styles.location}>
              <Icon name="pin" size={14} color={colors.neutral[500]} />
              <Text style={styles.locationLabel}>Dakar · {neighborhoodName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.reviewList}>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Visibilité</Text>
            <Text style={styles.reviewValue}>Dans votre quartier</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Type</Text>
            <Text style={styles.reviewValue}>{LISTING_TYPE_LABELS[type]}</Text>
          </View>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>CONTACT</Text>
          <View style={styles.contactFields}>
            <View style={styles.contactField}>
              <Text style={styles.fieldLabel}>Prénom</Text>
              <TextInput
                accessibilityLabel="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Aminata"
                placeholderTextColor={colors.neutral[400]}
                style={styles.input}
              />
            </View>
            <View style={styles.contactField}>
              <Text style={styles.fieldLabel}>Téléphone (WhatsApp)</Text>
              <TextInput
                accessibilityLabel="Téléphone WhatsApp"
                value={phone}
                onChangeText={setPhone}
                placeholder="+221 77 123 45 67"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottom + spacing[3] }]}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => void submit()}
          disabled={publish.isPending}
        >
          <Text style={styles.primaryLabel}>
            {publish.isPending ? 'Publication…' : 'Publier l’annonce'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[6] },
  eyebrow: {
    color: colors.neutral[400],
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    marginTop: spacing[2],
    color: colors.neutral[900],
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  intro: {
    marginTop: spacing[2],
    color: colors.neutral[500],
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  previewCard: {
    marginTop: spacing[5],
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
  },
  previewImage: { width: '100%', height: 168 },
  previewBody: { padding: spacing[3] },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.success[100],
    color: colors.success[700],
    fontSize: 10,
    fontWeight: '800',
  },
  previewTitle: {
    marginTop: spacing[2],
    color: colors.neutral[900],
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing[2] },
  locationLabel: { color: colors.neutral[500], fontSize: fontSize.xs },
  reviewList: {
    gap: 1,
    marginTop: spacing[4],
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  reviewRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[0],
  },
  reviewLabel: { color: colors.neutral[400], fontSize: fontSize.xs },
  reviewValue: { color: colors.neutral[800], fontSize: fontSize.xs, fontWeight: '700' },
  contactCard: {
    marginTop: spacing[4],
    padding: spacing[3],
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
  },
  contactLabel: { color: colors.neutral[400], fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  contactFields: { gap: spacing[2], marginTop: spacing[2] },
  contactField: { gap: 4 },
  fieldLabel: { color: colors.neutral[500], fontSize: 10 },
  input: {
    minHeight: 42,
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    color: colors.neutral[900],
    fontSize: fontSize.xs,
  },
  error: { marginTop: spacing[3], color: colors.danger[700], fontSize: fontSize.xs },
  footer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    backgroundColor: colors.neutral[50],
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.primary[500],
  },
  primaryLabel: { color: colors.neutral[0], fontSize: fontSize.base, fontWeight: '700' },
});
