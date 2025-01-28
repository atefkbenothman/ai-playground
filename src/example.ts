
// Interface representing a product with basic properties
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// Calculates total price for a product
function calculateTotal(product: Product): number {
  console.log('Starting total calculation');
  const total = product.quantity * product.price;
  console.log(`Calculated total: ${total}`);
  return total;
}

// Validates product data
function validateProduct(product: Product): boolean {
  console.log('Validating product');
  if (!product || !product.name || product.price <= 0) {
    console.error('Invalid product data');
    return false;
  }
  return true;
}
      