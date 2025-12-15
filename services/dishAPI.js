import axios from "axios";
import { API_URL } from "../constants/api";

export const DishAPI = {
  getDishByCategoryId: async (categoryId) => {
    try {
      if (categoryId !== 0) {
        const { data } = await axios.get(`${API_URL}/dishes/${categoryId}`);
        return data;
      } else return [];
    } catch (error) {
      console.error("Tải món ăn theo danh mục thất bại: ", error);
    }
  },
  getAllBestSeller: async () => {
    try {
      const { data } = await axios.get(`${API_URL}/bestseller/0`);
      return data;
    } catch (error) {
      console.error("Tải món best seller thất bại: ", error);
    }
  },
  getDetailDish: async (dishId, userId) => {
    try {
      const { data } = await axios.get(`${API_URL}/dish/${dishId}/${userId}`);
      return data[0];
    } catch (error) {
      console.error("Tải chi tiết món thất bại: ", error);
    }
  },
};
