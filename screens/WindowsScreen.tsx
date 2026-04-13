import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';

import WoodenFames from '../assets/wooden-frame.svg';
import AluminiumFrames from '../assets/aluminium-frame.svg';
import FullGlassPanels from '../assets/full-glass.svg';
import SteelFrames from '../assets/steel-frame.svg';
import WindowBase from '../assets/windows.svg'

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
  { id: 'wooden-frames', label: 'Wooden Frames', image: WoodenFames },
  { id: 'aluminium-frames', label: 'Aluminium Frames', image: AluminiumFrames },
  { id: 'glass-panels', label: 'Glass Panels', image: FullGlassPanels },
  { id: 'steel-frames', label: 'Steel Frames', image: SteelFrames },
];

const correctAnswer = 'wooden-frames';

export default function WindowsScreen({ onNext }: WindowsScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

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

  const isCorrect = selectedOption === correctAnswer;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.screen}>
        <Text style={styles.pageLabel}>Building Page</Text>

        <View style={styles.canvas}>
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>
            Choose the{'\n'}correct wall material
            </Text>

            {windowOptions.map((option) => {
              const isSelected = selectedOption === option.id;
              const SvgImage = option.image;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedOption(option.id)}
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
            <View style={styles.windowWrapper}>
            <WindowBase width={730} height={370} />
            </View>
            <View style={styles.bottomRow}>
              <View style={styles.hintWrapper}>
                {showHint && (
                    <View style={styles.hintExpanded}>
                    <Text style={styles.hintText}>
                        Walls help regulate heat and protect the interior from weather.
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
                    if (isCorrect) {
                    onNext();
                    }
                }}
                >
                <View
                    style={[
                        styles.nextButton,
                        isCorrect && styles.nextButtonActive,
                    ]}
                    >
                    <Text
                        style={[
                            styles.nextButtonText,
                            isCorrect && styles.nextButtonTextActive,
                        ]}
                        >
                    {isCorrect ? 'Next Level' : 'Level 2'}
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
windowWrapper: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: -60,
  marginBottom: -45,
},
nextButtonTextActive: {
  color: '#F4F1EA',
},
});