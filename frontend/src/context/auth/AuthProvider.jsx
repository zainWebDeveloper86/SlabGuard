import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { Loader } from "../../components/Common";
import { axiosServerInstance } from "../../axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchUser = async () => {
      try {
        const response = await axiosServerInstance.get("/user/me");
        if (ignore) return;

        if (response.data.success) {
          setUser({ isLogin: true, ...response.data.user });
        } else {
          setUser(null);
        }
      } catch (error) {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      ignore = true;
    };
  }, []);

  
  const login = (userObj) => {
    setUser({ isLogin: true, ...userObj });
  };

  const logout = async () => {
    try {
      await axiosServerInstance.post("/user/logout");
    } catch (error) {
      console.log("Logout request failed:", error.message);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
