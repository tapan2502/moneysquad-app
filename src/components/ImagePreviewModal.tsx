import React from "react";
import { Modal, View, StyleSheet, Image, TouchableOpacity, Pressable, Text, Dimensions } from "react-native";
import { X } from "lucide-react-native";

type Props = {
  visible: boolean;
  uri?: string | null;
  onClose: () => void;
  title?: string;
};

const ImagePreviewModal: React.FC<Props> = ({ visible, uri, onClose, title }) => {
  const shouldShow = visible && !!uri;

  return (
    <Modal
      visible={shouldShow}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.content}>
          <View style={styles.header}>
            {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : <View style={{ flex: 1 }} />}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close image preview"
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 18, 33, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(71, 85, 105, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: Dimensions.get("window").height * 0.55,
    borderRadius: 14,
    backgroundColor: "#111827",
  },
});

export default ImagePreviewModal;
