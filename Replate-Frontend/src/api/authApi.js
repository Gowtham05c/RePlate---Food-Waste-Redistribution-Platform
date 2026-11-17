import api from "./axiosInstance";

// Expected response: { token, role, name }
export const loginUser = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);
