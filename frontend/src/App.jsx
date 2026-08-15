import { RouterProvider } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import router from "./router";

const App = () => {
  return (
    <>
      {/* react-hot-toast */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
          },
        }}
      />

      {/* activate routing in frontend */}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
