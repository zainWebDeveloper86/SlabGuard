// import { useState, useEffect } from "react";
// import { AuthContext } from "./AuthContext";
// import { Loader } from "../../components/Common";
// import toast from "react-hot-toast";

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("userAuth");
//     try {
//       if (storedUser) {
//         const parsedUser = JSON.parse(storedUser);
//         if (parsedUser?.isLogin) {
//           setUser(parsedUser);
//         }
//       }
//     } catch (error) {
//       const message = "Corrupted user data!";
//       toast.error(message);
//       localStorage.removeItem("userAuth");
//     }

//     // Adding delay
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1200);

//     return () => clearTimeout(timer);
//   }, []);

//   const login = (userData) => {
//     const authData = { isLogin: true, ...userData };
//     localStorage.setItem("userAuth", JSON.stringify(authData));
//     setUser(authData);
//   };

//   const logout = () => {
//     localStorage.removeItem("userAuth");
//     setUser(null);
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// import { useState, useEffect } from "react";
// import { AuthContext } from "./AuthContext";
// import { Loader } from "../../components/Common";
// import toast from "react-hot-toast";

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuth = () => {
//       try {
//         const token = localStorage.getItem("token");
//         const storedUser = localStorage.getItem("user");

//         if (token && storedUser) {
//           const parsedUser = JSON.parse(storedUser);
//           setUser({
//             isLogin: true,
//             ...parsedUser,
//             token: token,
//           });
//         } else {
//           setUser(null);
//         }
//       } catch (error) {
//         console.log(error);
//         toast.error("Corrupted user data!");
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Optional: verify token with backend? For now just load.
//     const timer = setTimeout(checkAuth, 800); // small delay for smoother transition
//     return () => clearTimeout(timer);
//   }, []);

//   const login = (userData) => {
//     // userData should contain token and user object from backend
//     const authData = { isLogin: true, ...userData.user, token: userData.token };
//     localStorage.setItem("token", userData.token);
//     localStorage.setItem("user", JSON.stringify(userData.user));
//     setUser(authData);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser(null);
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { Loader } from "../../components/Common";
import toast from "react-hot-toast";
import { authBaseUrl } from "../../axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user from backend using token
  const fetchUser = async (token) => {
    try {
      const response = await authBaseUrl.get("/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUser({
          isLogin: true,
          ...response.data.user,
          token: token,
        });
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Fetch user failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      toast.error("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
      setUser(null);
    }
  }, []);

  const login = async (userData) => {
    // userData contains token and user from backend response
    const { token, user: userObj } = userData;
    console.log(userData.user)
    localStorage.setItem("token", token); // store only token
    // Do NOT store user object in localStorage
    setUser({
      isLogin: true,
      ...userObj,
      token: token,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
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