import api from "../../../services/api";

export async function register({ username, email, password }) {
  const response = await api.post("/user/register", {
    username,
    email,
    password,
  });

  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/user/login", { email, password });

  return response.data;
}

export async function verifyEmail({ email, otp }) {
  const response = await api.post("/user/verify-email", { email, otp });

  return response.data;
}

export async function resendVerification({ email }) {
  const response = await api.post("/user/resend-verification", { email });

  return response.data;
}

export async function logout() {
  const response = await api.get("/user/logout");

  return response.data;
}

export async function getme() {
  const response = await api.get("/user/getme");

  return response.data;
}
