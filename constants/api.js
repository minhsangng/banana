import axios from "axios";

export const API  = axios.create({
  baseURL: "http://cfo-app.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Connection": "keep-alive"
  }
});