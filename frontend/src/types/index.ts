export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  address?: Address;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Rating {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  ratings: Rating[];
  avgRating: number;
  numReviews: number;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sort?: string;
  page?: number;
}
