import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import InteractiveSticker from '../components/interactive-sticker';
import StickerPicker from '../components/sticker-picker';

const backgroundImage = require('../../assets/images/background-image.png');

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isMobileView = width < 768;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isStickerPickerVisible, setIsStickerPickerVisible] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoReady, setIsPhotoReady] = useState(false);
  const [isStickerReady, setIsStickerReady] = useState(false);
  const photoRef = useRef<View>(null);
  const saveInProgress = useRef(false);
  const pickerOpen = useRef(false);
  const [photoWidth, setPhotoWidth] = useState(0);
  const [photoSize, setPhotoSize] = useState({ width: 0, height: 0 });

  const choosePhoto = async () => {
    if (pickerOpen.current) return;

    pickerOpen.current = true;
    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        if (result.assets[0].uri !== selectedImage) setIsPhotoReady(false);
        setSelectedImage(result.assets[0].uri);
        setSelectedSticker(null);
        setShowOptions(true);
      }
    } catch {
      Alert.alert('Unable to choose a photo', 'Please try again.');
    } finally {
      pickerOpen.current = false;
      setIsPicking(false);
    }
  };

  const reset = () => {
    setShowOptions(false);
    setSelectedSticker(null);
    setIsStickerPickerVisible(false);
  };

  const chooseSticker = (source: number) => {
    if (source !== selectedSticker) setIsStickerReady(false);
    setSelectedSticker(source);
    setIsStickerPickerVisible(false);
  };

  const canSave =
    isPhotoReady &&
    (selectedSticker === null || isStickerReady) &&
    photoSize.width > 0 &&
    photoSize.height > 0;

  const savePhoto = async () => {
    if (saveInProgress.current || !canSave || !photoRef.current) return;

    saveInProgress.current = true;
    setIsSaving(true);
    try {
      if (Platform.OS === 'web') {
        const domToImage = (await import('dom-to-image')).default;
        // React Native Web exposes the View ref as its underlying DOM element.
        const photoElement = photoRef.current as unknown as HTMLElement;
        const dataUrl = await domToImage.toPng(photoElement, {
          width: photoSize.width,
          height: photoSize.height,
        });
        const link = document.createElement('a');
        link.download = 'sticker-smash.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        try {
          link.click();
        } finally {
          link.remove();
        }
        return;
      }

      // Load the native media library only on a supported platform.
      const MediaLibrary = await import('expo-media-library');
      let permission = await MediaLibrary.getPermissionsAsync(true, []);
      if (!permission.granted && permission.canAskAgain) {
        permission = await MediaLibrary.requestPermissionsAsync(true, []);
      }
      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          permission.canAskAgain
            ? 'Allow photo-library access to save your image.'
            : 'Enable photo-library access in your phone settings to save your image.',
        );
        return;
      }

      const { captureRef, releaseCapture } = await import('react-native-view-shot');
      const capturedUri = await captureRef(photoRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      try {
        const localUri = capturedUri.startsWith('file://') ? capturedUri : `file://${capturedUri}`;
        await MediaLibrary.Asset.create(localUri);
      } finally {
        try {
          releaseCapture(capturedUri);
        } catch {
          // Temporary captures are also cleaned up when the app closes.
        }
      }
      Alert.alert('Saved!', 'Your image was saved to your photo library.');
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Unable to save image. Please try again.');
      } else {
        Alert.alert('Unable to save image', 'Please try again.');
      }
    } finally {
      saveInProgress.current = false;
      setIsSaving(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View
          style={styles.photoArea}
          onLayout={({ nativeEvent: { layout } }) => {
            // Reserve the controls' height and fit the photo into the remaining space.
            setPhotoWidth(Math.max(0, Math.min(320, layout.width, layout.height * (320 / 440))));
          }}
        >
          <View
            ref={photoRef}
            collapsable={false}
            style={[styles.photoFrame, { width: photoWidth }]}
            onLayout={({ nativeEvent: { layout } }) => {
              setPhotoSize((current) =>
                current.width === layout.width && current.height === layout.height
                  ? current
                  : { width: layout.width, height: layout.height },
              );
            }}
          >
            <Image
              source={selectedImage ? { uri: selectedImage } : backgroundImage}
              style={styles.image}
              contentFit="cover"
              onLoadStart={() => setIsPhotoReady(false)}
              onDisplay={() => setIsPhotoReady(true)}
              onError={() => setIsPhotoReady(false)}
              accessible
              accessibilityLabel={
                selectedImage ? 'Your selected photo' : 'A pool beside a palm-lined boardwalk'
              }
            />
            {selectedSticker !== null && photoSize.width > 0 && photoSize.height > 0 && (
              <InteractiveSticker
                key={`${selectedSticker}-${photoSize.width}-${photoSize.height}`}
                source={selectedSticker}
                photoWidth={photoSize.width}
                photoHeight={photoSize.height}
                enabled={!isSaving}
                onDisplay={() => setIsStickerReady(true)}
              />
            )}
          </View>
        </View>
        {showOptions ? (
          <View style={[styles.optionsRow, isMobileView && styles.mobileOptionsRow]}>
            <View style={[styles.optionSlot, isMobileView && styles.mobileOptionSlot]}>
              <Pressable
                accessibilityRole="button"
                onPress={reset}
                disabled={isSaving}
                accessibilityState={{ disabled: isSaving }}
                style={({ pressed }) => [styles.optionButton, (pressed || isSaving) && styles.pressed]}
              >
                <FontAwesome name="refresh" size={24} color="#fff" />
                <Text style={styles.buttonLabel}>Reset</Text>
              </Pressable>
            </View>
            <View style={styles.addButtonBorder}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add a sticker"
                onPress={() => setIsStickerPickerVisible(true)}
                disabled={isSaving}
                accessibilityState={{ disabled: isSaving }}
                style={({ pressed }) => [styles.addButton, (pressed || isSaving) && styles.pressed]}
              >
                <FontAwesome name="plus" size={32} color="#25292e" />
              </Pressable>
            </View>
            <View style={[styles.optionSlot, isMobileView && styles.mobileOptionSlot]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save image"
                accessibilityState={{ disabled: isSaving || !canSave, busy: isSaving }}
                disabled={isSaving || !canSave}
                onPress={savePhoto}
                style={({ pressed }) => [
                  styles.optionButton,
                  (pressed || isSaving || !canSave) && styles.pressed,
                ]}
              >
                <FontAwesome name="download" size={24} color="#fff" />
                <Text style={styles.buttonLabel}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.buttons}>
            <View style={styles.primaryButtonBorder}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isPicking, busy: isPicking }}
                disabled={isPicking}
                onPress={choosePhoto}
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  (pressed || isPicking) && styles.pressed,
                ]}
              >
                <FontAwesome name="picture-o" size={18} color="#25292e" />
                <Text style={styles.primaryButtonLabel}>Choose a photo</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={isPicking}
              accessibilityState={{ disabled: isPicking }}
              onPress={() => setShowOptions(true)}
              style={({ pressed }) => [styles.button, (pressed || isPicking) && styles.pressed]}
            >
              <Text style={styles.buttonLabel}>Use this photo</Text>
            </Pressable>
          </View>
        )}
      </View>
      <StickerPicker
        visible={isStickerPickerVisible}
        onClose={() => setIsStickerPickerVisible(false)}
        onSelect={chooseSticker}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
    overflow: 'hidden',
  },
  photoArea: {
    flex: 1,
    minHeight: 0,
    maxHeight: 440,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoFrame: {
    aspectRatio: 320 / 440,
    borderRadius: 18,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  buttons: {
    flexShrink: 0,
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  primaryButtonBorder: {
    borderColor: '#ffd33d',
    borderWidth: 4,
    borderRadius: 18,
    padding: 3,
  },
  button: {
    minHeight: 54,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
  },
  primaryButtonLabel: {
    color: '#25292e',
    fontSize: 16,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
  optionsRow: {
    flexShrink: 0,
    width: '100%',
    maxWidth: 320,
    minHeight: 134,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSlot: {
    flex: 1,
    alignItems: 'center',
  },
  mobileOptionsRow: {
    justifyContent: 'space-between',
  },
  mobileOptionSlot: {
    flex: 0,
  },
  optionButton: {
    minWidth: 64,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonBorder: {
    width: 84,
    height: 84,
    borderWidth: 4,
    borderColor: '#ffd33d',
    borderRadius: 42,
    padding: 3,
  },
  addButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 42,
    backgroundColor: '#fff',
  },
  pressed: {
    opacity: 0.75,
  },
});
