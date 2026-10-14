import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const resizeAnimation = { duration: 200 };

function clampOffset(offset: number, frameSize: number, stickerSize: number) {
  'worklet';
  const limit = Math.max(0, (frameSize - stickerSize) / 2);
  return Math.max(-limit, Math.min(limit, offset));
}

type Props = {
  source: number;
  enabled?: boolean;
  onDisplay?: () => void;
  photoWidth: number;
  photoHeight: number;
};

export default function InteractiveSticker({
  source,
  photoWidth,
  photoHeight,
  enabled = true,
  onDisplay,
}: Props) {
  const initialSize = Math.min(100, photoWidth / 2, photoHeight / 2);
  const size = useSharedValue(initialSize);
  const enlarged = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const drag = Gesture.Pan()
    .enabled(enabled)
    .minDistance(8)
    .onStart(() => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      startX.value = clampOffset(translateX.value, photoWidth, size.value);
      startY.value = clampOffset(translateY.value, photoHeight, size.value);
    })
    .onUpdate((event) => {
      translateX.value = clampOffset(startX.value + event.translationX, photoWidth, size.value);
      translateY.value = clampOffset(startY.value + event.translationY, photoHeight, size.value);
    });

  const doubleTap = Gesture.Tap()
    .enabled(enabled)
    .numberOfTaps(2)
    .maxDistance(8)
    .onEnd((_event, success) => {
      if (!success) return;

      enlarged.value = !enlarged.value;
      const nextSize = enlarged.value ? initialSize * 2 : initialSize;
      size.value = withTiming(nextSize, resizeAnimation);
      // Move inward as needed so enlarging at an edge keeps the whole sticker visible.
      translateX.value = withTiming(
        clampOffset(translateX.value, photoWidth, nextSize),
        resizeAnimation,
      );
      translateY.value = withTiming(
        clampOffset(translateY.value, photoHeight, nextSize),
        resizeAnimation,
      );
    });

  const animatedStyle = useAnimatedStyle(() => ({
    width: size.value,
    height: size.value,
    left: (photoWidth - size.value) / 2,
    top: (photoHeight - size.value) / 2,
    transform: [
      { translateX: clampOffset(translateX.value, photoWidth, size.value) },
      { translateY: clampOffset(translateY.value, photoHeight, size.value) },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Race(drag, doubleTap)} touchAction="none">
      <Animated.View
        collapsable={false}
        accessible
        accessibilityLabel="Emoji sticker on your photo"
        accessibilityHint="Drag to move. Double-tap to enlarge or shrink."
        style={[styles.container, animatedStyle]}
      >
        <Image
          source={source}
          style={styles.image}
          contentFit="contain"
          draggable={false}
          onDisplay={onDisplay}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
