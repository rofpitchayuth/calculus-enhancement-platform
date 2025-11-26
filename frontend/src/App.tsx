import "./index.css";
import { Layout } from "./shared/components/layout/Layout";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <div>
      <Layout>
        <HomePage />
      </Layout>
    </div>
  );
}

export default App;