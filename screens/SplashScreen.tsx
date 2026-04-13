import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Image } from 'react-native';

export default function SplashScreen() {
   const [fontsLoaded] = useFonts({
  MonteCarlo: require('../assets/fonts/MonteCarlo-Regular.ttf'),
  Quicksand: require('../assets/fonts/Quicksand-VariableFont_wght.ttf'),
});

if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Image
          source={require('../assets/building.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Built for the Cape</Text>

        <Text style={styles.subtitle}>
          Reconstructing Environmental Intelligence at{"\n"}
          Groot Constantia
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#605C39',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    height: 300,
    marginTop: -60,
  },
  title: {
    fontSize: 36,
    color: '#F4F1EA',
    fontFamily: 'MonteCarlo',
    marginTop: -80,
  },
  subtitle: {
    fontSize: 14,
    color: '#F4F1EA',
    textAlign: 'center',
    fontFamily: 'Quicksand',
    lineHeight: 20,
  },
});