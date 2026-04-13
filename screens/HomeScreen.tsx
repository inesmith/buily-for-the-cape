import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { BlurView } from 'expo-blur';

type HomeScreenProps = {
  onStart: () => void;
};

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    MonteCarlo: require('../assets/fonts/MonteCarlo-Regular.ttf'),
    Quicksand: require('../assets/fonts/Quicksand-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    const setLandscape = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
      setIsReady(true);
    };

    setLandscape();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  if (!fontsLoaded || !isReady) return null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.inner}>
        <Image
          source={require('../assets/building.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.subtitle}>
          Rebuild Groot Constantia and discover how{'\n'}
          architecture responds to climate
        </Text>

        <TouchableOpacity onPress={onStart} style={styles.buttonWrapper}>
        <BlurView intensity={50} tint="light" style={styles.button}>
        <Text style={styles.buttonText}>Start Build</Text>
        </BlurView>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#605C39',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  image: {
    height: 450,
    marginTop: -90,
  },
  subtitle: {
    fontFamily: 'Quicksand',
    fontSize: 16,
    lineHeight: 23,
    color: '#F4F1EA',
    textAlign: 'center',
    marginTop: -130,
  },
  buttonWrapper: {
    marginTop: 40,
  },
  button: {
  overflow: 'hidden', // IMPORTANT for blur
  backgroundColor: 'rgba(244, 241, 234, 0.25)', // lighter glass
  minWidth: 100,
  paddingVertical: 13,
  paddingHorizontal: 30,
  borderRadius: 40,
  alignItems: 'center',
  justifyContent: 'center',

  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.4)', // glass edge highlight

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 6,
},
  buttonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#605C39',
    fontWeight: '500',
  },
});