import { useEffect, useState } from 'react';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import FoundationScreen from './screens/FoundationScreen';
import WallsScreen from './screens/WallsScreen';
import WindowsScreen from './screens/WindowsScreen';
import RoofScreen from './screens/RoofScreen';
import CompletedBuildingScreen from './screens/CompletedBuildingScreen';

type ScreenName =
  | 'splash'
  | 'home'
  | 'foundation'
  | 'walls'
  | 'windows'
  | 'roof'
  | 'completed';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen('home');
    }, 4300);

    return () => clearTimeout(timer);
  }, []);

  switch (currentScreen) {
    case 'splash':
      return <SplashScreen />;

    case 'home':
      return <HomeScreen onStart={() => setCurrentScreen('foundation')} />;

    case 'foundation':
      return <FoundationScreen onNext={() => setCurrentScreen('walls')} />;

    case 'walls':
      return <WallsScreen onNext={() => setCurrentScreen('windows')} />;

    case 'windows':
      return <WindowsScreen onNext={() => setCurrentScreen('roof')} />;

    case 'roof':
      return <RoofScreen onNext={() => setCurrentScreen('completed')} />;

    case 'completed':
      return <CompletedBuildingScreen />;

    default:
      return <SplashScreen />;
  }
}