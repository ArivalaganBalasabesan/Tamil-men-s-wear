export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phoneNumber?: string;
  address?: string;
  bodyProfile?: any;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  sizes: string[];
  colors: string[];
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface Order {
  _id: string;
  userId: string | User;
  items: Array<{
    productId: string | Product;
    quantity: number;
    price: number;
    size: string;
    color: string;
  }>;
  totalAmount: number;
  shippingAddress: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface ProductRequest {
  _id: string;
  userId: string | User;
  productName: string;
  description: string;
  status: 'Pending' | 'Responded';
  createdAt: string;
}
