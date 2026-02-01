import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  // 🎀 Pink theme palette
  const COLORS = {
    bg: "#FFF5F8",
    primary: "#FF7EB6",
    primaryDark: "#D63384",
    soft: "#FFE4EC",
    card: "#FFFFFF",
    text: "#222",
    sub: "#666",
    muted: "#999",
    border: "#F3D7E3",
    price: "#FF5C8A",
  };

  const formatPrice = (price: any) => {
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
  };

  const loadBooks = async () => {
    setLoadingBooks(true);

    try {
      let params: any = {};

      if (categoryFilter) {
        params.category = categoryFilter;
      } else if (search.trim() !== "") {
        params.search = search;
      }

      const res = await api.get("/books", { params });
      setBooks(res.data);
    } catch (err) {
      console.log("Lỗi load sách:", err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const loadSuggestions = async (text: string) => {
    if (text.trim() === "") {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }

    try {
      const res = await api.get("/books", {
        params: { search: text },
      });

      setSuggestions(res.data.slice(0, 5));
      setShowSuggest(true);
    } catch (err) {
      console.log("Lỗi gợi ý:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log("Lỗi load danh mục:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter]);

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 25,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 22,
            borderBottomRightRadius: 22,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "bold" }}>
            UTE Book Store
          </Text>

          <Text style={{ color: "#FFEAF2", marginBottom: 12 }}>
            Tri thức mới – Tương lai mới
          </Text>

          {/* SEARCH */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#fff",
              borderRadius: 14,
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            <Ionicons name="search" size={20} color={COLORS.primaryDark} />

            <TextInput
              placeholder="Tìm kiếm sách..."
              style={{ marginLeft: 10, flex: 1, color: COLORS.text }}
              placeholderTextColor="#B88A9B"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                loadSuggestions(text);
              }}
              onSubmitEditing={() => {
                navigation.navigate("SearchResult", { keyword: search });
                setShowSuggest(false);
              }}
            />
          </View>
        </View>

        {/* SUGGESTIONS */}
        {showSuggest && suggestions.length > 0 && (
          <View
            style={{
              backgroundColor: "#fff",
              marginHorizontal: 16,
              marginTop: 8,
              borderRadius: 12,
              paddingVertical: 6,
              elevation: 5,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  navigation.navigate("SearchResult", { query: item.title });
                  setShowSuggest(false);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderBottomWidth: 0.5,
                  borderColor: "#F2E3EA",
                }}
              >
                <Text style={{ fontSize: 14, color: "#444" }}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* BANNER */}
        <View
          style={{
            margin: 20,
            padding: 20,
            backgroundColor: COLORS.primaryDark,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            FLASH SALE
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "bold",
              marginVertical: 5,
            }}
          >
            Giảm đến 50%
          </Text>

          <Text style={{ color: "#FFEAF2", marginBottom: 10 }}>
            Áp dụng cho sinh viên UTE
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              paddingVertical: 9,
              paddingHorizontal: 18,
              alignSelf: "flex-start",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: COLORS.primaryDark, fontWeight: "bold" }}>
              Xem ngay
            </Text>
          </TouchableOpacity>
        </View>

        {/* DANH MỤC */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 20,
            marginBottom: 10,
            color: COLORS.text,
          }}
        >
          Danh mục
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 20, marginBottom: 10 }}
        >
          {loadingCategories ? (
            <Text style={{ color: COLORS.sub }}>Đang tải...</Text>
          ) : (
            categories.map((cat: any) => {
              const active = categoryFilter === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    if (categoryFilter === cat.id) setCategoryFilter(null);
                    else setCategoryFilter(cat.id);
                  }}
                  style={{
                    backgroundColor: active ? COLORS.primary : "#fff",
                    width: 84,
                    height: 84,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 15,
                    borderRadius: 18,
                    elevation: 3,
                    borderWidth: active ? 0 : 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Ionicons
                    name="book-outline"
                    size={26}
                    color={active ? "#fff" : COLORS.primary}
                  />

                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: active ? "#fff" : "#444",
                    }}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* SÁCH NỔI BẬT */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.text }}>
            Sách nổi bật
          </Text>

          <TouchableOpacity>
            <Text style={{ color: COLORS.primaryDark, fontWeight: "600" }}>
              Xem tất cả
            </Text>
          </TouchableOpacity>
        </View>

        {/* LIST SÁCH */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 20, marginTop: 12, paddingBottom: 18 }}
        >
          {loadingBooks ? (
            <Text style={{ color: COLORS.sub }}>Đang tải...</Text>
          ) : (
            books.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  width: 165,
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 12,
                  marginRight: 15,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
                onPress={() => navigation.navigate("BookDetail", { id: item.id })}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: item.cover_image }}
                  style={{
                    width: "100%",
                    height: 155,
                    borderRadius: 14,
                    marginBottom: 10,
                    backgroundColor: COLORS.soft,
                  }}
                />

                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                <Text style={{ color: "#8A6475", fontSize: 12 }} numberOfLines={1}>
                  Tác giả: {item.author_name || item.author?.name || "Không rõ"}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: COLORS.price,
                    fontWeight: "bold",
                    marginTop: 8,
                  }}
                >
                  {formatPrice(item.price)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
