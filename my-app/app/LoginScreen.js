import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import api from "../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("Login pressed", email, password);

    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);
      Alert.alert("Success", res.data.message);

      // router.replace("/(tabs)");
    } catch (err) {
      console.log("LOGIN ERROR:", err?.response?.data);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          style={styles.input}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
        <Text style={styles.forgotText}>
          <Text
            style={styles.link}
            onPress={() => router.push("/ForgetPassword")}
          >
            Quên mật khẩu?
          </Text>
        </Text>
        <Text style={styles.footerText}>
          Don’t have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/register")}
          >
            Register
          </Text>
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F6", // nền hồng rất nhạt
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#F06292",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#E91E63", // hồng đậm
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F3C1D6",
    backgroundColor: "#FFF5F8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#F06292", // nút hồng chủ đạo
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  forgotText: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    color: "#666",
  },
  footerText: {
    textAlign: "center",
    marginTop: 15,
    color: "#666",
  },
  link: {
    color: "#E91E63",
    fontWeight: "bold",
  },
});
