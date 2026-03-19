import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;