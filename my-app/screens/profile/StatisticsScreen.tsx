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
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
const screenWidth = Dimensions.get("window").width;

// 🎨 Palette
const C = {
  primary: "#1565C0",
  primaryMid: "#1E88E5",
  bg: "#F0F6FF",
  text1: "#0D1B3E",
  text2: "#4A5980",
  text3: "#9AA8C8",
};

const StatisticsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [data, setData] = useState({
    pending: { count: 0, money: 0 },
    shipping: { count: 0, money: 0 },
    completed: { count: 0, money: 0 },
    totalMoney: 0,
    totalOrders: 0
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

      // chống null crash
      setData(result || {
        pending: { count: 0, money: 0 },
        shipping: { count: 0, money: 0 },
        completed: { count: 0, money: 0 },
        totalMoney: 0,
        totalOrders: 0
      });

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

  // ================= CHART =================
  const pieData = [
    {
      name: "Chờ",
      population: data.pending.count,
      color: "#FB8C00",
      legendFontColor: "#333",
      legendFontSize: 13,
    },
    {
      name: "Đang giao",
      population: data.shipping.count,
      color: "#8E24AA",
      legendFontColor: "#333",
      legendFontSize: 13,
    },
    {
      name: "Hoàn thành",
      population: data.completed.count,
      color: "#43A047",
      legendFontColor: "#333",
      legendFontSize: 13,
    }
  ];

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: () => "#000",
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
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
        <View style={s.headerTop}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <Text style={s.headerTitle}>Thống kê</Text>
          <View style={{ width: 38 }} />
        </View>

        <Text style={s.countTxt}>
          {data.totalOrders} đơn • {data.totalMoney.toLocaleString()} đ
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchStatistics}
          />
        }
      >

        {/* CHART */}
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Phân bố đơn hàng</Text>

          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        </View>

        {/* CARDS */}
        <View style={s.card}>
          <Text style={s.label}>
            ⏳ Chờ xác nhận ({data.pending.count} đơn)
          </Text>
          <Text style={s.value}>
            {data.pending.money.toLocaleString()} đ
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>
            🚚 Đang giao ({data.shipping.count} đơn)
          </Text>
          <Text style={s.value}>
            {data.shipping.money.toLocaleString()} đ
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>
            ✅ Đã giao ({data.completed.count} đơn)
          </Text>
          <Text style={s.value}>
            {data.completed.money.toLocaleString()} đ
          </Text>
        </View>

        {/* TOTAL */}
        <View style={s.totalCard}>
          <Text style={s.totalText}>Tổng chi tiêu</Text>
          <Text style={s.totalValue}>
            {data.totalMoney.toLocaleString()} đ
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
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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

  countTxt: {
    color: "#fff",
    textAlign: "center"
  },

  scroll: {
    padding: 16
  },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
  },

  chartTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: C.text1,
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
});

export default StatisticsScreen;