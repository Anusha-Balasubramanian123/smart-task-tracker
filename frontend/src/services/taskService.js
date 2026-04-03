// src/services/taskService.js
import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function createAxiosInstance(token) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export const taskService = {
  async getAllTasks(token) {
    const api = createAxiosInstance(token);
    const response = await api.get("/tasks");
    return response.data;
  },

  async createTask(token, taskData) {
    const api = createAxiosInstance(token);
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  async updateTask(token, id, taskData) {
    const api = createAxiosInstance(token);
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  async deleteTask(token, id) {
    const api = createAxiosInstance(token);
    await api.delete(`/tasks/${id}`);
  },
};
