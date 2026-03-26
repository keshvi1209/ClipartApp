import { useState, useCallback, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function useImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const isPickingRef = useRef(false);

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    if (isPickingRef.current) return null;
    isPickingRef.current = true;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant gallery access in Settings.");
        return null;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as any,
        allowsEditing: true,
        aspect: [1, 1] as [number, number],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        return uri;
      }
      return null;
    } catch (e) {
      console.log("Gallery error:", e);
      Alert.alert("Error", "Failed to open gallery.");
      return null;
    } finally {
      isPickingRef.current = false;
    }
  }, []);

  const pickFromCamera = useCallback(async (): Promise<string | null> => {
    if (isPickingRef.current) return null;
    isPickingRef.current = true;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera access in Settings.");
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1] as [number, number],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        return uri;
      }
      return null;
    } catch (e) {
      console.log("Camera error:", e);
      Alert.alert("Error", "Failed to open camera.");
      return null;
    } finally {
      isPickingRef.current = false;
    }
  }, []);

  const clearImage = useCallback(() => setImageUri(null), []);

  return { imageUri, pickFromGallery, pickFromCamera, clearImage };
}