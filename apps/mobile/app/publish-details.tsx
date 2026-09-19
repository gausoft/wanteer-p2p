import { useState, type ReactNode } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  DEFAULT_NEIGHBORHOOD_ID,
  findNeighborhood,
  SENEGAL_NEIGHBORHOODS,
} from '@p2p-local/config';
import { colors, fontSize, radius, spacing } from '@p2p-local/design-tokens';
import { requiresPrice } from '@p2p-local/types';
import { NeighborhoodSheet } from '@/components/neighborhood-sheet';
import { Icon } from '@/components/icon';
import { PublishStepHeader } from '@/components/publish-step-header';
import { draftListingSchema } from '@/features/listings/listing.schema';
import { photoUri, pickPhotoFromLibrary, takePhoto } from '@/lib/photos';
import { useListingDraft } from '@/stores/listing-draft.store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PublishDetailsScreen() {
  const { bottom } = useSafeAreaInsets();
  const draft = useListingDraft();
  const [isNeighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const neighborhoodName = findNeighborhood(draft.neighborhoodId)?.name ?? 'Choisir un quartier';

  function continueToConfirmation(): void {
    const parsed = draftListingSchema.safeParse({
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

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Vérifiez les champs obligatoires.');
      return;
    }

    setError(null);
    router.push('/publish-confirm');
  }

  async function selectPhoto(select: () => Promise<string | null>): Promise<void> {
    const fileName = await select();
    if (fileName !== null) draft.update({ photoFileName: fileName });
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      <PublishStepHeader step={2} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 106 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>VOTRE ANNONCE</Text>
        <Text style={styles.title}>Donnez envie de répondre.</Text>
        <Text style={styles.intro}>Une photo et quelques mots suffisent.</Text>

        <View style={styles.photoUploader}>
          {draft.photoFileName ? (
            <Image
              source={{ uri: photoUri(draft.photoFileName) }}
              style={styles.photo}
              contentFit="cover"
            />
          ) : (
            <View style={styles.emptyPhoto}>
              <Icon name="tag" size={28} color={colors.neutral[400]} />
              <Text style={styles.emptyPhotoLabel}>Ajoutez une photo</Text>
            </View>
          )}
        </View>
        <View style={styles.photoActions}>
          <Pressable style={styles.photoAction} onPress={() => void selectPhoto(takePhoto)}>
            <Text style={styles.photoActionLabel}>Prendre une photo</Text>
          </Pressable>
          <Pressable
            style={styles.photoAction}
            onPress={() => void selectPhoto(pickPhotoFromLibrary)}
          >
            <Text style={styles.photoActionLabel}>Choisir une image</Text>
          </Pressable>
        </View>

        <Field label="Titre">
          <TextInput
            accessibilityLabel="Titre de l'annonce"
            value={draft.title}
            onChangeText={(title) => draft.update({ title })}
            placeholder="Ex. Manuel Mathématiques 3ème"
            placeholderTextColor={colors.neutral[400]}
            style={styles.input}
          />
        </Field>
        <Field label="Description">
          <TextInput
            accessibilityLabel="Description de l'annonce"
            value={draft.description}
            onChangeText={(description) => draft.update({ description })}
            placeholder="Décrivez l'état, la taille ou ce qui est important…"
            placeholderTextColor={colors.neutral[400]}
            multiline
            style={[styles.input, styles.multiline]}
          />
        </Field>
        {draft.type === 'SALE' ? (
          <Field label="Prix coûtant" hint="pour ce type uniquement">
            <View style={styles.priceField}>
              <TextInput
                accessibilityLabel="Prix coûtant en FCFA"
                value={draft.price}
                onChangeText={(price) => draft.update({ price: price.replace(/\D/g, '') })}
                placeholder="0"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="number-pad"
                style={[styles.input, styles.priceInput]}
              />
              <Text style={styles.currency}>FCFA</Text>
            </View>
          </Field>
        ) : null}

        <Pressable style={styles.locality} onPress={() => setNeighborhoodOpen(true)}>
          <View>
            <Text style={styles.localityLabel}>LOCALITÉ</Text>
            <Text style={styles.localityValue}>Dakar · {neighborhoodName}</Text>
          </View>
          <Icon name="arrow-right" size={18} color={colors.neutral[500]} />
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottom + spacing[3] }]}>
        <Pressable style={styles.primaryButton} onPress={continueToConfirmation}>
          <Text style={styles.primaryLabel}>Continuer</Text>
        </Pressable>
      </View>

      <NeighborhoodSheet
        visible={isNeighborhoodOpen}
        selected={neighborhoodName}
        bottomInset={bottom}
        onClose={() => setNeighborhoodOpen(false)}
        onSelect={(name) => {
          const neighborhood = SENEGAL_NEIGHBORHOODS.find((item) => item.name === name);
          draft.update({ neighborhoodId: neighborhood?.id ?? DEFAULT_NEIGHBORHOOD_ID });
          setNeighborhoodOpen(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

type FieldProps = { label: string; hint?: string; children: ReactNode };

function Field({ label, hint, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {hint ? <Text style={styles.fieldHint}> · {hint}</Text> : null}
      </Text>
      {children}
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
  intro: { marginTop: spacing[2], color: colors.neutral[500], fontSize: fontSize.sm },
  photoUploader: {
    height: 165,
    marginTop: spacing[5],
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  photo: { width: '100%', height: '100%' },
  emptyPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[2] },
  emptyPhotoLabel: { color: colors.neutral[500], fontSize: fontSize.xs },
  photoActions: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] },
  photoAction: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  photoActionLabel: { color: colors.primary[700], fontSize: fontSize.xs, fontWeight: '700' },
  field: { gap: spacing[1], marginTop: spacing[4] },
  fieldLabel: { color: colors.neutral[900], fontSize: fontSize.xs, fontWeight: '700' },
  fieldHint: { color: colors.neutral[400], fontSize: 10, fontWeight: '500' },
  input: {
    minHeight: 46,
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
    color: colors.neutral[900],
    fontSize: fontSize.sm,
  },
  multiline: { minHeight: 100, paddingTop: spacing[3], textAlignVertical: 'top' },
  priceField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
  },
  priceInput: { flex: 1 },
  currency: { paddingRight: spacing[3], color: colors.neutral[500], fontSize: fontSize.xs },
  locality: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[4],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
  },
  localityLabel: { color: colors.neutral[400], fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  localityValue: {
    marginTop: 3,
    color: colors.neutral[900],
    fontSize: fontSize.sm,
    fontWeight: '600',
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
