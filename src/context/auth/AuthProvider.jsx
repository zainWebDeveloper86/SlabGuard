import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { Loader } from "../../components/Common";
import toast from "react-hot-toast";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userAuth");
    try {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.isLogin) {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      const message = "Corrupted user data!";
      toast.error(message);
      localStorage.removeItem("userAuth");
    }

    // Adding delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const login = (userData) => {
    const authData = { isLogin: true, ...userData };
    localStorage.setItem("userAuth", JSON.stringify(authData));
    setUser(authData);
  };

  const logout = () => {
    localStorage.removeItem("userAuth");
    setUser(null);
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
