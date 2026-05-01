import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import LimeWashedWalls from '../assets/lime-wall.svg';
import ConcreteWalls from '../assets/concrete-wall.svg';
import ExposedStoneWalls from '../assets/exposed-stone-wall.svg';
import GlassWalls from '../assets/glass-wall.svg';
import WallBase from '../assets/wallBase.svg';
import FoundationBase from '../assets/foundation.svg';

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
  { id: 'lime-washed', label: 'Lime Washed', image: LimeWashedWalls },
  { id: 'concrete', label: 'Concrete', image: ConcreteWalls },
  { id: 'exposed-stone', label: 'Exposed Stone', image: ExposedStoneWalls },
  { id: 'glass', label: 'Glass', image: GlassWalls },
];

const correctAnswer = 'lime-washed';
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

  const buildTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fontsLoaded] = useFonts({
    Quicksand: require('../assets/fonts/Quicksand-VariableFont_wght.ttf'),
    MonteCarlo: require('../assets/fonts/MonteCarlo-Regular.ttf'),
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

  const handleOptionSelect = (optionId: string) => {
    clearAllTimers();

    setSelectedOption(optionId);
    setShowWall(false);
    setShowCrackedWall(false);
    setCountdown(null);
    setShowSuccessScreen(false);
    setIsAnimatingBuild(true);
    setShowBuildAnimation(true);

    buildTimeoutRef.current = setTimeout(() => {
      setShowBuildAnimation(false);
      setShowWall(true);
      setIsAnimatingBuild(false);

      if (optionId === correctAnswer) {
        successTimeoutRef.current = setTimeout(() => {
          setShowSuccessScreen(true);
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
          setCountdown(null);
        }, FAILURE_TIMER_SECONDS * 1000);
      }
    }, BUILD_ANIMATION_DURATION);
  };

  if (!fontsLoaded) return null;

  const renderWallImage = () => {
    if (!selectedOption || !showWall) return null;

    if (selectedOption === 'lime-washed') {
      return <WallBase width={736} height={378} />;
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


    if (selectedOption === 'exposed-stone') {
      return (
        <Image
          source={showCrackedWall ? ExposedStoneWallCracked : ExposedStoneWallChosen}
          style={showCrackedWall ? styles.exposedStoneWallCrackedImage : styles.exposedStoneWallImage}
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
            <WallBase width={620} height={300} />
          </View>

          <Text style={styles.successText}>
            Thick lime-washed walls helped regulate temperature naturally, keeping interiors cool in
            the summer heat and warmer through the Cape winter. Their strength was not only in what
            they supported, but in how they worked with the environment.
          </Text>

          <TouchableOpacity onPress={onNext} style={styles.button}>
                <Text style={styles.buttonText}>Next Level</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.screen}>
        <Text style={styles.pageLabel}>Building Page</Text>

        <View style={styles.canvas}>
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>
              Select the{'\n'}correct wall material
            </Text>

            {wallOptions.map((option) => {
              const isSelected = selectedOption === option.id;
              const SvgImage = option.image;

              return (
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
              );
            })}
          </View>

          <View style={styles.buildArea}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoText}>
                With the foundation set, the structure begins to rise...{'\n'}
                {'\n'}The walls were built thick and solid — not for decoration, but for survival.
                In the Cape’s shifting climate, these walls kept interiors cool during harsh summers
                and held warmth through the cold.
              </Text>
            </View>

            <View style={styles.wallWrapper}>
              {!showBuildAnimation && !showWall && (
                <FoundationBase width={730} height={370} />
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
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.hintWrapper}>
                {showHint && (
                  <View style={styles.hintExpanded}>
                    <Text style={styles.hintText}>
                      Consider how a building protects itself from both heat and cold without relying
                      on modern technology.
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

              <TouchableOpacity activeOpacity={1}>
                <View style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>Level 2</Text>
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
    marginLeft: 50,
    marginTop: -30,
    marginBottom: 0,
    backgroundColor: '#f4f1eac7',
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
    backgroundColor: '#f4f1eac7',
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
  nextButton: {
    minWidth: 100,
    maxHeight: 50,
    backgroundColor: '#f4f1eac7',
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
    borderColor: '#f4f1eac7',
    marginBottom: -25,
  },
  nextButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#53443D',
  },
  wallWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -60,
    marginBottom: -45,
    position: 'relative',
  },
  concreteWallImage: {
    width: 736,
    height: 378,
    marginTop: 0,
    marginLeft: 0,
  },
  concreteWallCrackedImage: {
    width: 736,
    height: 378,
    marginTop: 0,
    marginLeft: 0,
  },
  exposedStoneWallImage: {
    width: 736,
    height: 378,
    marginTop: 0,
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
    marginTop: 0,
    marginLeft: 0,
  },
  glassWallCrackedImage: {
    width: 736,
    height: 378,
    marginTop: 0,
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
},

buttonText: {
  fontFamily: 'Quicksand',
  fontSize: 18,
  color: '#605C39',
  fontWeight: '600',
},
});