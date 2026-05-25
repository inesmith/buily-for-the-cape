import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, Animated, ImageBackground, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import ThatchedRoof from '../assets/thatched-roof.svg';
import ClayTileRoof from '../assets/clay-tile-roof.svg';
import MetalRoof from '../assets/metal-roof.svg';
import ConcreteRoof from '../assets/concrete-roof.svg';
import RoofBase from '../assets/roof.svg';
import WindowBase from '../assets/windows.svg';
import BackgroundImage from '../assets/bg.png';

import ClayTilesRoofChose from '../assets/clay-tiles-roof-chosen.png';
import ClayTilesRoofCracked from '../assets/clay-tiles-roof-cracked.png';
import MetalRoofChosen from '../assets/metal-roof-chosen.png';
import MetalRoofCracked from '../assets/metal-roof-cracked.png';
import ConcreteRoofChosen from '../assets/concrete-roof-chosen.png';
import ConcreteRoofCracked from '../assets/concrete-roof-cracked.png';

type RoofScreenProps = {
  onNext: () => void;
};

type RoofOption = {
  id: string;
  label: string;
  image: any;
  width?: number;
  height?: number;
};

const roofOptions = [
  { id: 'clay-tile', label: 'Clay Tile Roof', image: ClayTileRoof },
  { id: 'thatched', label: 'Thatched Roof', image: ThatchedRoof },
  { id: 'metal', label: 'Metal Roof', image: MetalRoof },
  { id: 'concrete', label: 'Concrete Roof', image: ConcreteRoof },
];

const correctAnswer = 'thatched';
const BUILD_ANIMATION_DURATION = 5000;
const FAILURE_TIMER_SECONDS = 3;
const SUCCESS_DELAY = 1800;

export default function RoofScreen({ onNext }: RoofScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showRoof, setShowRoof] = useState(false);
  const [isAnimatingBuild, setIsAnimatingBuild] = useState(false);
  const [showBuildAnimation, setShowBuildAnimation] = useState(false);
  const [showCrackedRoof, setShowCrackedRoof] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showIntroScreen, setShowIntroScreen] = useState(true);
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const [authUnlocked, setAuthUnlocked] = useState(false);

  const [showWind, setShowWind] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showClimate, setShowClimate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [climatePulseStopped, setClimatePulseStopped] = useState(false);
  const [authPulseStopped, setAuthPulseStopped] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const weatherPulseAnim = useRef(new Animated.Value(1)).current;
  const weatherPulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const buildTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fontsLoaded] = useFonts({
    Quicksand: require('../assets/fonts/Quicksand-VariableFont_wght.ttf'),
    MonteCarlo: require('../assets/fonts/MonteCarlo-Regular.ttf'),
    MaterialSymbolsOutlined: require('../assets/fonts/MaterialSymbolsOutlined.ttf'),
  });

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const clearAllTimers = () => {
    if (buildTimeoutRef.current) clearTimeout(buildTimeoutRef.current);
    if (crackTimeoutRef.current) clearTimeout(crackTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
  };

  const stopWeatherPulse = () => {
    if (weatherPulseLoopRef.current) {
      weatherPulseLoopRef.current.stop();
      weatherPulseLoopRef.current = null;
    }
    weatherPulseAnim.setValue(1);
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
      clearAllTimers();
      stopWeatherPulse();
    };
  }, []);

  useEffect(() => {
    if (selectedOption) {
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [selectedOption]);

  useEffect(() => {
    const shouldPulseClimate = !showIntroScreen && !authUnlocked && !climatePulseStopped;
    const shouldPulseAuth = !showIntroScreen && authUnlocked && !authPulseStopped;

    stopWeatherPulse();

    if (shouldPulseClimate || shouldPulseAuth) {
      weatherPulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(weatherPulseAnim, {
            toValue: 1.12,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(weatherPulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      weatherPulseLoopRef.current.start();
    }

    return () => {
      stopWeatherPulse();
    };
  }, [showIntroScreen, authUnlocked, climatePulseStopped, authPulseStopped]);

  const handleOptionSelect = (optionId: string) => {
    clearAllTimers();

    setSelectedOption(optionId);

    if (optionId === correctAnswer) {
      setShowHint(false);
    }

    setShowRoof(false);
    setShowCrackedRoof(false);
    setCountdown(null);
    setShowSuccessScreen(false);
    setIsAnimatingBuild(true);
    setShowBuildAnimation(true);
    setShowCompletedButton(false);
    setAuthUnlocked(false);
    setAuthPulseStopped(false);
    setShowWind(false);
    setShowTemp(false);
    setShowClimate(false);
    setShowAuth(false);

    buildTimeoutRef.current = setTimeout(() => {
      setShowBuildAnimation(false);
      setShowRoof(true);
      setIsAnimatingBuild(false);

      if (optionId === correctAnswer) {
        setAuthUnlocked(true);

        successTimeoutRef.current = setTimeout(() => {
          setShowCompletedButton(true);

          successTimeoutRef.current = setTimeout(() => {
            setShowSuccessScreen(true);
          }, 1200);
        }, SUCCESS_DELAY);
      }

      if (optionId !== correctAnswer) {
        setCountdown(FAILURE_TIMER_SECONDS);

        countdownIntervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null) return null;
            if (prev <= 1) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        crackTimeoutRef.current = setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setShowCrackedRoof(true);
          setCountdown(null);
        }, FAILURE_TIMER_SECONDS * 1000);
      }
    }, BUILD_ANIMATION_DURATION);
  };

  const getRoofOptionStyle = (optionId: string) => {
    switch (optionId) {
      case 'clay-tile':
        return styles.clayTileOption;
      case 'thatched':
        return styles.thatchedOption;
      case 'metal':
        return styles.metalOption;
      case 'concrete':
        return styles.concreteOption;
      default:
        return null;
    }
  };

  const getRoofOptionTextStyle = (optionId: string) => {
    switch (optionId) {
      case 'clay-tile':
        return styles.clayTileOptionText;
      case 'thatched':
        return styles.thatchedOptionText;
      case 'metal':
        return styles.metalOptionText;
      case 'concrete':
        return styles.concreteOptionText;
      default:
        return null;
    }
  };

  if (!fontsLoaded) return null;

  const renderRoofImage = () => {
    if (!selectedOption || !showRoof) return null;

    if (selectedOption === 'thatched') {
      return (
        <View style={styles.roofPosition}>
          <View style={styles.correctRoofImage}>
            <RoofBase width={710} height={347} />
          </View>
        </View>
      );
    }

    if (selectedOption === 'clay-tile') {
      return (
        <Image
          source={showCrackedRoof ? ClayTilesRoofCracked : ClayTilesRoofChose}
          style={showCrackedRoof ? styles.clayRoofCrackedImage : styles.clayRoofImage}
          resizeMode="contain"
        />
      );
    }

    if (selectedOption === 'metal') {
      return (
        <Image
          source={showCrackedRoof ? MetalRoofCracked : MetalRoofChosen}
          style={showCrackedRoof ? styles.metalRoofCrackedImage : styles.metalRoofImage}
          resizeMode="contain"
        />
      );
    }

    if (selectedOption === 'concrete') {
      return (
        <Image
          source={showCrackedRoof ? ConcreteRoofCracked : ConcreteRoofChosen}
          style={showCrackedRoof ? styles.concreteRoofCrackedImage : styles.concreteRoofImage}
          resizeMode="contain"
        />
      );
    }

    return null;
  };

  if (showSuccessScreen) {
    return (
      <SafeAreaView style={styles.successContainer} edges={['left', 'right']}>
        <View style={styles.successInner}>
          <View style={{ marginTop: 50, marginBottom: -30 }}>
            <RoofBase width={620} height={300} />
          </View>

          <Text style={styles.successText}>
            A thatched roof completed the structure with protection and character. Its steep pitch
            helped rain run off quickly, while the natural material provided insulation against heat
            and cold — sheltering everything below while giving Groot Constantia its distinctive form.
          </Text>

          <TouchableOpacity onPress={onNext} style={styles.button}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showIntroScreen) {
    return (
      <SafeAreaView style={styles.roofIntroContainer} edges={['left', 'right']}>
        <View style={styles.roofIntroInner}>
          <Text style={styles.leveloneIndicatorText}>Level 4: The Roof</Text>

          <Text style={styles.roofIntroText}>
            Finally, the structure is crowned.{'\n'}
            The roof of Groot Constantia is more than shelter — it is its signature.
            Designed to handle heavy rains and strong winds, its form protects everything beneath it while defining the building’s identity.
          </Text>

          <TouchableOpacity
            onPress={() => setShowIntroScreen(false)}
            style={styles.roofIntroButton}
          >
            <Text style={styles.roofIntroButtonText}>Continue</Text>
          </TouchableOpacity>
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
            <Text style={styles.levelIndicatorText}>Level 4</Text>
          </View>

          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>
              Select the{'\n'}correct roof material
            </Text>

            {roofOptions.map((option) => {
              const isSelected = selectedOption === option.id;
              const SvgImage = option.image;

              return (
                <Animated.View
                  key={option.id}
                  style={
                    isSelected
                      ? {
                          transform: [{ scale: pulseAnim }],
                        }
                      : undefined
                  }
                >
                  <Pressable
                    onPress={() => handleOptionSelect(option.id)}
                    style={[
                      styles.optionItem,
                      getRoofOptionStyle(option.id),
                      isSelected && styles.optionItemSelected,
                    ]}
                  >
                    <View style={styles.iconWrapper}>
                      <SvgImage
                        width={option.width || 90}
                        height={option.height || 60}
                      />
                    </View>

                    <Text
                      style={[
                        styles.optionLabel,
                        getRoofOptionTextStyle(option.id),
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}

            <View style={styles.hintWrapper}>
              <TouchableOpacity
                activeOpacity={1}
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
          </View>

          <View
            pointerEvents="none"
            style={[
              styles.hintIndicator,
              showHint && styles.hintIndicatorExpanded,
            ]}
          >
            {showHint && (
              <Text style={styles.hintIndicatorText}>
                This final layer must stand against sun, wind, and rain — what shape and material would best protect everything below?
              </Text>
            )}
          </View>

          <View style={styles.buildArea}>
            {showCrackedRoof && selectedOption !== correctAnswer && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoText}>
                  Oops, you have chosen the incorrect building material.{'\n'}Please reflect on the hint and try again!
                </Text>
              </View>
            )}

            <View style={styles.roofWrapper}>
              {!showBuildAnimation && !showRoof && (
                <View style={styles.windowBasePosition}>
                  <View style={styles.openingWindowImage}>
                    <WindowBase width={736} height={378} />
                  </View>
                </View>
              )}

              {showBuildAnimation && (
                <LottieView
                  source={require('../assets/Hammer animation.json')}
                  autoPlay
                  loop={true}
                  speed={0.8}
                  colorFilters={[
                    {
                      keypath: 'Shape Layer 1',
                      color: '#AE5037',
                    },
                  ]}
                  style={styles.buildAnimation}
                />
              )}

              {!showBuildAnimation && renderRoofImage()}
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.bottomWeatherIcons}>

                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setShowWind(!showWind)}
                  style={styles.weatherConditionItem}
                >
                  <View style={styles.windButton}>
                    <Text style={styles.windIcon}>air</Text>
                  </View>

                  {showWind && (
                    <View style={styles.bottomWeatherExpanded}>
                      <Text style={styles.bottomWeatherText}>
                        Wind Durable
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setShowTemp(!showTemp)}
                  style={styles.weatherConditionItem}
                >
                  <View style={styles.tempButton}>
                    <Text style={styles.tempIcon}>thermostat</Text>
                  </View>

                  {showTemp && (
                    <View style={styles.bottomWeatherExpanded}>
                      <Text style={styles.bottomWeatherText}>
                        Temperature{'\n'}Comfort
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setClimatePulseStopped(true);
                    setShowClimate(!showClimate);
                  }}
                  style={styles.weatherConditionItem}
                >
                  <Animated.View
                    style={
                      !authUnlocked && !climatePulseStopped
                        ? { transform: [{ scale: weatherPulseAnim }] }
                        : undefined
                    }
                  >
                    <View style={styles.climateButton}>
                      <Text style={styles.climateIcon}>airwave</Text>
                    </View>
                  </Animated.View>

                  {showClimate && (
                    <View style={styles.bottomWeatherExpanded}>
                      <Text style={styles.bottomWeatherText}>
                        Climate Control
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={1}
                  disabled={!authUnlocked}
                  onPress={() => {
                    if (authUnlocked) {
                      setAuthPulseStopped(true);
                      setShowAuth(!showAuth);
                    }
                  }}
                  style={styles.weatherConditionItem}
                >
                  <Animated.View
                    style={
                      authUnlocked && !authPulseStopped
                        ? { transform: [{ scale: weatherPulseAnim }] }
                        : undefined
                    }
                  >
                    <View
                      style={[
                        styles.authButton,
                        !authUnlocked && styles.weatherButtonDisabled,
                      ]}
                    >
                      <Text style={styles.authIcon}>verified</Text>
                    </View>
                  </Animated.View>

                  {showAuth && authUnlocked && (
                    <View style={styles.bottomWeatherExpanded}>
                      <Text style={styles.bottomWeatherText}>
                        Authenticity {'\n'}Check
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
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

canvas: {
  flex: 1,
  backgroundColor: 'transparent',
  flexDirection: 'row',
  position: 'relative',
},

  pageLabel: {
    fontFamily: 'Quicksand',
    color: 'transparent',
    fontSize: 18,
    marginBottom: 14,
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
    zIndex: 2,
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
  shadowColor: '#C77754',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 15,
  shadowRadius: 5,
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
  clayTileOption: {
    marginTop:-15,
    marginLeft: 0,
  },
  clayTileOptionText: {
    marginTop: 0,
    marginLeft: 0,
  },
  thatchedOption: {
    marginTop: -10,
    marginLeft: 0,
  },
  thatchedOptionText: {
    marginTop: 0,
    marginLeft: 0,
  },
  metalOption: {
    marginTop: -10,
    marginLeft: 0,
  },
  metalOptionText: {
    marginTop: 0,
    marginLeft: 0,
  },
  concreteOption: {
    marginTop: -10,
    marginLeft: 0,
  },
  concreteOptionText: {
    marginTop: -3,
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
    backgroundColor: '#AE5037',
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
    marginTop: 10,
  },
  bottomWeatherIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: -25,
    marginLeft: 140,
        shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
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
    marginLeft: 8,
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
  hintButton: {
    width: 60,
    height: 55,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 0,
    backgroundColor: '#F4F1EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginLeft: 30,
  },
  hintIndicator: {
    position: 'absolute',
    left: 175,
    bottom: 0,
    width: 80,
    height: 55,
    borderRadius: 100,
    backgroundColor: '#F4F1EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 1,
    zIndex: 1,
  },
  hintIndicatorExpanded: {
    width: 500,
  },
  hintIndicatorText: {
    fontFamily: 'Quicksand',
    fontSize: 12,
    color: '#AE5037',
    paddingLeft: 90,
    paddingRight: 24,
    marginTop: 12,
  },
  hintWrapper: {
    position: 'absolute',
    left: 95,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  hintButtonOverlay: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    zIndex: 11,
    elevation: 11,
  },
  hintIcon: {
    fontSize: 25,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButton: {
    position: 'absolute',
    right: 28,
    bottom: -25,
    minWidth: 100,
    maxHeight: 55,
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
  },
  nextButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#53443D',
  },
  roofWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -60,
    marginBottom: -30,
    position: 'relative',
  },
  windowBasePosition: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 45,
    marginLeft: 0,
  },
  roofPosition: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    marginLeft: -1,
  },
  clayRoofImage: {
    width: 710,
    height: 347,
    marginTop: 40,
    marginLeft: 0,
  },
  clayRoofCrackedImage: {
    width: 710,
    height: 347,
    marginTop: 15,
    marginLeft: 0,
  },
  metalRoofImage: {
    width: 710,
    height: 347,
    marginTop: 5,
    marginLeft: 0,
  },
  metalRoofCrackedImage: {
    width: 710,
    height: 347,
    marginTop: -20,
    marginLeft: 0,
  },
  concreteRoofImage: {
    width: 710,
    height: 347,
    marginTop: 25,
    marginLeft: 0,
  },
  concreteRoofCrackedImage: {
    width: 710,
    height: 347,
    marginTop: -25,
    marginLeft: 0,
  },
  correctRoofImage: {
    marginTop: 20,
    marginLeft: 0,
       width: 710,
    height: 347,
  },
  openingWindowImage: {
    marginTop: -15,
    marginLeft: 0,
  },
  buildAnimation: {
    width: 180,
    height: 180,
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
    marginTop: -100,
  },
  successText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    lineHeight: 28,
    color: '#F4F1EA',
    textAlign: 'center',
    maxWidth: 760,
  },
  successButtonWrapper: {
    marginTop: 35,
  },
  successButton: {
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
  },
  successButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#605C39',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#F4F1EA',
    minWidth: 140,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 30,
  },
  buttonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#605C39',
    fontWeight: '600',
  },
  levelIndicator: {
    width: 90,
    height: 110,
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
  weatherButtonDisabled: {
    backgroundColor: '#605c3983',
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
  roofIntroContainer: {
    flex: 1,
    backgroundColor: '#AE5037',
  },
  roofIntroInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  leveloneIndicatorText: {
    fontFamily: 'Quicksand',
    fontSize: 30,
    color: '#F4F1EA',
    fontWeight: '600',
    marginBottom: 20,
    marginTop: -60,
  },
  roofIntroText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    lineHeight: 28,
    color: '#F4F1EA',
    textAlign: 'center',
    maxWidth: 700,
  },
  roofIntroButton: {
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
  roofIntroButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#AE5037',
    fontWeight: '600',
  },
});