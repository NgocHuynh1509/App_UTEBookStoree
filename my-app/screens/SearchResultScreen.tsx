import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function SearchResultScreen({ route, navigation }: any) {
  const { query } = route.params;

  const [searchText, setSearchText] = useState(query);
  const [books, setBooks] = useState<any[]>([]);

  const [sort, setSort] = useState("relevant");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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

  const sortOptions = [
    { key: "relevant", label: "Phù hợp nhất" },
    { key: "low-high", label: "Giá thấp đến cao" },
    { key: "high-low", label: "Giá cao đến thấp" },
    { key: "newest", label: "Mới nhất" },
    { key: "bestseller", label: "Bán chạy nhất" },
  ];

  const load = async () => {
    try {
      const res = await api.get("/books", {
        params: { search: searchText },
      });

      let data = res.data;

      if (sort === "low-high") data.sort((a, b) => a.price - b.price);
      if (sort === "high-low") data.sort((a, b) => b.price - a.price);
      if (sort === "newest") data.sort((a, b) => b.id - a.id);

      setBooks(data);
    } catch (err) {
      console.log("Lỗi tải danh sách:", err);
    }
  };

  useEffect(() => {
    load();
  }, [searchText, sort]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SEARCH BAR */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: COLORS.card,
            padding: 14,
            margin: 16,
            borderRadius: 14,
            alignItems: "center",
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Ionicons name="search" size={20} color={COLORS.primaryDark} />

          <TextInput
            style={{ flex: 1, marginLeft: 10, color: COLORS.text }}
            placeholder="Tìm tên sách, tác giả..."
            placeholderTextColor="#B88A9B"
            value={searchText}
            onChangeText={setSearchText}
          />

          <TouchableOpacity onPress={load}>
            <Ionicons
              name="arrow-forward-circle"
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* TAG FILTER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginLeft: 16, marginBottom: 8 }}
        >
          {["Bán chạy", "Đánh giá cao", "Mới nhất", "Sale"].map((t, i) => {
            const active = i === 0;

            return (
              <TouchableOpacity
                key={i}
                style={{
                  backgroundColor: active ? COLORS.primary : COLORS.soft,
                  paddingVertical: 7,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: active ? "#fff" : COLORS.primaryDark,
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SORT DROPDOWN */}
        <View
          style={{
            marginTop: 10,
            marginRight: 16,
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity
            onPress={() => setShowSortDropdown(!showSortDropdown)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.card,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 14, marginRight: 6, color: COLORS.text }}>
              {sortOptions.find((x) => x.key === sort)?.label}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.sub} />
          </TouchableOpacity>

          {showSortDropdown && (
            <View
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 12,
                marginTop: 6,
                paddingVertical: 6,
                width: 170,
                elevation: 6,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              {sortOptions.map((op) => (
                <TouchableOpacity
                  key={op.key}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                  onPress={() => {
                    setSort(op.key);
                    setShowSortDropdown(false);
                  }}
                >
                  <Text style={{ fontSize: 14, color: COLORS.text }}>
                    {op.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* RESULT COUNT */}
        <Text
          style={{
            marginLeft: 16,
            marginTop: 12,
            color: COLORS.sub,
          }}
        >
          Tìm thấy {books.length} kết quả
        </Text>

        {/* GRID LIST */}
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 16,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                width: "48%",
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 10,
                marginTop: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
              onPress={() =>
                navigation.navigate("BookDetail", { id: item.id })
              }
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.cover_image }}
                style={{
                  width: "100%",
                  height: 160,
                  borderRadius: 12,
                  backgroundColor: COLORS.soft,
                }}
              />

              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 14,
                  marginTop: 8,
                  color: COLORS.text,
                }}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: "#8A6475",
                }}
                numberOfLines={1}
              >
                {item.author_name}
              </Text>

              <Text
                style={{
                  color: COLORS.price,
                  fontWeight: "bold",
                  marginTop: 6,
                }}
              >
                {item.price}đ
              </Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </View>
  );
}
