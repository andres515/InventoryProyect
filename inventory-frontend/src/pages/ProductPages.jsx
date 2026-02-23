import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data.content);
  };

  return (
    <div>
      <h2>Productos</h2>
      {products.map((p) => (
        <div key={p.id}>
          <p>{p.name}</p>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}

export default ProductsPage;