import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import api from "../services/api";

const screenWidth = Dimensions.get("window").width;

export default function BookDetail() {
  const route = useRoute<any>();
  const { id } = route.params;

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, []);

  const loadBook = async () => {
    try {
      const res = await api.get(`/books/${id}`);
      setBook(res.data);
    } catch (error) {
      console.log("❌ Lỗi tải sách:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );

  if (!book)
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy sách</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh sách */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: book.cover_image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.card}>
        {/* Tiêu đề */}
        <Text style={styles.title}>{book.title}</Text>

        {/* Tác giả */}
        <Text style={styles.author}>Tác giả: {book.author_name}</Text>

        {/* Danh mục + NXB */}
        <Text style={styles.sub}>Danh mục: {book.category_name}</Text>
        <Text style={styles.sub}>NXB: {book.publisher_name}</Text>

        {/* Giá */}
        <Text style={styles.price}>
          {book.price.toLocaleString()} đ
        </Text>

        {/* Mô tả */}
        <Text style={styles.section}>Giới thiệu sách</Text>
        <Text style={styles.description}>{book.description}</Text>

        {/* Button */}
        <TouchableOpacity style={styles.btnAdd}>
          <Text style={styles.btnText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F8", // hồng rất nhạt
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  imageContainer: {
    width: "100%",
    height: 380,
    backgroundColor: "#FFE4EC", // hồng pastel
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  image: {
    width: screenWidth * 0.65,
    height: 350,
    borderRadius: 14,
  },

  card: {
    marginTop: -20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#B83280", // hồng đậm sang
    marginBottom: 6,
  },

  author: {
    fontSize: 16,
    color: "#7A3E6D", // tím hồng nhẹ
    marginBottom: 4,
  },

  sub: {
    fontSize: 15,
    color: "#9E5F84",
  },

  price: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF5C8A", // hồng nổi
  },

  section: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#B83280",
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "justify",
    color: "#6B4A5A",
  },

  btnAdd: {
    marginTop: 28,
    backgroundColor: "#FF7EB6", // hồng kẹo
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

