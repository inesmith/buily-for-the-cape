import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, } from 'react-native';
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
  { id: 'thatched', label: 'Thatched Roof', image: ThatchedRoof },
  { id: 'clay-tile', label: 'Clay Tile Roof', image: ClayTileRoof },
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
    setShowRoof(false);
    setShowCrackedRoof(false);
    setCountdown(null);
    setShowSuccessScreen(false);
    setIsAnimatingBuild(true);
    setShowBuildAnimation(true);

    buildTimeoutRef.current = setTimeout(() => {
      setShowBuildAnimation(false);
      setShowRoof(true);
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
          setShowCrackedRoof(true);
          setCountdown(null);
        }, FAILURE_TIMER_SECONDS * 1000);
      }
    }, BUILD_ANIMATION_DURATION);
  };

  if (!fontsLoaded) return null;

  const renderRoofImage = () => {
    if (!selectedOption || !showRoof) return null;

    if (selectedOption === 'thatched') {
      return (
        <View style={styles.roofPosition}>
          <RoofBase width={710} height={347} />
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

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.screen}>
        <Text style={styles.pageLabel}>Building Page</Text>

        <View style={styles.canvas}>
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>
              Select the{'\n'}correct roof material
            </Text>

            {roofOptions.map((option) => {
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
                Finally, the structure is crowned.{'\n'}
                {'\n'}The roof of Groot Constantia is more than shelter — it is its signature.
                Designed to handle heavy rains and strong winds, its form protects everything beneath it while defining the building’s identity.
              </Text>
            </View>

            <View style={styles.roofWrapper}>
              {!showBuildAnimation && !showRoof && (
                <View style={styles.windowBasePosition}>
                  <WindowBase width={710} height={383} />
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
              <View style={styles.hintWrapper}>
                {showHint && (
                  <View style={styles.hintExpanded}>
                    <Text style={styles.hintText}>
                      This final layer must stand against sun, wind, and rain — what shape and material would best protect everything below?
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
                  <Text style={styles.nextButtonText}>Level 4</Text>
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
  roofWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -60,
    marginBottom: -25,
    position: 'relative',
  },
  windowBasePosition: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
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
    marginTop: 0,
    marginLeft: 0,
  },
  clayRoofCrackedImage: {
    width: 710,
    height: 347,
    marginTop: 0,
    marginLeft: 0,
  },
  metalRoofImage: {
    width: 710,
    height: 347,
    marginTop: 0,
    marginLeft: 0,
  },
  metalRoofCrackedImage: {
    width: 710,
    height: 347,
    marginTop: 0,
    marginLeft: 0,
  },
  concreteRoofImage: {
    width: 710,
    height: 347,
    marginTop: 0,
    marginLeft: 0,
  },
  concreteRoofCrackedImage: {
    width: 710,
    height: 347,
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