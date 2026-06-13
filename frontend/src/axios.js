import axios from "axios";

export const authBaseUrl = axios.create({
  baseURL: "http://localhost:8080/api/auth",
});

// on every request

const authInterceptor = (config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log("Auth parse error", error);
  }
  return config;
};

// contactBaseUrl.interceptors.request.use(authInterceptor);
// contactBaseUrl.interceptors.response.use((response) => response, (error)=>{
//   if(error.response && error.response.status === 401){
//     localStorage.removeItem('userAuth');
//     window.location.href = '/login'
//   }
// });

authBaseUrl.interceptors.request.use(authInterceptor);