//import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
//import { router } from 'expo-router';
//import { useState } from 'react';
//import api from '../services/api';
//
//export default function Register() {
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState('');
//  const [password, setPassword] = useState('');
//
//  const register = async () => {
//    if (!username || !email || !password) {
//      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
//      return;
//    }
//
//    try {
//      const res = await api.post('/register', {
//        username,
//        email,
//        password,
//      });
//
//      Alert.alert('Thành công', 'Đăng ký thành công!');
//      // Chuyển đến trang welcome với thông tin user
//      router.replace({
//        pathname: '/welcome',
//        params: {
//          username: username,
//          email: email,
//        },
//      });
//    } catch (err) {
//      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại';
//      Alert.alert('Lỗi', errorMessage);
//      console.log('Register error:', err.response?.data || err.message);
//    }
//  };
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>Create Account</Text>
//
//      <TextInput
//        style={styles.input}
//        placeholder="Username"
//        value={username}
//        onChangeText={setUsername}
//      />
//
//      <TextInput
//        style={styles.input}
//        placeholder="Email"
//        value={email}
//        onChangeText={setEmail}
//      />
//
//      <TextInput
//        style={styles.input}
//        placeholder="Password"
//        secureTextEntry
//        value={password}
//        onChangeText={setPassword}
//      />
//
//      <TouchableOpacity style={styles.button} onPress={register}>
//        <Text style={styles.buttonText}>Register</Text>
//      </TouchableOpacity>
//
//      <TouchableOpacity onPress={() => router.replace('/login')}>
//        <Text style={styles.link}>Already have an account? Login</Text>
//      </TouchableOpacity>
//    </View>
//  );
//}
//
///* ===== STYLE ===== */
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    backgroundColor: '#FFF0F6', // nền hồng rất nhạt
//    justifyContent: 'center',
//    padding: 24,
//  },
//  title: {
//    fontSize: 32,
//    fontWeight: 'bold',
//    textAlign: 'center',
//    marginBottom: 32,
//    color: '#E91E63', // hồng đậm
//  },
//  input: {
//    backgroundColor: '#FFFFFF',
//    padding: 14,
//    borderRadius: 12,
//    marginBottom: 16,
//    fontSize: 16,
//    borderWidth: 1,
//    borderColor: '#F3C1D6',
//    color: '#333',
//    elevation: 2,
//  },
//  button: {
//    backgroundColor: '#F06292', // hồng chủ đạo
//    padding: 16,
//    borderRadius: 12,
//    alignItems: 'center',
//    marginTop: 8,
//  },
//  buttonText: {
//    color: '#FFFFFF',
//    fontSize: 18,
//    fontWeight: 'bold',
//  },
//  link: {
//    textAlign: 'center',
//    marginTop: 20,
//    color: '#E91E63',
//    fontSize: 14,
//    fontWeight: '500',
//  },
//});
//

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import api from '../services/api';

export default function Register() {
  const [step, setStep] = useState(1);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  /* ================= STEP 1: SEND OTP ================= */

  const sendOTP = async () => {
    if (!username || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await api.post('/register/send-otp', { email });
      Alert.alert('Thành công', 'Mã OTP đã được gửi đến email');
      setStep(2);
    } catch (err) {
      Alert.alert(
        'Lỗi',
        err.response?.data?.message || 'Không thể gửi OTP'
      );
    }
  };

  /* ================= STEP 2: VERIFY OTP & REGISTER ================= */

  const register = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }

    try {
      await api.post('/register', {
        username,
        email,
        password,
        otp,
      });

      Alert.alert('Thành công', 'Đăng ký thành công');

      router.replace({
        pathname: '/welcome',
        params: { username, email },
      });
    } catch (err) {
      Alert.alert(
        'Lỗi',
        err.response?.data?.message || 'Đăng ký thất bại'
      );
    }
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={sendOTP}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.subtitle}>
            Mã OTP đã được gửi đến email:
          </Text>
          <Text style={styles.emailText}>{email}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập mã OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity style={styles.button} onPress={register}>
            <Text style={styles.buttonText}>Verify & Register</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={sendOTP}>
            <Text style={styles.link}>Gửi lại mã OTP</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLE ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F6',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#E91E63',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 4,
  },
  emailText: {
    textAlign: 'center',
    color: '#E91E63',
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#F3C1D6',
    color: '#333',
  },
  button: {
    backgroundColor: '#F06292',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    marginTop: 16,
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '500',
  },
});
