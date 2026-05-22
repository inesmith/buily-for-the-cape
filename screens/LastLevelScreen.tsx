import { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';

import RoofBase from '../assets/roof.svg';

type LastLevelScreenProps = {
  onNext: () => void;
};

export default function LastLevelScreen({ onNext }: LastLevelScreenProps) {
  const [showHint, setShowHint] = useState(false);
  const [showWind, setShowWind] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showClimate, setShowClimate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const [fontsLoaded] = useFonts({
    Quicksand: require('../assets/fonts/Quicksand-VariableFont_wght.ttf'),
    MonteCarlo: require('../assets/fonts/MonteCarlo-Regular.ttf'),
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

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
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

            <View style={styles.optionItemSelected}>
                <Text style={styles.optionLabelSelected}>Roof Complete</Text>
            </View>
            </View>

          <View style={styles.buildArea}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoText}>
                The building is now complete.{'\n'}
                {'\n'}Each layer worked with the Cape environment — from wind resistance and thermal comfort to climate response and architectural authenticity.
              </Text>
            </View>

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

            <View style={styles.tempWrapper}>
              {showTemp && (
                <View style={styles.tempExpanded}>
                  <Text style={styles.tempText}>Temperature{'\n'}Comfort</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowTemp(!showTemp);
                }}
                style={styles.tempButtonOverlay}
              >
                <View style={styles.tempButton}>
                  <Text style={styles.tempIcon}>🌡️</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.climateWrapper}>
              {showClimate && (
                <View style={styles.climateExpanded}>
                  <Text style={styles.climateText}>Climate{'\n'}Control</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowClimate(!showClimate);
                }}
                style={styles.climateButtonOverlay}
              >
                <View style={styles.climateButton}>
                  <Text style={styles.climateIcon}>❄️</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.authWrapper}>
              {showAuth && (
                <View style={styles.authExpanded}>
                  <Text style={styles.authText}>Authenticity{'\n'}Check</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowAuth(!showAuth);
                }}
                style={styles.authButtonOverlay}
              >
                <View style={styles.authButton}>
                  <Text style={styles.authIcon}>✓</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.roofWrapper}>
              <View style={styles.roofPosition}>
                <RoofBase width={714} height={356} />
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.hintWrapper}>
                {showHint && (
                  <View style={styles.hintExpanded}>
                    <Text style={styles.hintText}>
                      This final view brings all environmental choices together into one completed Cape Dutch structure.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowHint(!showHint);
                  }}
                  style={styles.hintButtonOverlay}
                >
                  <View style={styles.hintButton}>
                    <Text style={styles.hintIcon}>💡</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={onNext}>
                <View style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>Claim Voucher</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F1EA',
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 22,
  },
  pageLabel: {
    fontFamily: 'Quicksand',
    color: '#F4F1EA',
    fontSize: 18,
    marginBottom: 14,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#F4F1EA',
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
  buildArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 26,
  },
  infoBlock: {
    height: 80,
    marginTop: -30,
    maxWidth: 502,
    backgroundColor: '#F4F1EA',
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
    fontSize: 10,
    color: '#53443D',
    paddingTop: 10,
    paddingBottom: 10,
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
    backgroundColor: '#F4F1EA',
    borderRadius: 40,
    paddingVertical: 13,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F4F1EA',
    marginBottom: -25,
  },
  nextButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#53443D',
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
    backgroundColor: '#AE5037',
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
    backgroundColor: '#AE5037',
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
    backgroundColor: '#AE5037',
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
  tempIcon: {
    fontSize: 25,
    color: '#F4F1EA',
  },
  climateIcon: {
    fontSize: 25,
    color: '#F4F1EA',
  },
  authIcon: {
    fontSize: 25,
    color: '#F4F1EA',
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
});