import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, Animated, ImageBackground, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import BrickFoundation from '../assets/foundation-brick.svg';
import WoodFoundation from '../assets/foundation-wood.svg';
import ConcreteFoundation from '../assets/foundation-concrete.svg';
import StoneFoundation from '../assets/foundation-stone.svg';
import FoundationBase from '../assets/foundation.svg';
import BackgroundImage from '../assets/bg.png';

import BrickCracked from '../assets/bricks_cracked.png';
import Brick from '../assets/bricks.png';
import Wood from '../assets/wood.png';
import WoodCracked from '../assets/wood_cracked.png';
import Concrete from '../assets/concrete.png';
import ConcreteCracked from '../assets/concrete_cracked.png';

type FoundationScreenProps = {
  onNext: () => void;
};

type FoundationOption = {
  id: string;
  label: string;
  image: any;
  width?: number;
  height?: number;
};

const foundationOptions = [
  { id: 'brick', label: 'Brick', image: BrickFoundation },
  { id: 'wood', label: 'Wood', image: WoodFoundation, width: 98, height: 78 },
  { id: 'concrete', label: 'Concrete', image: ConcreteFoundation },
  { id: 'stone', label: 'Stone', image: StoneFoundation },
];

const correctAnswer = 'stone';
const BUILD_ANIMATION_DURATION = 5000;
const FAILURE_TIMER_SECONDS = 3;
const SUCCESS_DELAY = 1800;

export default function FoundationScreen({ onNext }: FoundationScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showFoundation, setShowFoundation] = useState(false);
  const [isAnimatingBuild, setIsAnimatingBuild] = useState(false);
  const [showBuildAnimation, setShowBuildAnimation] = useState(false);
  const [showCrackedFoundation, setShowCrackedFoundation] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showIntroScreen, setShowIntroScreen] = useState(true);
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const [weatherUnlocked, setWeatherUnlocked] = useState(false);

  const [showWind, setShowWind] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showClimate, setShowClimate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const windPulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
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

  useEffect(() => {
    if (weatherUnlocked) {
      Animated.loop(
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
      ).start();
    } else {
      windPulseAnim.setValue(1);
    }
  }, [weatherUnlocked]);

  const handleOptionSelect = (optionId: string) => {
    clearAllTimers();

    setSelectedOption(optionId);
    setShowHint(false);
    setShowFoundation(false);
    setShowCrackedFoundation(false);
    setCountdown(null);
    setShowSuccessScreen(false);
    setIsAnimatingBuild(true);
    setShowBuildAnimation(true);
    setShowCompletedButton(false);
    setWeatherUnlocked(false);
    setShowWind(false);
    setShowTemp(false);
    setShowClimate(false);
    setShowAuth(false);

    buildTimeoutRef.current = setTimeout(() => {
      setShowBuildAnimation(false);
      setShowFoundation(true);
      setIsAnimatingBuild(false);

      if (optionId === correctAnswer) {
        setWeatherUnlocked(true);

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
          setShowCrackedFoundation(true);
          setCountdown(null);
        }, FAILURE_TIMER_SECONDS * 1000);
      }
    }, BUILD_ANIMATION_DURATION);
  };

  if (!fontsLoaded) return null;

  const renderFoundationImage = () => {
    if (!selectedOption || !showFoundation) return null;

    if (selectedOption === 'stone') {
      return (
        <View style={styles.stoneImage}>
          <FoundationBase width={730} height={370} />
        </View>
      );
    }

    if (selectedOption === 'brick') {
      return (
        <Image
          source={showCrackedFoundation ? BrickCracked : Brick}
          style={showCrackedFoundation ? styles.brickCrackedImage : styles.brickImage}
          resizeMode="contain"
        />
      );
    }

    if (selectedOption === 'wood') {
      return (
        <Image
          source={showCrackedFoundation ? WoodCracked : Wood}
          style={showCrackedFoundation ? styles.woodCrackedImage : styles.woodImage}
          resizeMode="contain"
        />
      );
    }

    if (selectedOption === 'concrete') {
      return (
        <Image
          source={showCrackedFoundation ? ConcreteCracked : Concrete}
          style={showCrackedFoundation ? styles.concreteCrackedImage : styles.concreteImage}
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
            <FoundationBase width={600} height={260} />
          </View>

          <Text style={styles.successText}>
            Stone and local materials were chosen to anchor the building firmly into the earth,
            protecting it from shifting ground and seasonal change. What lies below is what allows
            everything above to endure.
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

          <Text style={styles.leveloneIndicatorText}>Level 1: The Foundation</Text>

          <Text style={styles.foundationIntroText}>
            Before the walls could rise, the land had to be understood.
            {'\n'} 
            Groot Constantia was built on soil shaped by time, wind, and rain — and every decision began beneath the surface.
            The foundation was not just about strength, but working with the environment, not against it.
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
              <Text style={styles.levelIndicatorText}>Level 1</Text>
            </View>

            <View style={styles.optionCard}>
              <Text style={styles.optionTitle}>
                Select the{'\n'}correct foundation material
              </Text>

              {foundationOptions.map((option) => {
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
                  Think about what lies beneath — what kind of material would stay strong even when the ground shifts and moisture rises?
                </Text>
              )}
            </View>

            <View style={styles.buildArea}>
              {showCrackedFoundation && selectedOption !== correctAnswer && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoText}>
                    Oops, you have chosen the incorrect building material.{'\n'}Please reflect on the hint and try again!
                  </Text>
                </View>
              )}

              <View pointerEvents="none" style={styles.foundationWrapper}>
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

                {!showBuildAnimation && renderFoundationImage()}

                {!showBuildAnimation &&
                  showFoundation &&
                  selectedOption !== correctAnswer &&
                  !showCrackedFoundation &&
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
                    disabled={!weatherUnlocked}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setShowWind(!showWind);
                      setShowTemp(false);
                      setShowClimate(false);
                      setShowAuth(false);
                      windPulseAnim.stopAnimation();
                    }}
                    style={styles.weatherConditionItem}
                  >
                    <View
                      style={[
                        styles.windButton,
                        !weatherUnlocked && styles.weatherButtonDisabled,
                      ]}
                    >
                      <Text style={styles.windIcon}>air</Text>
                    </View>

                    {showWind && weatherUnlocked && (
                      <View style={styles.bottomWeatherExpanded}>
                        <Text style={styles.bottomWeatherText}>Wind Durable</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  </Animated.View>

                  <TouchableOpacity
                    activeOpacity={1}
                    disabled
                    style={styles.weatherConditionItem}
                  >
                    <View style={[styles.tempButton, styles.weatherButtonDisabled]}>
                      <Text style={styles.tempIcon}>device_thermostat</Text>
                    </View>
                  </TouchableOpacity>

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
  hintIcon: {
    fontSize: 25,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
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
    paddingLeft: 90,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  bottomWeatherIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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
  roofWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -60,
    marginBottom: -30,
    position: 'relative',
  },
  roofPosition: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    marginLeft: -1,
  },
  foundationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -60,
    marginBottom: -30,
    position: 'relative',
  },
  brickImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 135,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
  },
  brickCrackedImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
  },
  woodImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
  },
  woodCrackedImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
  },
  concreteImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
  },
  concreteCrackedImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
  },
  stoneImage: {
    marginTop: 32,
    marginLeft: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
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