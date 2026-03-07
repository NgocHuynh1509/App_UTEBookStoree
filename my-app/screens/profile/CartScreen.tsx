import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useAuth } from "../../hooks/useAuth";

const BASE_URL = Constants.expoConfig.extra.BASE_URL;

export default function AddressScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Chức năng Lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/addresses/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data);
    } catch (error) {
      console.log("❌ Lỗi lấy địa chỉ:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động load lại khi quay lại màn hình này
  useFocusEffect(useCallback(() => { fetchAddresses(); }, [user?.id]));

  // 2. Chức năng Xóa địa chỉ
  const handleDelete = async (id: number, isDefault: number) => {
    if (isDefault === 1) {
      return Alert.alert("Thông báo", "Không thể xóa địa chỉ mặc định!");
    }

    Alert.alert("Xác nhận", "Bạn muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${BASE_URL}/api/addresses/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(prev => prev.filter(item => item.id !== id));
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa địa chỉ");
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header giống CartScreen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Địa chỉ nhận hàng</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddressUpdate', { id: null })}>
          <Ionicons name="add-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAddresses} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{ height: 20 }} />

        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color="#DDD" />
            <Text style={{ color: "#AAA", marginTop: 10 }}>Chưa có địa chỉ nào</Text>
          </View>
        ) : (
          addresses.map((item) => (
            <View key={item.id} style={styles.addressCard}>
              <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{item.recipient_name}</Text>
                  {item.is_default === 1 && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Mặc định</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.phoneText}>{item.phone_number}</Text>
                <Text style={styles.detailText}>
                  {item.specific_address}{"\n"}
                  {item.ward}, {item.district}, {item.province}
                </Text>
              </View>

              <View style={styles.actionContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddressUpdate', { id: item.id })}
                  style={styles.editBtn}
                >
                  <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>

                {item.is_default !== 1 && (
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.is_default)}>
                    <Ionicons name="trash-outline" size={22} color="#FF5252" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Nút thêm mới dưới cùng (Sticky Button) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtnLarge}
          onPress={() => navigation.navigate('AddressUpdate', { id: null })}
        >
          <Text style={styles.addBtnText}>THÊM ĐỊA CHỈ MỚI</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: "#6C63FF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  addressCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  nameText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginRight: 10 },
  defaultBadge: {
    borderWidth: 1,
    borderColor: '#6C63FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  defaultText: { color: '#6C63FF', fontSize: 10, fontWeight: 'bold' },
  phoneText: { color: '#666', marginBottom: 5 },
  detailText: { color: '#888', fontSize: 13, lineHeight: 18 },
  actionContainer: { alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 10 },
  editBtn: { marginBottom: 10 },
  editText: { color: '#6C63FF', fontWeight: 'bold' },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  addBtnLarge: {
    backgroundColor: "#6C63FF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});