import { useState, useEffect } from "react";

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vk911_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const refetch = () => {
    try {
      const stored = localStorage.getItem("vk911_user");
      setUser(stored ? JSON.parse(stored) : null);
    } catch {}
  };

  return { user, data: user, loading, refetch };
};

export { useUser };
export default useUser;
