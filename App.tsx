import { useState } from 'react';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import FoundationScreen from './screens/FoundationScreen';
import WallsScreen from './screens/WallsScreen';
import WindowsScreen from './screens/WindowsScreen';
import RoofScreen from './screens/RoofScreen';
import LastLevelScreen from './screens/LastLevelScreen';
import * as ScreenOrientation from 'expo-screen-orientation';

type ScreenName =
  | 'splash'
  | 'home'
  | 'foundation'
  | 'walls'
  | 'windows'
  | 'roof'
  | 'last';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');

  switch (currentScreen) {
    case 'splash':
      return (
        <SplashScreen
          onContinue={async () => {
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.LANDSCAPE
            );
            setCurrentScreen('home');
          }}
        />
      );

    case 'home':
      return <HomeScreen onStart={() => setCurrentScreen('foundation')} />;

    case 'foundation':
      return <FoundationScreen onNext={() => setCurrentScreen('walls')} />;

    case 'walls':
      return <WallsScreen onNext={() => setCurrentScreen('windows')} />;

    case 'windows':
      return <WindowsScreen onNext={() => setCurrentScreen('roof')} />;

    case 'roof':
      return <RoofScreen onNext={() => setCurrentScreen('last')} />;

    case 'last':
      return <LastLevelScreen onNext={() => setCurrentScreen('home')} />;


    default:
        return (
          <SplashScreen
            onContinue={async () => {
              await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.LANDSCAPE
          );
          setCurrentScreen('home');
        }}
      />
    );
  }
}