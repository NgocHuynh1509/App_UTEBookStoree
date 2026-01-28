import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { saveUser } = useAuth();

  const login = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      const res = await api.post("/login", { email, password });

      saveUser({
        id: res.data.user.id.toString(),
        username: res.data.user.username,
        email: res.data.user.email,
        token: res.data.token,
      });

      // 👉 Điều hướng đúng chuẩn
      navigation.replace("Home");
    } catch {
      Alert.alert("Đăng nhập thất bại", "Sai email hoặc mật khẩu");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to my app</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don't have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Register")}
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
    backgroundColor: "#FFE8EF", // Hồng nude rất nhạt
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF7FA", // Trắng hồng sữa
    borderRadius: 24,
    padding: 28,
    shadowColor: "#D98AA8",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
    borderWidth: 1.5,
    borderColor: "#F2B4C8",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#C73776", // Hồng berry trầm
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#B0728F",
    marginBottom: 30,
    fontSize: 15,
  },
  input: {
    backgroundColor: "#FFEFF5",
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EFB2C6",
    color: "#9B2C5F",
  },
  button: {
    backgroundColor: "#E5568C", // Rose đậm
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  forgotText: {
    textAlign: "center",
    marginTop: 16,
    color: "#C73776",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footerText: {
    textAlign: "center",
    marginTop: 22,
    color: "#B0728F",
    fontSize: 14,
  },
  link: {
    color: "#C73776",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
