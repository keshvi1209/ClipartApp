import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

interface SkeletonCardProps {
  delay?: number;
}

export function SkeletonCard({ delay = 0 }: SkeletonCardProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.image} />
      <View style={styles.footer}>
        <View style={styles.labelShort} />
        <View style={styles.labelLong} />
      </View>
    </Animated.View>
  );
}

export function SkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} delay={i * 120} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    backgroundColor: "#13131A",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E1E2A",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#1E1E2A",
  },
  footer: {
    padding: 10,
    gap: 6,
  },
  labelShort: {
    height: 10,
    width: "40%",
    backgroundColor: "#1E1E2A",
    borderRadius: 6,
  },
  labelLong: {
    height: 8,
    width: "65%",
    backgroundColor: "#1E1E2A",
    borderRadius: 6,
  },
});
