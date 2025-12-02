import * as SecureStore from "expo-secure-store";

export const UserAPI = {
  getUserInfo: async () => {
    try {
      const userStr = await SecureStore.getItemAsync("userInfo");
      if (userStr) return JSON.parse(userStr).userId;
      return 0;
    } catch (error) {
      console.error("Lấy thông tin người dùng thất bại: ", error);
    }
  },
};
