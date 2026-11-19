import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { register, login, logout, verifyEmail, resendVerification } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      return await register({ username, email, password });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async ({ email, otp }) => {
    setLoading(true);
    try {
      const data = await verifyEmail({ email, otp });
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async ({ email }) => {
    setLoading(true);
    try {
      return await resendVerification({ email });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    handleRegister,
    handleVerifyEmail,
    handleResendVerification,
    handleLogin,
    handleLogout,
  };
};