import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";

export default function NotFoundScreen() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Page Not Found", headerShown: false }} />

      <Animated.Text
        style={[
          styles.emoji,
          {
            transform: [{
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20]
              })
            }]
          }
        ]}>
        😕
      </Animated.Text>

      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.subtitle}>This screen doesn't exist.</Text>

      <Link href="/" style={styles.link}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Go to Home Screen</Text>
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 30,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
