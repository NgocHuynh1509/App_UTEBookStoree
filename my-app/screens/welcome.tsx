import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function WelcomeScreen({ navigation, route }: any) {
  const { username, email } = route.params || {};

  const handleLogout = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎉</Text>

        <Text style={styles.title}>Chào mừng!</Text>
        <Text style={styles.subtitle}>Đăng nhập thành công</Text>

        {username && (
          <View style={styles.infoBox}>
            <Text style={styles.label}>Xin chào,</Text>
            <Text style={styles.username}>{username}</Text>
          </View>
        )}

        {email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Email:</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.message}>
          Bạn đã đăng nhập thành công vào ứng dụng. Chúc bạn có trải nghiệm tuyệt vời!
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE7EE", // Hồng champagne nhạt
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF9FB", // Trắng pha hồng sữa
    borderRadius: 26,
    padding: 30,
    alignItems: "center",
    shadowColor: "#D98AA6",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 7,
    borderWidth: 1.5,
    borderColor: "#F1B7CB",
  },
  emoji: {
    fontSize: 70,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#C63A78", // Hồng berry trầm
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#AF6F8E",
    marginBottom: 26,
  },
  infoBox: {
    backgroundColor: "#FDEFF5",
    borderRadius: 16,
    padding: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EFB3C8",
  },
  label: {
    fontSize: 14,
    color: "#AF6F8E",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#C63A78",
    marginTop: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#AF6F8E",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: "#C63A78",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#EFB3C8",
    width: "100%",
    marginVertical: 22,
  },
  message: {
    textAlign: "center",
    color: "#AF6F8E",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 26,
  },
  button: {
    backgroundColor: "#E85B91", // Rose đậm sang
    paddingVertical: 12,
    paddingHorizontal: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F2A0C1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
