import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, } from 'react-native';
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
    setShowFoundation(false);
    setShowCrackedFoundation(false);
    setCountdown(null);
    setShowSuccessScreen(false);
    setIsAnimatingBuild(true);
    setShowBuildAnimation(true);

    buildTimeoutRef.current = setTimeout(() => {
      setShowBuildAnimation(false);
      setShowFoundation(true);
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
        setShowCrackedFoundation(true);
        setCountdown(null);
        }, FAILURE_TIMER_SECONDS * 1000);
      }
    }, BUILD_ANIMATION_DURATION);
  };

  if (!fontsLoaded) return null;

  const isCorrect = selectedOption === correctAnswer;

  const renderFoundationImage = () => {
    if (!selectedOption || !showFoundation) return null;

    if (selectedOption === 'stone') {
      return <FoundationBase width={730} height={370} />;
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

        {/* foundation image */}
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


  //const canGoNext =
  //selectedOption === correctAnswer &&
  //showFoundation &&
  //!showBuildAnimation &&
  //!showCrackedFoundation;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.screen}>
        <Text style={styles.pageLabel}>Building Page</Text>

        <View style={styles.canvas}>
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>
              Select the{'\n'}correct foundation material
            </Text>

            {foundationOptions.map((option) => {
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
                Before the walls could rise, the land had to be understood.
                Groot Constantia was built on soil shaped by time, wind, and rain — and every decision began beneath the surface.  
                The foundation was not just about strength, but working with the environment, not against it.
              </Text>
            </View>

            <View style={styles.foundationWrapper}>
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
              <View style={styles.hintWrapper}>
                {showHint && (
                  <View style={styles.hintExpanded}>
                    <Text style={styles.hintText}>
                      Think about what lies beneath — what kind of material would stay strong even when the ground shifts and moisture rises?
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
                  <Text style={styles.nextButtonText}>Level 1</Text>
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
  foundationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -60,
    marginBottom: -45,
    position: 'relative',
  },
  brickImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 110,
  },
  brickCrackedImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 75,
  },
  woodImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 60,
  },
  woodCrackedImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 115,
  },
  concreteImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 80,
  },
  concreteCrackedImage: {
    width: 730,
    height: 370,
    marginLeft: 0,
    marginTop: 75,
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