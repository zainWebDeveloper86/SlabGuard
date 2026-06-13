import { AuthProvider } from "../context/auth/AuthProvider";
import { ThemeProvider } from "../context/theme/ThemeProvider";

export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};