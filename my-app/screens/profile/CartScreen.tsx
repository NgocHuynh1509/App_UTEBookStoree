import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Phải có cái này

const BASE_URL = Constants.expoConfig.extra.BASE_URL;

export default function CartScreen() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCart = async () => {
    if (!user?.id) return;
    try {
        const token = await AsyncStorage.getItem('token');

        // Kiểm tra token trước khi gọi API
        if (!token) {
          console.log("❌ Token bị null - Người dùng chưa đăng nhập hoặc lưu sai key");
          return;
        }

        //console.log("✅ Token lấy được:", token); // In ra để kiểm tra

        const response = await axios.get(`${BASE_URL}/api/cart/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setCartItems(response.data);
    }catch (error: any) {
      console.log("❌ Lỗi API status:", error?.response?.status);
      console.log("❌ Full error:", error);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const updateQuantity = async (cartItemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return; // Không cho giảm xuống 0

    try {
      const token = await AsyncStorage.getItem('token');
      // Cập nhật lên Database
      await axios.put(`${BASE_URL}/api/cart/update-quantity`,
        { cartItemId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật UI cục bộ để tăng tốc độ phản hồi cho người dùng
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item
        )
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi cập nhật số lượng";
      Alert.alert("Lỗi", msg);
      fetchCart(); // Tải lại dữ liệu chuẩn từ DB nếu lỗi
    }
  };

  useFocusEffect(useCallback(() => { fetchCart(); }, [user?.id]));
  const removeItem = async (cartItemId: number) => {
    Alert.alert("Xác nhận", "Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${BASE_URL}/api/cart/remove/${cartItemId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // Cập nhật UI ngay lập tức
            setCartItems(prev => prev.filter(item => item.id !== cartItemId));
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa sản phẩm");
          }
        }
      }
    ]);
  };

  // 2. Hàm vẽ nút xóa khi vuốt (bên phải sang)
  const renderRightActions = (id: number) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => removeItem(id)}
    >
      <Ionicons name="trash-outline" size={28} color="#fff" />
      <Text style={styles.deleteActionText}>Xóa</Text>
    </TouchableOpacity>
  );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Giỏ hàng</Text>
          <TouchableOpacity onPress={() => { setRefreshing(true); fetchCart(); }}>
            <Ionicons name="refresh-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCart} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={{ height: 20 }} />
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={80} color="#DDD" />
              <Text style={{ color: "#AAA", marginTop: 10 }}>Giỏ hàng chưa có sản phẩm</Text>
            </View>
          ) : (
            cartItems.map((item) => (
              <Swipeable
                key={item.id} // Key nằm ở thẻ ngoài cùng của vòng lặp
                renderRightActions={() => renderRightActions(item.id)}
                friction={2}
              >
                <View style={[styles.cartCard, item.stock <= 0 && styles.disabledCard]}>
                  <Image
                    source={{ uri: item.cover_image?.startsWith('http') ? item.cover_image : `${BASE_URL}/uploads/${item.cover_image}` }}
                    style={styles.bookImage}
                  />
                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.price}>{Number(item.price).toLocaleString()}đ</Text>

                    {/* LOGIC CẢNH BÁO */}
                    {item.stock <= 0 ? (
                      <Text style={styles.outText}>Hết hàng</Text>
                    ) : item.stock < 10 ? (
                      <Text style={styles.lowText}>Chỉ còn {item.stock} sản phẩm</Text>
                    ) : null}

                    <View style={styles.quantityRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity, -1)}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity, 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Text style={[styles.qtyBtnText, item.quantity >= item.stock && { color: '#CCC' }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Swipeable> // Đã thêm thẻ đóng Swipeable
            )) // Đã thêm dấu đóng ngoặc nhọn và ngoặc đơn cho .map
          )}
        </ScrollView>

        {/* FOOTER - Tính tổng tiền */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalPrice}>
              {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}đ
            </Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn}>
            <Text style={styles.checkoutText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

// Giữ nguyên Styles cũ của bạn...
// ... styles giữ nguyên như của bạn ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
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
    headerText: { fontSize: 22, fontWeight: "bold", color: "#fff" },
    cartCard: {
      backgroundColor: "#fff",
      marginHorizontal: 20,
      marginBottom: 15,
      padding: 12,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    disabledCard: { opacity: 0.6, backgroundColor: "#F0F0F0" },
    bookImage: { width: 70, height: 90, borderRadius: 8 },
    infoContainer: { flex: 1, marginLeft: 15 },
    title: { fontSize: 16, fontWeight: "bold", color: "#333" },
    price: { color: "#6C63FF", fontWeight: "600", marginVertical: 4 },
    outText: { color: "#F44336", fontSize: 12, fontWeight: "bold" },
    lowText: { color: "#FF9800", fontSize: 12, fontWeight: "500" },
    quantityRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
    qtyBtn: { borderWidth: 1, borderColor: "#EEE", padding: 4, borderRadius: 4, width: 28, alignItems: "center" },
    qtyText: { marginHorizontal: 12, fontWeight: "bold" },
    deleteBtn: { padding: 5 },
    emptyCart: { alignItems: "center", marginTop: 100 },
    footer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      backgroundColor: "#fff",
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      elevation: 10,
    },
    totalLabel: { color: "#777", fontSize: 14 },
    totalPrice: { fontSize: 20, fontWeight: "bold", color: "#E53935" },
    checkoutBtn: { backgroundColor: "#6C63FF", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
    checkoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    quantityRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "#F9F9F9",
        alignSelf: 'flex-start',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#EEE"
      },
      qtyBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        alignItems: "center",
        justifyContent: "center"
      },
      qtyBtnText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#6C63FF"
      },
      qtyText: {
        marginHorizontal: 15,
        fontWeight: "bold",
        fontSize: 16,
        color: "#333"
      },
  deleteAction: {
      backgroundColor: '#FF5252',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '83%', // Khớp với chiều cao của cartCard (có margin)
      borderRadius: 14,
      marginBottom: 15, // Khớp với margin của cartCard
      marginRight: 20,
    },
    deleteActionText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 12,
      marginTop: 4,
    },
  });