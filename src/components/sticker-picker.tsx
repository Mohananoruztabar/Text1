import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const stickers = [
  require('../../assets/images/emoji1.png'),
  require('../../assets/images/emoji2.png'),
  require('../../assets/images/emoji3.png'),
  require('../../assets/images/emoji4.png'),
  require('../../assets/images/emoji5.png'),
  require('../../assets/images/emoji6.png'),
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (source: number) => void;
};

export default function StickerPicker({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sticker picker"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
        >
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              Choose a sticker
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close sticker picker"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <FontAwesome name="close" size={22} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.stickerList}>
            {stickers.map((source, index) => (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityLabel={`Choose emoji sticker ${index + 1}`}
                onPress={() => onSelect(source)}
                style={({ pressed }) => [styles.stickerButton, pressed && styles.pressed]}
              >
                <Image source={source} style={styles.stickerImage} contentFit="contain" />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0008',
  },
  sheet: {
    backgroundColor: '#25292e',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  header: {
    minHeight: 64,
    paddingLeft: 24,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stickerList: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  stickerButton: {
    width: '30%',
    maxWidth: 100,
    aspectRatio: 1,
    padding: 6,
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.75,
  },
});
