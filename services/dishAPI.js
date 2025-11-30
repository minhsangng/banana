import { API_URL } from "../constants/api";
import axios from "axios";

export const DishAPI = {
  getDishByCategoryId: async ({ categoryId }) => {
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
            const { data } = await axios.get(`${API_URL}/dishes/bestseller/0`);
            return data;
        } catch (error) {
            console.log("Tải món best seller thất bại: ", error);
        }
    }
};
