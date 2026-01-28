import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import api from "../services/api";

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + info
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Bước 1: Gửi OTP
  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/register/send-otp", { email });
      Alert.alert("Thành công", res.data.message || "OTP đã được gửi tới email");
      setStep(2);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể gửi OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh OTP & đăng ký
  const handleRegister = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP 6 số");
      return;
    }

    if (!username) {
      Alert.alert("Lỗi", "Vui lòng nhập username");
      return;
    }

    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await api.post("/register", {
        username,
        email,
        password,
        otp,
      });

      Alert.alert("Thành công", "Đăng ký thành công!", [
        {
          text: "OK",
          onPress: () => navigation.replace("Login"),
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Đăng ký thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await api.post("/register/send-otp", { email });
      Alert.alert("Thành công", "Mã OTP mới đã được gửi!");
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể gửi lại OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // Quay lại
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } else {
      navigation.replace("Login");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Nhập email để nhận mã OTP"
              : "Nhập mã OTP và thông tin tài khoản"}
          </Text>

          {step === 1 ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Gửi mã OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.emailInfo}>
                <Text style={styles.emailLabel}>Email: </Text>
                <Text style={styles.emailValue}>{email}</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Mã OTP (6 số)"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Đăng ký</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={loading}
              >
                <Text style={styles.resendText}>Gửi lại mã OTP</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>
              {step === 1 ? "Đã có tài khoản? Đăng nhập" : "Quay lại"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9F2", // Hồng pha lavender rất nhạt
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF8FB", // Trắng hồng sương
    borderRadius: 24,
    padding: 28,
    shadowColor: "#D487A6",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
    borderWidth: 1.5,
    borderColor: "#EFB6CD",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#C23A7E", // Hồng tím berry
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#A86C8F",
    marginBottom: 26,
    fontSize: 15,
  },
  emailInfo: {
    flexDirection: "row",
    backgroundColor: "#FDEFF6",
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9B3C9",
  },
  emailLabel: {
    color: "#A86C8F",
    fontWeight: "600",
  },
  emailValue: {
    color: "#C23A7E",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#FDEFF6",
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9B3C9",
    color: "#8F2E5F",
  },
  button: {
    backgroundColor: "#E05A96", // Rose tím đậm
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#F0A7C5",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  resendButton: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    color: "#C23A7E",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  backButton: {
    marginTop: 22,
    alignItems: "center",
  },
  backText: {
    color: "#A86C8F",
    fontSize: 14,
  },
});
