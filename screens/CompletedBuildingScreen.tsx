import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { BlurView } from 'expo-blur';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import FinalManor from '../assets/FinalManor.png';
import Voucher from '../assets/voucher.png';

export default function CompletedBuildingScreen() {
  const [showVoucherScreen, setShowVoucherScreen] = useState(false);
  const [showWind, setShowWind] = useState(false);

  const [fontsLoaded] = useFonts({
    Quicksand: require('../assets/fonts/Quicksand-VariableFont_wght.ttf'),
    MonteCarlo: require('../assets/fonts/MonteCarlo-Regular.ttf'),
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handleSaveAsPdf = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background: #605C39;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                }
                .card {
                  width: 100%;
                  text-align: center;
                }
                .title {
                  font-family: Arial, sans-serif;
                  color: white;
                  font-size: 24px;
                  margin-bottom: 24px;
                }
                .note {
                  font-family: Arial, sans-serif;
                  color: white;
                  font-size: 14px;
                  margin-top: 18px;
                  opacity: 0.9;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="title">Groot Constantia Wine Voucher</div>
                <div class="note">Voucher generated from Built for the Cape</div>
              </div>
            </body>
          </html>
        `,
      });

      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert('Unable to share', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save your Groot Constantia voucher',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not create the PDF.');
    }
  };

  if (!fontsLoaded) return null;

  if (showVoucherScreen) {
    return (
      <SafeAreaView style={styles.successContainer} edges={['left', 'right']}>
        <View style={styles.successInner}>
          <View style={styles.voucherPosition}>
            <Image
              source={Voucher}
              style={styles.voucherImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity onPress={handleSaveAsPdf} style={styles.saveButtonWrapper}>
            <BlurView intensity={50} tint="light" style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save as PDF</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.manorWrapper}>
        {!showVoucherScreen && (
          <View style={styles.windWrapper}>
            {showWind && (
              <View style={styles.windExpanded}>
                <Text style={styles.windText}>Wind{'\n'}Durable</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowWind(!showWind);
              }}
              style={styles.windButtonOverlay}
            >
              <View style={styles.windButton}>
                <Text style={styles.windIcon}>💨</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {!showVoucherScreen && (
          <View style={styles.tempWrapper}>
            {showWind && (
              <View style={styles.tempExpanded}>
                <Text style={styles.tempText}>Temperature{'\n'}Comfort</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowWind(!showWind);
              }}
              style={styles.tempButtonOverlay}
            >
              <View style={styles.tempButton}>
                <Text style={styles.tempIcon}>🌡️</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {!showVoucherScreen && (
          <View style={styles.authWrapper}>
            {showWind && (
              <View style={styles.authExpanded}>
                <Text style={styles.authText}>Authentication{'\n'}Approved</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowWind(!showWind);
              }}
              style={styles.authButtonOverlay}
            >
              <View style={styles.authButton}>
                <Text style={styles.authIcon}>✔️</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {!showVoucherScreen && (
          <View style={styles.climateWrapper}>
            {showWind && (
              <View style={styles.climateExpanded}>
                <Text style={styles.climateText}>Climate{'\n'}Control</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowWind(!showWind);
              }}
              style={styles.climateButtonOverlay}
            >
              <View style={styles.climateButton}>
                <Text style={styles.climateIcon}>❄️</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.manorPosition}>
          <Image source={FinalManor} style={styles.manorImage} resizeMode="contain" />
        </View>

        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => setShowVoucherScreen(true)}
        >
          <BlurView intensity={50} tint="light" style={styles.button}>
            <Text style={styles.buttonText}>Claim Voucher</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1EA',
  },
  manorWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -60,
    marginBottom: -25,
    position: 'relative',
  },
  manorPosition: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    marginLeft: 100,
  },
  manorImage: {
    height: 380,
  },
  buttonWrapper: {
    marginTop: 30,
  },
  button: {
    overflow: 'hidden',
    backgroundColor: '#799CB2',
    minWidth: 100,
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 50,
    borderWidth: 1,
    borderColor: '#f4f1eac7',
    marginTop: -75,
    marginLeft: 75,
  },
  buttonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#F4F1EA',
  },

  successContainer: {
    flex: 1,
    backgroundColor: '#605C39',
  },
  successInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  voucherPosition: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  saveButtonWrapper: {
    marginTop: 30,
  },
  saveButton: {
    overflow: 'hidden',
    backgroundColor: 'rgba(244, 241, 234, 0.25)',
    minWidth: 100,
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginTop: -40,
  },
  saveButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#F4F1EA',
  },
  voucherImage: {
    width: 760,
    height: 360,
    marginTop: 5,
    marginLeft: 10,
  },

  windButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: '#AE5037',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  windIcon: {
    fontSize: 25,
    color: '#F4F1EA',
  },
  windWrapper: {
    position: 'absolute',
    top: 55,
    right: -5,
    width: 210,
    height: 50,
    justifyContent: 'center',
    zIndex: 10,
  },
  windButtonOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  windExpanded: {
    height: 50,
    width: 164,
    backgroundColor: '#AE5037',
    borderRadius: 40,
    justifyContent: 'center',
    paddingLeft: 26,
    paddingRight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
    marginLeft: 45,
  },
  windText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 13,
  },
  tempWrapper: {
    position: 'absolute',
    top: 125,
    right: -5,
    width: 210,
    height: 50,
    justifyContent: 'center',
    zIndex: 10,
  },
  tempButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: '#AE5037',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  tempIcon: {
    fontSize: 25,
    color: '#F4F1EA',
  },
  tempButtonOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  tempExpanded: {
    height: 50,
    width: 164,
    backgroundColor: '#AE5037',
    borderRadius: 40,
    justifyContent: 'center',
    paddingLeft: 26,
    paddingRight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
    marginLeft: 45,
  },
  tempText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 13,
  },
  climateWrapper: {
    position: 'absolute',
    top: 195,
    right: -5,
    width: 210,
    height: 50,
    justifyContent: 'center',
    zIndex: 10,
  },
  climateButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: '#AE5037',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  climateIcon: {
    fontSize: 25,
    color: '#F4F1EA',
  },
  climateButtonOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  climateExpanded: {
    height: 50,
    width: 164,
    backgroundColor: '#AE5037',
    borderRadius: 40,
    justifyContent: 'center',
    paddingLeft: 26,
    paddingRight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
    marginLeft: 45,
  },
  climateText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 13,
  },
  authWrapper: {
    position: 'absolute',
    top: 265,
    right: -5,
    width: 210,
    height: 50,
    justifyContent: 'center',
    zIndex: 10,
  },
  authButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: '#AE5037',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  authIcon: {
    fontSize: 25,
    color: '#F4F1EA',
  },
  authButtonOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  authExpanded: {
    height: 50,
    width: 164,
    backgroundColor: '#AE5037',
    borderRadius: 40,
    justifyContent: 'center',
    paddingLeft: 26,
    paddingRight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
    marginLeft: 45,
  },
  authText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 13,
  },
});