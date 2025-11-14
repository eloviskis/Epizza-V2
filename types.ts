export enum UserRole {
  Customer = 'customer',
  Owner = 'owner',
  Admin = 'admin',
}

export interface Pizzeria {
  id: string;
  name: string;
  logoUrl: string;
  heroUrl: string;
  specialty: string;
  rating: number;
  address: string;
  isOpen: boolean;
  openingHours: { [key: string]: string };
  menu: MenuItem[];
  deliveryFee: number;
  ownerId: string;
  isActive: boolean;
}

export type MenuItemCategory = 'Pizza' | 'Bebida' | 'Sobremesa';

export interface MenuItem {
  id: string;
  name:string;
  description: string;
  category: MenuItemCategory;
  price: number;
  imageUrl: string;
  customizable?: boolean;
  customizationOptions?: CustomizationOptions;
}

export interface CustomizationOptions {
  sizes: Option[];
  crusts: Option[];
  toppings: Option[];
}

export interface Option {
  name: string;
  priceModifier?: number; // For sizes
  additionalPrice?: number; // For crusts and toppings
}

export interface SelectedCustomizations {
  size: Option;
  crust?: Option;
  toppings?: Option[];
  isHalfAndHalf?: boolean;
  secondFlavor?: MenuItem;
}

export interface CartItem {
  id: string; // Unique ID for the cart item instance
  menuItem: MenuItem;
  quantity: number;
  customizations: SelectedCustomizations;
  notes: string;
  totalPrice: number;
}

export enum OrderStatus {
  Received = 'received',
  Preparing = 'preparing',
  Baking = 'baking',
  Delivery = 'delivery',
  Delivered = 'delivered',
  ReadyForPickup = 'readyForPickup',
  PickedUp = 'pickedUp',
}

export type OrderType = 'delivery' | 'pickup';

export interface Order {
  id: string;
  pizzeriaId: string;
  pizzeriaName: string;
  items: CartItem[];
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  orderType: OrderType;
  createdAt: number;
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  password; // In a real app, this would be a hash
  name: string;
  phone: string;
  addresses: string[];
  role: UserRole;
}

export interface Table {
  id: string;
  number: number;
  status: 'free' | 'occupied' | 'reserved';
  qrCodeUrl: string;
}
