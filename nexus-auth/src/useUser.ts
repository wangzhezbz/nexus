"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchMe, type User } from "./client";

/** 读取当前登录用户。未登录返回 user=null。各产品用它判断登录态/角色。 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchMe()
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { user, loading, refresh, isAdmin: user?.role === "admin" };
}
