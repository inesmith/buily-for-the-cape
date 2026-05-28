import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, Animated, ImageBackground, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import ConcreteWalls from '../assets/concrete-wall.svg';
import ExposedStoneWalls from '../assets/exposed-stone-wall.svg';
import GlassWalls from '../assets/glass-wall.svg';
import LimePlasteredWalls from '../assets/lime-wall.svg';
import WallBase from '../assets/wallBase.svg';
import FoundationBase from '../assets/foundation.svg';
import BackgroundImage from '../assets/bg.png';

import ConcreteWallChosen from '../assets/concrete-wall-chosen.png';
import ConcreteWallCracked from '../assets/concrete-wall-cracked.png';
import ExposedStoneWallChosen from '../assets/exposedstone-wall-chosen.png';
import ExposedStoneWallCracked from '../assets/exposedstone-wall-cracked.png';
import GlassWallChosen from '../assets/glass-wall-chosen.png';
import GlassWallCracked from '../assets/glass-wall-cracked.png';

type WallsScreenProps = {
  onNext: () => void;
};

type WallOption = {
  id: string;
  label: string;
  image: any;
  width?: number;
  height?: number;
};

const wallOptions = [
  { id: 'concrete', label: 'Concrete', image: ConcreteWalls },
  { id: 'exposedStone', label: 'Exposed Stone', image: ExposedStoneWalls },
  { id: 'limePlastered', label: 'Lime Plastered', image: LimePlasteredWalls },
  { id: 'glass', label: 'Glass', image: GlassWalls },
];

const correctAnswer = 'limePlastered';
const BUILD_ANIMATION_DURATION = 5000;
const FAILURE_TIMER_SECONDS = 3;
const SUCCESS_DELAY = 1800;

export default function WallsScreen({ onNext }: WallsScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showWall, setShowWall] = useState(false);
  const [isAnimatingBuild, setIsAnimatingBuild] = useState(false);
  const [showBuildAnimation, setShowBuildAnimation] = useState(false);
  const [showCrackedWall, setShowCrackedWall] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showIntroScreen, setShowIntroScreen] = useState(true);
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const [weatherUnlocked, setWeatherUnlocked] = useState(false);

  const [showWind, setShowWind] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showClimate, setShowClimate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [shouldPulseHint, setShouldPulseHint] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const windPulseAnim = useRef(new Animated.Value(1)).current;
  const tempPulseAnim = useRef(new Animated.Value(1)).current;
  const windPulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const tempPulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [windPulseActive, setWindPulseActive] = useState(true);
  const [tempPulseActive, setTempPulseActive] = useState(false);
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

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
      clearAllTimers();
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

  const stopWindPulse = () => {
    windPulseLoopRef.current?.stop();
    windPulseAnim.setValue(1);
    setWindPulseActive(false);
  };

  const stopTempPulse = () => {
    tempPulseLoopRef.current?.stop();
    tempPulseAnim.setValue(1);
    setTempPulseActive(false);
  };

  useEffect(() => {
    windPulseLoopRef.current?.stop();

    if (windPulseActive) {
      windPulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(windPulseAnim, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(windPulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      windPulseLoopRef.current.start();
    } else {
      windPulseAnim.setValue(1);
    }

    return () => {
      windPulseLoopRef.current?.stop();
    };
  }, [windPulseActive]);

  useEffect(() => {
    tempPulseLoopRef.current?.stop();

    if (tempPulseActive && weatherUnlocked) {
      tempPulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(tempPulseAnim, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(tempPulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      tempPulseLoopRef.current.start();
    } else {
      tempPulseAnim.setValue(1);
    }

    return () => {
      tempPulseLoopRef.current?.stop();
    };
  }, [tempPulseActive, weatherUnlocked]);

  const handleOptionSelect = (optionId: string) => {
    clearAllTimers();

    setSelectedOption(optionId);
    setShowHint(false);
    setShowWall(false);
    setShowCrackedWall(false);
    setCountdown(null);
    setShowSuccessScreen(false);
    setIsAnimatingBuild(true);
    setShowBuildAnimation(true);
    setShowCompletedButton(false);
    setWeatherUnlocked(false);
    setWindPulseActive(false);
    setTempPulseActive(false);
    setShowWind(false);
    setShowTemp(false);
    setShowClimate(false);
    setShowAuth(false);
    setShouldPulseHint(false);

    buildTimeoutRef.current = setTimeout(() => {
      setShowBuildAnimation(false);
      setShowWall(true);
      setIsAnimatingBuild(false);

      if (optionId === correctAnswer) {
        setWeatherUnlocked(true);
        setWindPulseActive(false);
        setTempPulseActive(true);

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
          setShowCrackedWall(true);
          setShouldPulseHint(true);
          setCountdown(null);
        }, FAILURE_TIMER_SECONDS * 1000);
      }
    }, BUILD_ANIMATION_DURATION);
  };

  if (!fontsLoaded) return null;

  const renderWallImage = () => {
    if (!selectedOption || !showWall) return null;

    if (selectedOption === 'limePlastered') {
      return (
        <View style={styles.limeWallImage}>
          <WallBase width={736} height={378} />
        </View>
      );
    }

    if (selectedOption === 'exposedStone') {
      return (
        <Image
          source={showCrackedWall ? ExposedStoneWallCracked : ExposedStoneWallChosen}
          style={showCrackedWall ? styles.exposedStoneWallCrackedImage : styles.exposedStoneWallImage}
          resizeMode="contain"
        />
      );
    }

    if (selectedOption === 'concrete') {
      return (
        <Image
          source={showCrackedWall ? ConcreteWallCracked : ConcreteWallChosen}
          style={showCrackedWall ? styles.concreteWallCrackedImage : styles.concreteWallImage}
          resizeMode="contain"
        />
      );
    }

    if (selectedOption === 'glass') {
      return (
        <Image
          source={showCrackedWall ? GlassWallCracked : GlassWallChosen}
          style={showCrackedWall ? styles.glassWallCrackedImage : styles.glassWallImage}
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
            <WallBase width={600} height={260} />
          </View>

          <Text style={styles.successText}>
            The thick walls helped Groot Constantia respond to the Cape climate.
            They protected the interior from wind, softened temperature changes,
            and gave the building the weight and strength it needed to endure.
          </Text>

          <TouchableOpacity onPress={onNext} style={styles.button}>
            <Text style={styles.buttonText}>Next Level</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showIntroScreen) {
    return (
      <SafeAreaView style={styles.foundationIntroContainer} edges={['left', 'right']}>
        <View style={styles.foundationIntroInner}>

          <Text style={styles.leveloneIndicatorText}>Level 2: The Walls</Text>

          <Text style={styles.foundationIntroText}>
            With the foundation set, the structure begins to rise...
            {'\n'} 
            The walls were built thick and solid — not for decoration, but for survival.
            In the Cape’s shifting climate, these walls kept interiors cool during harsh summers
            and held warmth through the cold.
          </Text>

          <TouchableOpacity
            onPress={() => setShowIntroScreen(false)}
            style={styles.foundationIntroButton}
          >
            <Text style={styles.foundationIntroButtonText}>Continue</Text>
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
              <Text style={styles.levelIndicatorText}>Level 2</Text>
            </View>

            <View style={styles.optionCard}>
              <Text style={styles.optionTitle}>
                Select the{'\n'}correct wall material
              </Text>

              {wallOptions.map((option) => {
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
                      key={option.id}
                      onPress={() => handleOptionSelect(option.id)}
                      style={[
                        styles.optionItem,
                        option.id === 'concrete' && styles.concreteOption,
                        option.id === 'exposedStone' && styles.exposedStoneOption,
                        option.id === 'limePlastered' && styles.limePlasteredOption,
                        option.id === 'glass' && styles.glassOption,
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
                          option.id === 'concrete' && styles.concreteOptionText,
                          option.id === 'exposedStone' && styles.exposedStoneOptionText,
                          option.id === 'limePlastered' && styles.limePlasteredOptionText,
                          option.id === 'glass' && styles.glassOptionText,
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
                    setShouldPulseHint(false);
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

            <Animated.View
              pointerEvents="none"
              style={[
                styles.hintIndicator,
                showHint && styles.hintIndicatorExpanded,

                shouldPulseHint
                  ? {
                      transform: [{ scale: pulseAnim }],
                      shadowColor: '#AE5037',
                      shadowOpacity: 1,
                    }
                  : {
                      shadowColor: '#000',
                      shadowOpacity: 0.14,
                    },
              ]}
            >
              {showHint && (
                <Text style={styles.hintIndicatorText}>
                  Consider how a building protects itself from both heat and cold without relying on modern technology.
                </Text>
              )}
            </Animated.View>

            <View style={styles.buildArea}>
              {showCrackedWall && selectedOption !== correctAnswer && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoText}>
                    Oops, you have chosen the incorrect building material.{'\n'}Please reflect on the hint and try again!
                  </Text>
                </View>
              )}

              <View pointerEvents="none" style={styles.wallWrapper}>
                {!showBuildAnimation && !showWall && (
                  <View style={styles.openingFoundationImage}>
                    <FoundationBase width={730} height={370} />
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

                {!showBuildAnimation && renderWallImage()}

                {!showBuildAnimation &&
                  showWall &&
                  selectedOption !== correctAnswer &&
                  !showCrackedWall &&
                  countdown !== null && null}
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.bottomWeatherIcons}>
                  <Animated.View
                    style={{
                      transform: [{ scale: windPulseAnim }],
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        stopWindPulse();
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
                  </Animated.View>

                  <Animated.View
                    style={{
                      transform: [{ scale: weatherUnlocked ? tempPulseAnim : 1 }],
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      disabled={!weatherUnlocked}
                      onPress={() => {
                        if (weatherUnlocked) {
                          stopTempPulse();
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setShowTemp(!showTemp);
                          setShowWind(false);
                          setShowClimate(false);
                          setShowAuth(false);
                        }
                      }}
                      style={styles.weatherConditionItem}
                    >
                      <View
                        style={[
                          styles.tempButton,
                          !weatherUnlocked && styles.weatherButtonDisabled,
                        ]}
                      >
                        <Text style={styles.tempIcon}>device_thermostat</Text>
                      </View>

                      {showTemp && weatherUnlocked && (
                        <View style={styles.bottomWeatherExpanded}>
                          <Text style={styles.bottomWeatherText}>Temperature{'\n'}Comfort</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  <TouchableOpacity
                    activeOpacity={1}
                    disabled
                    style={styles.weatherConditionItem}
                  >
                    <View style={[styles.climateButton, styles.weatherButtonDisabled]}>
                      <Text style={styles.climateIcon}>airwave</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={1}
                    disabled
                    style={styles.weatherConditionItem}
                  >
                    <View style={[styles.authButton, styles.weatherButtonDisabled]}>
                      <Text style={styles.authIcon}>verified</Text>
                    </View>
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
    position: 'relative',
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

  concreteOption: {
    marginTop: -10,
    marginLeft: 0,
  },

  exposedStoneOption: {
    marginTop: -10,
    marginLeft: 0,
  },

  limePlasteredOption: {
    marginTop: -5,
    marginLeft: -15,
  },

  glassOption: {
    marginTop: 0,
    marginLeft: 0,
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

  concreteOptionText: {
    marginTop: 0,
    marginLeft: 0,
  },

  exposedStoneOptionText: {
    marginTop: 5,
    marginLeft: 0,
  },

  limePlasteredOptionText: {
    marginTop: 5,
    marginLeft: 10,
  },

  glassOptionText: {
    marginTop: 0,
    marginLeft: -5,
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
  hintButton: {
    width: 50,
    height: 50,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginLeft: 85,
  },
  hintIndicator: {
    position: 'absolute',
    left: 250,
    bottom: 0,
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#f4f1ea',
    shadowColor: '#AE5037',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    elevation: 1,
    zIndex: 1,
  },
  hintIcon: {
    fontSize: 32,
    marginLeft: 0,
    shadowColor: '#f76911',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 4,
    shadowRadius: 8,
    elevation: 5,
  },
  hintIndicatorExpanded: {
    width: 500,
  },
  hintIndicatorText: {
    fontFamily: 'Quicksand',
    fontSize: 12,
    color: '#AE5037',
    paddingLeft: 100,
    paddingRight: 24,
    marginTop: 13,
    fontWeight: '500',
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
  bottomRow: {
  position: 'absolute',
  top: 10,
  right: 30,

  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',

  zIndex: 999,
  elevation: 999,
  },
  bottomWeatherIcons: {
    flexDirection: 'column',
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
    flexDirection: 'column',
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
  wallWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -60,
    marginBottom: -30,
    position: 'relative',
  },
  concreteWallImage: {
    width: 736,
    height: 378,
    marginTop: 45,
    marginLeft: 0,
  },
  concreteWallCrackedImage: {
    width: 736,
    height: 378,
    marginTop: 0,
    marginLeft: 0,
  },
  limeWallImage: {
    width: 736,
    height: 378,
    marginTop: 25,
    marginLeft: 0,
  },
  exposedStoneWallImage: {
    width: 736,
    height: 378,
    marginTop: 45,
    marginLeft: 0,
  },
  exposedStoneWallCrackedImage: {
    width: 736,
    height: 378,
    marginTop: 0,
    marginLeft: 0,
  },
  glassWallImage: {
    width: 736,
    height: 378,
    marginTop: 45,
    marginLeft: 0,
  },
  glassWallCrackedImage: {
    width: 736,
    height: 378,
    marginTop: 0,
    marginLeft: 0,
  },
  openingFoundationImage: {
    marginTop: 35,
    marginLeft: 0,
  },
  buildAnimation: {
    width: 180,
    height: 180,
  },
  timerBubble: {
    position: 'absolute',
    top: 60,
    right: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#AE5037',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  timerText: {
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
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
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
  foundationIntroContainer: {
    flex: 1,
    backgroundColor: '#AE5037',
  },
  foundationIntroInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  leveloneIndicatorText: {
    fontFamily: 'Quicksand',
    fontSize: 30,
    color: '#F4F1EA',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    marginBottom: 20,
    marginTop: -60,
  },
  foundationIntroText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    lineHeight: 28,
    color: '#F4F1EA',
    textAlign: 'center',
    maxWidth: 700,
    justifyContent: 'center',
  },
  foundationIntroButton: {
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
  foundationIntroButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#AE5037',
    fontWeight: '600',
  },
});