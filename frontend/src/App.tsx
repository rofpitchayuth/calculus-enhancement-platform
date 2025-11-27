import "./index.css";
import { Layout } from "./shared/components/layout/Layout";
import { HomePage } from "./features/home/pages/HomePage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { AuthProvider } from "./features/auth/hooks/useAuth";

function App() {
  const currentPath = window.location.pathname;

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/login':
        return <LoginPage />;
      case '/':
      default:
        return (
          <Layout>
            <HomePage />
          </Layout>
        );
    }
  };

  return (
    <AuthProvider>
      {renderCurrentPage()}
    </AuthProvider>
  );
}

export default App;