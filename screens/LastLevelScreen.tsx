import { useEffect, useRef, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ImageBackground } from 'react-native';
import { Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import Voucher from '../assets/voucher.png';

import RoofBase from '../assets/roof.svg';
import StoneFoundation from '../assets/foundation-stone.svg';
import LimeWashedWalls from '../assets/lime-wall.svg';
import ThatchedRoof from '../assets/thatched-roof.svg';
import WoodenFrames from '../assets/wooden-frame.svg';
import BackgroundImage from '../assets/bg.png';
import HomeScreen from './HomeScreen';

type LastLevelScreenProps = {
  onNext: () => void;
};

export default function LastLevelScreen({ onNext }: LastLevelScreenProps) {
  const [showHint, setShowHint] = useState(false);
  const [showWind, setShowWind] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showClimate, setShowClimate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showIntroScreen, setShowIntroScreen] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showVoucherScreen, setShowVoucherScreen] = useState(false);

  const [fontsLoaded] = useFonts({
    Quicksand: require('../assets/fonts/Quicksand-VariableFont_wght.ttf'),
    MonteCarlo: require('../assets/fonts/MonteCarlo-Regular.ttf'),
    MaterialSymbolsOutlined: require('../assets/fonts/MaterialSymbolsOutlined.ttf'),
  });

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSaveVoucherPdf = async () => {
    const html = `
      <html>
        <body style="margin:0; padding:40px; background:#605C39; display:flex; justify-content:center; align-items:center;">
          <img src="voucher.png" style="width:700px; height:auto;" />
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };

  if (!fontsLoaded) return null;

  if (showIntroScreen) {
    return (
      <SafeAreaView style={styles.completedIntroContainer} edges={['left', 'right']}>
        <View style={styles.completedIntroInner}>
          <Text style={styles.completedIntroTitle}>Congratulations!</Text>

          <Text style={styles.completedIntroText}>
            The Groot Constantia Manor building is now complete.
            {'\n'}Each layer worked with the Cape environment — from wind resistance and thermal comfort to climate response and architectural authenticity.
          </Text>

          <TouchableOpacity
            onPress={() => setShowIntroScreen(false)}
            style={styles.completedIntroButton}
          >
            <Text style={styles.completedIntroButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showVoucherScreen) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#605C39' }]}>
        <View style={styles.voucherScreenWrapper}>
        <Image
          source={Voucher}
          style={styles.voucherImage}
          resizeMode="contain"
        />

        <View style={styles.voucherButtonsRow}>
          <TouchableOpacity
            onPress={handleSaveVoucherPdf}
            style={styles.savePdfButton}
          >
            <Text style={styles.savePdfButtonText}>Save as PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={BackgroundImage}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
      <View style={styles.screen}>
        <Text style={styles.pageLabel}>Building Page</Text>

        <View style={styles.canvas}>
          <View style={styles.levelIndicator}>
            <Text style={styles.levelIndicatorText}>Completed</Text>
          </View>

            <View style={styles.optionCard}>
              <Text style={styles.optionTitle}>
                The materials{'\n'}used to build{'\n'}Groot Constantia
              </Text>

              <View style={[styles.optionItem, styles.stoneOption]}>
                <View style={styles.iconWrapper}>
                  <StoneFoundation width={90} height={60} />
                </View>
                <Text style={[styles.optionLabel, styles.stoneOptionText]}>Stone</Text>
              </View>

              <View style={[styles.optionItem, styles.limeOption]}>
                <View style={styles.iconWrapper}>
                  <LimeWashedWalls width={90} height={60} />
                </View>
                <Text style={[styles.optionLabel, styles.limeOptionText]}>Lime Washed</Text>
              </View>

              <View style={[styles.optionItem, styles.woodenFramesOption]}>
                <View style={styles.iconWrapper}>
                  <WoodenFrames width={90} height={70} />
                </View>
                <Text style={[styles.optionLabel, styles.woodenFramesOptionText]}>Wooden Frames</Text>
              </View>

              <View style={[styles.optionItem, styles.thatchedRoofOption]}>
                <View style={styles.iconWrapper}>
                  <ThatchedRoof width={90} height={60} />
                </View>
                <Text style={[styles.optionLabel, styles.thatchedRoofOptionText]}>Thatched Roof</Text>
              </View>
            </View>

          <View style={styles.buildArea}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoText}>
                This final view brings all environmental choices together into one completed Cape Dutch structure.
              </Text>
            </View>

            <View style={styles.roofWrapper}>
              <View style={styles.roofPosition}>
                <RoofBase width={714} height={356} />
              </View>
            </View>

            <View style={styles.bottomRow}>

          <View style={styles.bottomWeatherIcons}>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowTemp(!showTemp);
                setShowWind(false);
                setShowClimate(false);
                setShowAuth(false);
              }}
              style={styles.weatherConditionItem}
            >
              <View style={styles.tempButton}>
                <Text style={styles.tempIcon}>device_thermostat</Text>
              </View>

              {showTemp && (
                <View style={styles.bottomWeatherExpanded}>
                  <Text style={styles.bottomWeatherText}>Temperature{'\n'}Comfort</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowWind(!showWind);
                setShowTemp(false);
                setShowClimate(false);
                setShowAuth(false);
              }}
              style={styles.weatherConditionItem}
            >
              <View style={styles.windButton}>
                <Text style={styles.windIcon}>air</Text>
              </View>

              {showWind && (
                <View style={styles.bottomWeatherExpanded}>
                  <Text style={styles.bottomWeatherText}>Wind Durable</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowAuth(!showAuth);
                setShowWind(false);
                setShowTemp(false);
                setShowClimate(false);
              }}
              style={styles.weatherConditionItem}
            >
              <View style={styles.authButton}>
                <Text style={styles.authIcon}>verified</Text>
              </View>

              {showAuth && (
                <View style={styles.bottomWeatherExpanded}>
                  <Text style={styles.bottomWeatherText}>Authenticity {'\n'}Check</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowClimate(!showClimate);
                setShowWind(false);
                setShowTemp(false);
                setShowAuth(false);
              }}
              style={styles.weatherConditionItem}
            >
              <View style={styles.climateButton}>
                <Text style={styles.climateIcon}>airwave</Text>
              </View>

              {showClimate && (
                <View style={styles.bottomWeatherExpanded}>
                  <Text style={styles.bottomWeatherText}>Climate Control</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setShowVoucherScreen(true)}>
            <Animated.View
              style={[
                styles.nextButton,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.nextButtonText}>Claim Voucher</Text>
            </Animated.View>
          </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f1ea4e',
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 22,
  },
  pageLabel: {
    fontFamily: 'Quicksand',
    color: 'transparent',
    fontSize: 18,
    marginBottom: 14,
  },
  canvas: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  optionCard: {
    width: 150,
    marginLeft: -10,
    marginTop: -30,
    marginBottom: 0,
    backgroundColor: '#F4F1EA',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  optionTitle: {
    fontFamily: 'Quicksand',
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: '#C77754',
    marginTop: -10,
    paddingBottom: 10,
    fontWeight: 'bold',
  },
  optionItem: {
    width: '100%',
    height: 90,
    alignItems: 'center',
    borderRadius: 18,
    marginTop: -10,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingTop: 8,
  },
  optionItemSelected: {
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  iconWrapper: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionImage: {
    width: 90,
    height: 60,
    marginBottom: 6,
  },
  optionLabel: {
    fontFamily: 'Quicksand',
    fontSize: 10,
    color: '#C77754',
  },
  optionLabelSelected: {
    color: '#AE5037',
  },
  stoneOption: {
    marginTop: -10,
    marginLeft: -5,
  },
  stoneOptionText: {
    marginTop: 0,
    marginLeft: 0,
  },
  limeOption: {
    marginTop: -15,
    marginLeft: -10,
  },
  limeOptionText: {
    marginTop: 5,
    marginLeft: 5,
  },
  woodenFramesOption: {
    marginTop: -3,
    marginLeft: 0,
  },
  woodenFramesOptionText: {
    marginTop: 0,
    marginLeft: 0,
  },
  thatchedRoofOption: {
    marginTop: -13,
    marginLeft: -5,
  },
  thatchedRoofOptionText: {
    marginTop: 0,
    marginLeft: 0,
  },
  buildArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 26,
  },
  infoBlock: {
    height: 70,
    marginTop: -30,
    maxWidth: 502,
    backgroundColor: '#799CB2',
    borderRadius: 28,
    paddingHorizontal: 24,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  infoText: {
    fontFamily: 'Quicksand',
    fontSize: 12,
    color: '#F4F1EA',
    paddingTop: 10,
    paddingBottom: 10,
    lineHeight: 18,
    fontWeight: '500',
  },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

  },
    hintButton: {
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
  hintIcon: {
    fontSize: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
    hintExpanded: {
    height: 50,
    width: 500,
    backgroundColor: '#AE5037',
    borderRadius: 40,
    justifyContent: 'center',
    paddingHorizontal: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  hintText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 12,
  },
    hintWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: -25,
  },
  hintButtonOverlay: {
    position: 'absolute',
    left: 0,
    zIndex: 2,
  },
  roofWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -50,
    marginBottom: 0,
    position: 'relative',
  },
  roofPosition: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    marginLeft: -1,
  },
  nextButton: {
    minWidth: 100,
    maxHeight: 50,
    backgroundColor: '#AE5037',
    borderRadius: 40,
    paddingVertical: 13,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -25,
    marginRight: 25,
  },
  nextButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#F4F1EA',
  },
  levelIndicator: {
    width: 90,
    height: 130,
    marginLeft: 25,
    marginTop: -30,
    marginRight: -35,
    backgroundColor: '#F4F1EA',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  levelIndicatorText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#53443D',
    transform: [{ rotate: '-90deg' }],
    marginLeft: -40,
  },
  windWrapper: {
    position: 'absolute',
    top: 0,
    right: 28,
    width: 210,
    height: 50,
    justifyContent: 'center',
    zIndex: 10,
  },
  tempWrapper: {
    position: 'absolute',
    top: 70,
    right: 28,
    width: 210,
    height: 50,
    justifyContent: 'center',
    zIndex: 10,
  },
  climateWrapper: {
    position: 'absolute',
    top: 140,
    right: 28,
    width: 210,
    height: 50,
    justifyContent: 'center',
    zIndex: 10,
  },
  authWrapper: {
    position: 'absolute',
    top: 210,
    right: 28,
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
  tempButtonOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  climateButtonOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  authButtonOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  windButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: '#605C39',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  tempButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: '#605C39',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  climateButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: '#605C39',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  authButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: '#605C39',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
windIcon: {
  fontFamily: 'MaterialSymbolsOutlined',
  fontSize: 28,
  color: '#F4F1EA',
},

tempIcon: {
  fontFamily: 'MaterialSymbolsOutlined',
  fontSize: 28,
  color: '#F4F1EA',
},

climateIcon: {
  fontFamily: 'MaterialSymbolsOutlined',
  fontSize: 28,
  color: '#F4F1EA',
},

authIcon: {
  fontFamily: 'MaterialSymbolsOutlined',
  fontSize: 28,
  color: '#F4F1EA',
},
  windText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 13,
  },
  tempText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 13,
  },
  climateText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 13,
  },
  authText: {
    color: '#F4F1EA',
    fontFamily: 'Quicksand',
    fontSize: 13,
  },
  completedIntroContainer: {
  flex: 1,
  backgroundColor: '#AE5037',
},

completedIntroInner: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 40,
},

completedIntroTitle: {
  fontFamily: 'Quicksand',
  fontSize: 30,
  color: '#F4F1EA',
  fontWeight: '600',
  marginBottom: 20,
  marginTop: -60,
},

completedIntroText: {
  fontFamily: 'Quicksand',
  fontSize: 18,
  lineHeight: 28,
  color: '#F4F1EA',
  textAlign: 'center',
  maxWidth: 760,
  marginBottom: 30,
},

completedIntroButton: {
  position: 'absolute',
  bottom: 41,
  backgroundColor: '#F4F1EA',
  minWidth: 140,
  paddingVertical: 14,
  paddingHorizontal: 30,
  borderRadius: 40,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
},

completedIntroButtonText: {
  fontFamily: 'Quicksand',
  fontSize: 18,
  color: '#AE5037',
  fontWeight: '600',
},

weatherRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14,
  marginBottom: -20,
  marginLeft: 120,
},

weatherIcon: {
  fontSize: 26,
},

bottomWeatherIcons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15,
  marginBottom: -25,
  marginLeft: 30,
},

weatherConditionItem: {
  flexDirection: 'row',
  alignItems: 'center',
},

bottomWeatherExpanded: {
  height: 50,
  backgroundColor: '#605C39',
  borderRadius: 40,
  justifyContent: 'center',
  paddingLeft: 18,
  paddingRight: 22,
  marginLeft: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.14,
  shadowRadius: 6,
  elevation: 5,
},

bottomWeatherText: {
  color: '#F4F1EA',
  fontFamily: 'Quicksand',
  fontSize: 13,
},

voucherImage: {
  width: 700,
  height: 400,
  alignSelf: 'center',
  marginTop: -30,
},

container: {
  flex: 1,
},

voucherScreenWrapper: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},

savePdfButton: {
  backgroundColor: '#F4F1EA',
  paddingVertical: 14,
  paddingHorizontal: 30,
  borderRadius: 40,
  marginTop: 0,
},

savePdfButtonText: {
  fontFamily: 'Quicksand',
  fontSize: 16,
  color: '#605C39',
  fontWeight: '600',
},

voucherButtonsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  marginTop: -40,
},

doneButton: {
  backgroundColor: '#AE5037',
  paddingVertical: 14,
  paddingHorizontal: 35,
  borderRadius: 40,
},

doneButtonText: {
  fontFamily: 'Quicksand',
  fontSize: 16,
  color: '#F4F1EA',
  fontWeight: '600',
},
});