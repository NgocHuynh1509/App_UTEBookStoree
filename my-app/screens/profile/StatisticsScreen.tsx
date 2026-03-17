import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  RefreshControl, SafeAreaView, ActivityIndicator,
  StatusBar, Platform,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../hooks/useAuth";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

// 🎨 Palette (giữ giống file bạn)
const C = {
  primary: "#1565C0",
  primaryMid: "#1E88E5",
  primarySoft: "#E3F2FD",
  primaryTint: "#BBDEFB",
  bg: "#F0F6FF",
  surface: "#FFFFFF",
  border: "#DDEEFF",
  text1: "#0D1B3E",
  text2: "#4A5980",
  text3: "#9AA8C8",
  green: "#00897B",
};

const StatisticsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [data, setData] = useState({
    pending: 0,
    shipping: 0,
    completed: 0,
    total: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ================= API =================
  const fetchStatistics = async () => {
    if (!user?.id) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/api/orders/statistics/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const result = await res.json();
      setData(result || {});
    } catch (err) {
      console.error("Lỗi thống kê:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
    }, [user?.id])
  );

  // ================= Loading =================
  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />
        <ActivityIndicator size="large" color={C.primaryMid} />
        <Text style={{ color: C.text3, marginTop: 10 }}>
          Đang tải thống kê...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerBlob1} />
        <View style={s.headerBlob2} />

        <View style={s.headerTop}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <Text style={s.headerTitle}>Thống kê chi tiêu</Text>

          <View style={{ width: 38 }} />
        </View>

        <View style={s.countStrip}>
          <Ionicons name="cash-outline" size={15} color="#FFF" />
          <Text style={s.countTxt}>
            Tổng chi: {data.total?.toLocaleString()} VND
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchStatistics}
            colors={[C.primaryMid]}
          />
        }
      >
        {/* CARD */}
        <View style={s.card}>
          <Text style={s.label}>⏳ Chờ xác nhận</Text>
          <Text style={s.value}>{data.pending.toLocaleString()} đ</Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>🚚 Đang giao</Text>
          <Text style={s.value}>{data.shipping.toLocaleString()} đ</Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>✅ Đã giao</Text>
          <Text style={s.value}>{data.completed.toLocaleString()} đ</Text>
        </View>

        {/* TOTAL */}
        <View style={s.totalCard}>
          <Text style={s.totalText}>Tổng chi tiêu</Text>
          <Text style={s.totalValue}>
            {data.total.toLocaleString()} đ
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ================= STYLE =================
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.primaryMid,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center"
  },

  countStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },

  countTxt: {
    color: "#fff"
  },

  scroll: {
    padding: 16
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  label: {
    fontSize: 15,
    color: C.text2
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.primary
  },

  totalCard: {
    backgroundColor: C.primary,
    padding: 18,
    borderRadius: 18,
    marginTop: 10,
    alignItems: "center"
  },

  totalText: {
    color: "#fff",
    fontSize: 16
  },

  totalValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },

  headerBlob1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -60,
    right: -40,
  },

  headerBlob2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -20,
    left: "40%",
  },
});

export default StatisticsScreen;