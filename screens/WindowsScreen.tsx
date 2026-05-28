import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, Animated, ImageBackground, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as ScreenOrientation from "expo-screen-orientation";
import LottieView from "lottie-react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

import WoodenFames from "../assets/wooden-frame.svg";
import AluminiumFrames from "../assets/aluminium-frame.svg";
import FullGlassPanels from "../assets/full-glass.svg";
import SteelFrames from "../assets/steel-frame.svg";
import WindowBase from "../assets/windows.svg";
import WallBase from "../assets/wallBase.svg";
import BackgroundImage from "../assets/bg.png";

import AluminiumFramesChosen from "../assets/aluminium-frames-chosen.png";
import AluminiumFramesCracked from "../assets/aluminium-frames-cracked.png";
import FullGlassChosen from "../assets/full-glass-chosen.png";
import FullGlassCracked from "../assets/full-glass-cracked.png";
import SteelFramesChosen from "../assets/steel-frames-chosen.png";
import SteelFramesCracked from "../assets/steel-frames-cracked.png";

type WindowsScreenProps = {
  onNext: () => void;
};

type WindowOption = {
  id: string;
  label: string;
  image: any;
  width?: number;
  height?: number;
};

const windowOptions = [
  { id: "wooden-frames", label: "Wooden Frames", image: WoodenFames },
  { id: "aluminium-frames", label: "Aluminium Frames", image: AluminiumFrames },
  { id: "glass-panels", label: "Glass Panels", image: FullGlassPanels },
  { id: "steel-frames", label: "Steel Frames", image: SteelFrames },
];

const correctAnswer = "wooden-frames";
const BUILD_ANIMATION_DURATION = 2800;
const FAILURE_TIMER_SECONDS = 3;
const SUCCESS_DELAY = 800;

export default function WindowsScreen({ onNext }: WindowsScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showWindow, setShowWindow] = useState(false);
  const [isAnimatingBuild, setIsAnimatingBuild] = useState(false);
  const [showBuildAnimation, setShowBuildAnimation] = useState(false);
  const [showCrackedWindow, setShowCrackedWindow] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showIntroScreen, setShowIntroScreen] = useState(true);
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const [climateUnlocked, setClimateUnlocked] = useState(false);

  const [showWind, setShowWind] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showClimate, setShowClimate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeWeatherPulse, setActiveWeatherPulse] = useState<
    "wind" | "auth" | null
  >("wind");
  const [shouldPulseHint, setShouldPulseHint] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const weatherPulseAnim = useRef(new Animated.Value(1)).current;
  const buildTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fontsLoaded] = useFonts({
    Quicksand: require("../assets/fonts/Quicksand-VariableFont_wght.ttf"),
    MonteCarlo: require("../assets/fonts/MonteCarlo-Regular.ttf"),
    MaterialSymbolsOutlined: require("../assets/fonts/MaterialSymbolsOutlined.ttf"),
  });

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const clearAllTimers = () => {
    if (buildTimeoutRef.current) clearTimeout(buildTimeoutRef.current);
    if (crackTimeoutRef.current) clearTimeout(crackTimeoutRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
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
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [selectedOption]);

  useEffect(() => {
    weatherPulseAnim.stopAnimation();

    if (activeWeatherPulse) {
      Animated.loop(
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
        ]),
      ).start();
    } else {
      weatherPulseAnim.setValue(1);
    }
  }, [activeWeatherPulse]);

  const handleOptionSelect = (optionId: string) => {
    clearAllTimers();

    setSelectedOption(optionId);
    setShowHint(false);
    setShowWindow(false);
    setShowCrackedWindow(false);
    setCountdown(null);
    setShowSuccessScreen(false);
    setIsAnimatingBuild(true);
    setShowBuildAnimation(true);
    setShowCompletedButton(false);
    setClimateUnlocked(false);
    setShowWind(false);
    setShowTemp(false);
    setShowClimate(false);
    setShowAuth(false);
    setActiveWeatherPulse("wind");

    buildTimeoutRef.current = setTimeout(() => {
      setShowBuildAnimation(false);
      setShowWindow(true);
      setIsAnimatingBuild(false);

      if (optionId === correctAnswer) {
        setClimateUnlocked(true);
        setActiveWeatherPulse("auth");

        successTimeoutRef.current = setTimeout(() => {
          setShowCompletedButton(true);

          successTimeoutRef.current = setTimeout(() => {
            setShowSuccessScreen(true);
          }, 800);
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
          setShowCrackedWindow(true);
          setShouldPulseHint(true);
          setCountdown(null);
        }, FAILURE_TIMER_SECONDS * 300);
      }
    }, BUILD_ANIMATION_DURATION);
  };

  if (!fontsLoaded) return null;

  const renderWindowImage = () => {
    if (!selectedOption || !showWindow) return null;

    if (selectedOption === "wooden-frames") {
      return (
        <View style={styles.correctWindowImage}>
          <WindowBase width={736} height={378} />
        </View>
      );
    }

    if (selectedOption === "aluminium-frames") {
      return (
        <Image
          source={
            showCrackedWindow ? AluminiumFramesCracked : AluminiumFramesChosen
          }
          style={
            showCrackedWindow
              ? styles.aluminiumWindowCrackedImage
              : styles.aluminiumWindowImage
          }
          resizeMode="contain"
        />
      );
    }

    if (selectedOption === "glass-panels") {
      return (
        <Image
          source={showCrackedWindow ? FullGlassCracked : FullGlassChosen}
          style={
            showCrackedWindow
              ? styles.fullGlassCrackedImage
              : styles.fullGlassImage
          }
          resizeMode="contain"
        />
      );
    }

    if (selectedOption === "steel-frames") {
      return (
        <Image
          source={showCrackedWindow ? SteelFramesCracked : SteelFramesChosen}
          style={
            showCrackedWindow
              ? styles.steelFramesCrackedImage
              : styles.steelFramesImage
          }
          resizeMode="contain"
        />
      );
    }

    return null;
  };

  if (showSuccessScreen) {
    return (
      <SafeAreaView style={styles.successContainer} edges={["left", "right"]}>
        <View style={styles.successInner}>
          <View style={{ marginTop: 50, marginBottom: -30 }}>
            <WindowBase width={620} height={300} />
          </View>

          <Text style={styles.successText}>
            Wooden window frames offered balance — durable enough for the
            climate, yet practical to shape and repair. Positioned carefully,
            these openings welcomed light and airflow while protecting the home
            from harsher weather beyond.
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
      <SafeAreaView
        style={styles.foundationIntroContainer}
        edges={["left", "right"]}
      >
        <View style={styles.foundationIntroInner}>
          <Text style={styles.leveloneIndicatorText}>Level 3: The Windows</Text>

          <Text style={styles.foundationIntroText}>
            As the walls closed in, openings became essential.
            {"\n"}
            Windows were carefully placed — not just to frame views, but to
            guide light and air through the home.
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
              <Text style={styles.levelIndicatorText}>Level 3</Text>
            </View>

            <View style={styles.optionCard}>
              <Text style={styles.optionTitle}>
                Select the{"\n"}correct window material
              </Text>

              {windowOptions.map((option) => {
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
                        option.id === "wooden-frames" &&
                          styles.woodenFramesOption,
                        option.id === "aluminium-frames" &&
                          styles.aluminiumFramesOption,
                        option.id === "glass-panels" &&
                          styles.glassPanelsOption,
                        option.id === "steel-frames" &&
                          styles.steelFramesOption,
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
                          option.id === "wooden-frames" &&
                            styles.woodenFramesOptionText,
                          option.id === "aluminium-frames" &&
                            styles.aluminiumFramesOptionText,
                          option.id === "glass-panels" &&
                            styles.glassPanelsOptionText,
                          option.id === "steel-frames" &&
                            styles.steelFramesOptionText,
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
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut,
                    );
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
                      shadowColor: "#AE5037",
                      shadowOpacity: 1,
                    }
                  : {
                      shadowColor: "#000",
                      shadowOpacity: 0.14,
                    },
              ]}
            >
              {showHint && (
                <Text style={styles.hintIndicatorText}>
                  These openings do more than let you see outside — think about
                  light, airflow, and daily life before electricity.
                </Text>
              )}
            </Animated.View>

            <View style={styles.buildArea}>
              {showCrackedWindow && selectedOption !== correctAnswer && (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoText}>
                    Oops, you have chosen the incorrect building material.{"\n"}
                    Please reflect on the hint and try again!
                  </Text>
                </View>
              )}

              <View pointerEvents="none" style={styles.windowWrapper}>
                {!showBuildAnimation && !showWindow && (
                  <View style={styles.wallBasePosition}>
                    <View style={styles.openingWallImage}>
                      <WallBase width={736} height={378} />
                    </View>
                  </View>
                )}

                {showBuildAnimation && (
                  <LottieView
                    source={require("../assets/Hammer animation.json")}
                    autoPlay
                    loop={true}
                    speed={1.3}
                    colorFilters={[
                      {
                        keypath: "Shape Layer 1",
                        color: "#AE5037",
                      },
                    ]}
                    style={styles.buildAnimation}
                  />
                )}

                {!showBuildAnimation && renderWindowImage()}
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.bottomWeatherIcons}>
                  <View style={styles.weatherConditionItem}>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        setShowTemp(!showTemp);
                        setShowWind(false);
                        setShowClimate(false);
                        setShowAuth(false);
                      }}
                    >
                      <View style={styles.tempButton}>
                        <Text style={styles.tempIcon}>device_thermostat</Text>
                      </View>
                    </TouchableOpacity>

                    <Text style={styles.weatherLabel}>Temperature{"\n"}Comfort</Text>
                  </View>

                  <View style={styles.weatherConditionItem}>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        setShowWind(!showWind);
                        if (activeWeatherPulse === "wind")
                          setActiveWeatherPulse(null);
                      }}
                    >
                      <Animated.View
                        style={
                          activeWeatherPulse === "wind"
                            ? { transform: [{ scale: weatherPulseAnim }] }
                            : undefined
                        }
                      >
                        <View style={styles.windButton}>
                          <Text style={styles.windIcon}>air</Text>
                        </View>
                      </Animated.View>
                    </TouchableOpacity>

                    <Text style={styles.weatherLabel}>Wind Durable</Text>
                  </View>

                  <View style={styles.weatherConditionItem}>
                    <TouchableOpacity
                      activeOpacity={1}
                      disabled={!climateUnlocked}
                      onPress={() => {
                        if (climateUnlocked) {
                          setShowAuth(!showAuth);
                          if (activeWeatherPulse === "auth")
                            setActiveWeatherPulse(null);
                        }
                      }}
                    >
                      <Animated.View
                        style={
                          activeWeatherPulse === "auth"
                            ? { transform: [{ scale: weatherPulseAnim }] }
                            : undefined
                        }
                      >
                        <View
                          style={[
                            styles.authButton,
                            !climateUnlocked && styles.weatherButtonDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.authIcon,
                              !climateUnlocked && styles.weatherLockIcon,
                            ]}
                          >
                            {climateUnlocked ? "verified" : "lock"}
                          </Text>
                        </View>
                      </Animated.View>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.weatherLabel,
                        !climateUnlocked && styles.weatherLabelDisabled,
                      ]}
                    >
                      {climateUnlocked ? "Authenticity\nCheck" : "Not Reached"}
                    </Text>
                  </View>

                  <View style={styles.weatherConditionItem}>
                    <TouchableOpacity
                      activeOpacity={1}
                      disabled
                    >
                      <View
                        style={[styles.climateButton, styles.weatherButtonDisabled]}
                      >
                        <Text style={[styles.climateIcon, styles.weatherLockIcon]}>
                          lock
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <Text style={[styles.weatherLabel, styles.weatherLabelDisabled]}>
                      Not Reached
                    </Text>
                  </View>
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
    backgroundColor: "#f4f1ea4e",
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 22,
  },
  pageLabel: {
    fontFamily: "Quicksand",
    color: "transparent",
    fontSize: 18,
    marginBottom: 14,
  },
  canvas: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    position: "relative",
  },
  optionCard: {
    width: 150,
    marginLeft: -10,
    marginTop: -30,
    marginBottom: 0,
    backgroundColor: "#F4F1EA",
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
  },
  optionTitle: {
    fontFamily: "Quicksand",
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
    color: "#C77754",
    marginTop: -10,
    paddingBottom: 10,
    fontWeight: "bold",
  },
  optionItem: {
    width: "100%",
    height: 90,
    alignItems: "center",
    borderRadius: 18,
    marginTop: -10,
    borderWidth: 2,
    borderColor: "transparent",
    paddingTop: 8,
  },
  optionItemSelected: {
    shadowColor: "#C77754",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 15,
    shadowRadius: 8,
    elevation: 10,
  },
  iconWrapper: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  optionImage: {
    width: 90,
    height: 60,
    marginBottom: 6,
  },
  optionLabel: {
    fontFamily: "Quicksand",
    fontSize: 10,
    color: "#C77754",
  },

  woodenFramesOption: {
    marginTop: -10,
    marginLeft: 0,
  },
  woodenFramesOptionText: {
    marginTop: 0,
    marginLeft: -5,
  },
  aluminiumFramesOption: {
    marginTop: -8,
    marginLeft: 5,
  },
  aluminiumFramesOptionText: {
    marginTop: 0,
    marginLeft: -10,
  },
  glassPanelsOption: {
    marginTop: -4,
    marginLeft: 5,
  },
  glassPanelsOptionText: {
    marginTop: -10,
    marginLeft: -10,
  },
  steelFramesOption: {
    marginTop: -15,
    marginLeft: 5,
  },
  steelFramesOptionText: {
    marginTop: -5,
    marginLeft: -10,
  },
  optionLabelSelected: {
    color: "#AE5037",
  },
  buildArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 28,
    paddingBottom: 26,
  },
  infoBlock: {
    height: 70,
    marginTop: -30,
    maxWidth: 502,
    backgroundColor: "#AE5037",
    borderRadius: 28,
    paddingHorizontal: 24,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  infoText: {
    fontFamily: "Quicksand",
    fontSize: 12,
    color: "#F4F1EA",
    paddingTop: 10,
    paddingBottom: 10,
    lineHeight: 18,
    fontWeight: "500",
  },
  hintButton: {
    width: 50,
    height: 50,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    backgroundColor: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    marginLeft: 85,
  },
  hintIndicator: {
    position: "absolute",
    left: 250,
    bottom: 0,
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: "#f4f1ea",
    shadowColor: "#AE5037",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 14,
    shadowRadius: 8,
    elevation: 1,
    zIndex: 1,
  },
  hintIcon: {
    fontSize: 32,
    marginLeft: 0,
    shadowColor: "#f76911",
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
    paddingLeft: 55,
    paddingRight: 24,
    marginTop: 10,
    fontWeight: '500',
  },
  hintWrapper: {
    position: "absolute",
    left: 95,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  hintButtonOverlay: {
    position: "absolute",
    left: 0,
    bottom: 0,
    zIndex: 11,
    elevation: 11,
  },
  nextButton: {
    position: "absolute",
    right: 28,
    bottom: -25,
    minWidth: 100,
    maxHeight: 55,
    backgroundColor: "#F4F1EA",
    borderRadius: 40,
    paddingVertical: 13,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F4F1EA",
  },
  nextButtonText: {
    fontFamily: "Quicksand",
    fontSize: 18,
    color: "#53443D",
  },
  bottomRow: {
    position: "absolute",
    top: -30,
    right: 30,

    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",

    zIndex: 999,
    elevation: 999,
  },
  bottomWeatherIcons: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginBottom: -25,
    marginLeft: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    zIndex: 2,
    elevation: 5,
  },
  weatherConditionItem: {
    flexDirection: "column",
    alignItems: "center",
  },
  bottomWeatherExpanded: {
    height: 50,
    backgroundColor: "#605C39",
    borderRadius: 40,
    justifyContent: "center",
    paddingLeft: 18,
    paddingRight: 22,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  bottomWeatherText: {
    color: "#F4F1EA",
    fontFamily: "Quicksand",
    fontSize: 13,
  },
  weatherLabel: {
    marginTop: 4,
    fontFamily: "Quicksand",
    fontSize: 9,
    lineHeight: 10,
    color: "#605C39",
    textAlign: "center",
    fontWeight: "600",
  },
  weatherLockIcon: {
    color: "#5b5b5b",
  },
  weatherLabelDisabled: {
    color: "#242424",
  },
  windButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: "#605C39",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  tempButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: "#605C39",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  climateButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: "#605C39",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  authButton: {
    width: 50,
    height: 50,
    borderRadius: 33,
    backgroundColor: "#605C39",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  weatherButtonDisabled: {
    backgroundColor: "rgba(141, 141, 141, 0.16)",
    borderWidth: 1.5,
    borderColor: "#8D8D8D",
    borderStyle: "dashed",
    shadowOpacity: 0,
    elevation: 0,
  },
  windIcon: {
    fontFamily: "MaterialSymbolsOutlined",
    fontSize: 28,
    color: "#F4F1EA",
  },
  tempIcon: {
    fontFamily: "MaterialSymbolsOutlined",
    fontSize: 28,
    color: "#F4F1EA",
  },
  climateIcon: {
    fontFamily: "MaterialSymbolsOutlined",
    fontSize: 28,
    color: "#F4F1EA",
  },
  authIcon: {
    fontFamily: "MaterialSymbolsOutlined",
    fontSize: 28,
    color: "#F4F1EA",
  },
  windowWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -60,
    marginBottom: -30,
    position: "relative",
  },
  wallBasePosition: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -11,
    marginLeft: -1,
  },
  aluminiumWindowImage: {
    width: 740,
    height: 384,
    marginTop: 20,
    marginLeft: 0,
  },
  aluminiumWindowCrackedImage: {
    width: 740,
    height: 384,
    marginTop: -25,
    marginLeft: 0,
  },
  fullGlassImage: {
    width: 740,
    height: 384,
    marginTop: 40,
    marginLeft: 0,
  },
  fullGlassCrackedImage: {
    width: 740,
    height: 384,
    marginTop: 0,
    marginLeft: 0,
  },
  steelFramesImage: {
    width: 740,
    height: 384,
    marginTop: 40,
    marginLeft: 0,
  },
  steelFramesCrackedImage: {
    width: 740,
    height: 384,
    marginTop: 15,
    marginLeft: 0,
  },
  correctWindowImage: {
    marginTop: 30,
    marginLeft: 0,
  },
  openingWallImage: {
    marginTop: 30,
    marginLeft: 0,
  },
  buildAnimation: {
    width: 180,
    height: 180,
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#605C39",
  },
  successInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: -100,
  },
  successText: {
    fontFamily: "Quicksand",
    fontSize: 18,
    lineHeight: 28,
    color: "#F4F1EA",
    textAlign: "center",
    maxWidth: 760,
  },
  successButtonWrapper: {
    marginTop: 35,
  },
  successButton: {
    overflow: "hidden",
    backgroundColor: "rgba(244, 241, 234, 0.25)",
    minWidth: 100,
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  successButtonText: {
    fontFamily: "Quicksand",
    fontSize: 18,
    color: "#605C39",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#F4F1EA",
    minWidth: 140,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 27,
  },
  buttonText: {
    fontFamily: "Quicksand",
    fontSize: 18,
    color: "#605C39",
    fontWeight: "600",
  },
  levelIndicator: {
    width: 90,
    height: 110,
    marginLeft: 25,
    marginTop: -30,
    marginRight: -35,
    backgroundColor: "#F4F1EA",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  levelIndicatorText: {
    fontFamily: "Quicksand",
    fontSize: 18,
    color: "#53443D",
    transform: [{ rotate: "-90deg" }],
    marginLeft: -40,
  },
  foundationIntroContainer: {
    flex: 1,
    backgroundColor: "#AE5037",
  },
  foundationIntroInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  leveloneIndicatorText: {
    fontFamily: "Quicksand",
    fontSize: 30,
    color: "#F4F1EA",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    marginBottom: 20,
    marginTop: -60,
  },
  foundationIntroText: {
    fontFamily: "Quicksand",
    fontSize: 18,
    lineHeight: 28,
    color: "#F4F1EA",
    textAlign: "center",
    maxWidth: 700,
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  foundationIntroButton: {
    position: "absolute",
    bottom: 41,
    backgroundColor: "#F4F1EA",
    minWidth: 140,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  foundationIntroButtonText: {
    fontFamily: "Quicksand",
    fontSize: 18,
    color: "#AE5037",
    fontWeight: "600",
  },
});
