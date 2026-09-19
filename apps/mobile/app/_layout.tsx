import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShadowVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="listing/[id]" options={{ title: 'Annonce' }} />
          {/* Modal routes rather than Modal components: the Android back
              button then works without any extra code. */}
          <Stack.Screen name="publish" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="publish-details" options={{ headerShown: false }} />
          <Stack.Screen name="publish-confirm" options={{ headerShown: false }} />
          <Stack.Screen
            name="neighborhood"
            options={{ title: 'Choisir un quartier', presentation: 'modal' }}
          />
        </Stack>
      </AppProviders>
    </SafeAreaProvider>
  );
}
