import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Asset } from 'expo-asset';
import { DarkTheme, Tabs, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#ffd33d',
    background: '#25292e',
    card: '#25292e',
    text: '#fff',
    border: '#25292e',
  },
};

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let mounted = true;
    let frame: number | undefined;
    // Include the splash in the client assets and load it before dismissing the HTML splash.
    void Asset.loadAsync(require('../../assets/images/splash-icon.png'))
      .catch(() => null)
      .then(() => {
        if (mounted) {
          frame = requestAnimationFrame(() => document.getElementById('web-splash')?.remove());
        }
      });

    return () => {
      mounted = false;
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={appTheme}>
        <StatusBar style="light" />
        <Tabs
          initialRouteName="index"
          screenOptions={{
            headerStyle: { backgroundColor: '#25292e' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
            sceneStyle: { backgroundColor: '#25292e' },
            tabBarStyle: { backgroundColor: '#25292e', borderTopWidth: 0 },
            tabBarActiveTintColor: '#ffd33d',
            tabBarInactiveTintColor: '#fff',
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="about"
            options={{
              title: 'About',
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="info-circle" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
