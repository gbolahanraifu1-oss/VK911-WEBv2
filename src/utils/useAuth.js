import { useCallback } from "react";

function useAuth() {
  const signOut = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vk911_token");
      localStorage.removeItem("vk911_user");
      window.location.href = "/";
    }
  }, []);

  const signIn = useCallback(async ({ username, password }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    if (typeof window !== "undefined") {
      localStorage.setItem("vk911_token", data.token);
      localStorage.setItem("vk911_user", JSON.stringify(data.user));
    }
    return data;
  }, []);

  return { signIn, signOut };
}

export default useAuth;
