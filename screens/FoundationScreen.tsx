import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import LottieView from 'lottie-react-native';

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

export default function FoundationScreen({ onNext }: FoundationScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showFoundation, setShowFoundation] = useState(false);
  const [isAnimatingBuild, setIsAnimatingBuild] = useState(false);
  const [showBuildAnimation, setShowBuildAnimation] = useState(false);
  const [showCrackedFoundation, setShowCrackedFoundation] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const buildTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setIsAnimatingBuild(true);
    setShowBuildAnimation(true);

    buildTimeoutRef.current = setTimeout(() => {
      setShowBuildAnimation(false);
      setShowFoundation(true);
      setIsAnimatingBuild(false);

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

  const canGoNext =
    selectedOption === correctAnswer &&
    showFoundation &&
    !showBuildAnimation &&
    !showCrackedFoundation;

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
              <Text style={styles.infoText}></Text>
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
                countdown !== null && (
                  <View style={styles.timerBubble}>
                    <Text style={styles.timerText}>{countdown}</Text>
                  </View>
                )}
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.hintWrapper}>
                {showHint && (
                  <View style={styles.hintExpanded}>
                    <Text style={styles.hintText}>
                      Foundations must handle moisture and shifting soil.
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

              <TouchableOpacity
                onPress={() => {
                  if (canGoNext) {
                    onNext();
                  }
                }}
              >
                <View
                  style={[
                    styles.nextButton,
                    canGoNext && styles.nextButtonActive
                  ]}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      canGoNext && styles.nextButtonTextActive
                    ]}
                  >
                    {canGoNext ? 'Next Level' : 'Level 1'}
                  </Text>
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
    height: 70,
    marginTop: -30,
    maxWidth: 500,
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
    fontSize: 14,
    color: '#53443D',
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
    width: 470,
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
  nextButtonDisabled: {
    opacity: 0.45,
  },
  nextButtonText: {
    fontFamily: 'Quicksand',
    fontSize: 18,
    color: '#53443D',
  },
  nextButtonTextDisabled: {
    color: '#8B8178',
  },
  nextButtonActive: {
    backgroundColor: '#799CB2',
    borderColor: '#799CB2',
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
  nextButtonTextActive: {
    color: '#F4F1EA',
  },
});