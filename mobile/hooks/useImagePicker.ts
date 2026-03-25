import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function useImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant gallery access in Settings.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Validate format
      const ext = asset.uri.split(".").pop()?.toLowerCase();
      if (ext && !["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) {
        Alert.alert("Unsupported Format", "Please use JPG, PNG, or WEBP images.");
        return;
      }
      setImageUri(asset.uri);
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera access in Settings.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const clearImage = useCallback(() => setImageUri(null), []);

  return { imageUri, pickFromGallery, pickFromCamera, clearImage };
}
