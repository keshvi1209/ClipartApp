import React, { useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Text,
} from "react-native";

const { width } = Dimensions.get("window");

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  height?: number;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  height = 300,
}: BeforeAfterSliderProps) {
  const sliderWidth = width - 40; // Accounting for padding
  const position = useRef(new Animated.Value(sliderWidth / 2)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPos = gestureState.moveX - 20; // Account for left padding
        if (newPos >= 0 && newPos <= sliderWidth) {
          position.setValue(newPos);
        }
      },
    })
  ).current;

  const sliderOpacity = position.interpolate({
    inputRange: [0, sliderWidth],
    outputRange: [0, 1],
  });

  return (
    <View
      style={[styles.container, { height }]}
      {...panResponder.panHandlers}
    >
      {/* Before Image */}
      <Image
        source={{ uri: beforeImage }}
        style={[styles.image, { height }]}
        resizeMode="cover"
      />

      {/* After Image Overlay */}
      <Animated.View
        style={[
          styles.afterImageContainer,
          { height, width: position },
          { opacity: sliderOpacity },
        ]}
      >
        <Image
          source={{ uri: afterImage }}
          style={[styles.image, { height }]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Slider Handle */}
      <Animated.View
        style={[
          styles.sliderHandle,
          {
            left: Animated.add(position, -2),
            top: height / 2 - 30,
          },
        ]}
      >
        <View style={styles.handleLine} />
        <View style={styles.handleArrowLeft}>
          <View style={styles.arrow} />
        </View>
        <View style={styles.handleArrowRight}>
          <View style={styles.arrow} />
        </View>
      </Animated.View>

      {/* Labels */}
      <View style={styles.beforeLabel}>
        <View style={styles.labelBg}>
          <Text style={styles.labelText}>BEFORE</Text>
        </View>
      </View>

      <View style={styles.afterLabel}>
        <View style={styles.labelBg}>
          <Text style={styles.labelText}>AFTER</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#1E1E2A",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
  },
  afterImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  sliderHandle: {
    position: "absolute",
    width: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  handleLine: {
    width: 3,
    height: 60,
    backgroundColor: "#A78BFA",
    borderRadius: 2,
  },
  handleArrowLeft: {
    position: "absolute",
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
    left: -8,
    backgroundColor: "#7C3AED",
    borderRadius: 50,
  },
  handleArrowRight: {
    position: "absolute",
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
    right: -8,
    backgroundColor: "#7C3AED",
    borderRadius: 50,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
  },
  beforeLabel: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  afterLabel: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  labelBg: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  labelText: {
    color: "#F1F0FF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
