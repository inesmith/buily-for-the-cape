import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Image, Modal, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';

type Props = {
  onContinue: () => void;
};

export default function SplashScreen({ onContinue }: Props) {
  const [showRotateModal, setShowRotateModal] = useState(false);

  const [fontsLoaded] = useFonts({
    MonteCarlo: require('../assets/fonts/MonteCarlo-Regular.ttf'),
    Quicksand: require('../assets/fonts/Quicksand-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRotateModal(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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

      <Modal visible={showRotateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Rotate Your Phone</Text>

            <Text style={styles.modalText}>
              For the best experience, please rotate your phone to landscape mode before continuing.
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={onContinue}>
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingRight: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#F4F1EA',
    textAlign: 'center',
    fontFamily: 'Quicksand',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: '#F4F1EA',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontFamily: 'Quicksand',
    color: '#605C39',
    fontSize: 18,
    marginBottom: 14,
    fontWeight: '600',
  },
  modalText: {
    fontSize: 14,
    color: '#2B2B2B',
    textAlign: 'center',
    fontFamily: 'Quicksand',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#605C39',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  modalButtonText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 14,
  },
});