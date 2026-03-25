import { useCallback } from "react";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

export function useDownload() {
  const downloadToGallery = useCallback(async (url: string, styleId: string) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant media library access to save images.");
      return false;
    }

    try {
      const fileUri = FileSystem.cacheDirectory + `clipart_${styleId}_${Date.now()}.png`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      await MediaLibrary.saveToLibraryAsync(uri);
      return true;
    } catch (e: any) {
      Alert.alert("Download Failed", e.message || "Could not save image.");
      return false;
    }
  }, []);

  const shareImage = useCallback(async (url: string, styleId: string) => {
    try {
      const fileUri = FileSystem.cacheDirectory + `clipart_${styleId}_${Date.now()}.png`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share your clipart",
      });
    } catch (e: any) {
      Alert.alert("Share Failed", e.message || "Could not share image.");
    }
  }, []);

  return { downloadToGallery, shareImage };
}
