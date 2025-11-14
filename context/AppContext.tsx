import React, { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { CartItem, Order, OrderStatus, Pizzeria, OrderType, User, UserRole, Table, MenuItem } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse {
    success: boolean;
    message?: string;
    isNetworkError?: boolean;
}

interface AppContextType {
  // Navigation
  view: string;
  params: Record<string, string>;
  navigate: (view: string, params?: Record<string, string>) => void;
  
  // App State
  isLoading: boolean;
  initError: string | null;
  retryInit: () => void;
  transientError: string | null;
  setTransientError: (message: string | null) => void;
  isOnline: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>, pizzeriaId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  getCartTotal: () => number;
  clearCart: (pizzeriaId: string) => void;
  cartPizzeriaId: string | null;

  // Order
  currentOrder: Order | null;
  orders: Order[]; // For kitchen view
  placeOrder: (customer: Order['customer'], orderType: OrderType, pizzeriaId: string) => Promise<ApiResponse>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<ApiResponse>;
  
  // Pizzeria Data
  pizzerias: Pizzeria[];
  getPizzeria: (pizzeriaId: string) => Pizzeria | undefined;
  
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<ApiResponse>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'addresses' | 'role'>) => Promise<ApiResponse>;

  // Owner Features
  getOwnerPizzeria: () => Pizzeria | undefined;
  updateMenuItem: (pizzeriaId: string, menuItem: MenuItem) => Promise<ApiResponse>;
  addMenuItem: (pizzeriaId: string, menuItem: Omit<MenuItem, 'id'>) => Promise<ApiResponse>;
  deleteMenuItem: (pizzeriaId: string, menuItemId: string) => Promise<ApiResponse>;
  tables: Table[];
  updateTableStatus: (tableId: string, status: Table['status']) => Promise<ApiResponse>;

  // Admin Features
  togglePizzeriaActive: (pizzeriaId: string) => Promise<ApiResponse>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState('landing');
  const [params, setParams] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartPizzeriaId, setCartPizzeriaId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Platform-wide state
  const [pizzerias, setPizzerias] = useState<Pizzeria[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // App state
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [transientError, setTransientError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const reconnectIntervalRef = useRef<number | null>(null);

  const apiFetch = async (url: string, options?: RequestInit) => {
    try {
        const response = await fetch(url, options);
        if (!isOnline) {
            setIsOnline(true);
        }
        return response;
    } catch (e) {
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
            setIsOnline(false);
        }
        throw e;
    }
  };

  const checkConnection = useCallback(async () => {
    try {
        // Use native fetch to avoid the side-effects of apiFetch
        await fetch(`${API_BASE_URL}/health`);
        setIsOnline(true);
    } catch (e) {
        // Health check failed, do nothing, the interval will try again.
    }
  }, []);

  useEffect(() => {
    if (!isOnline) {
        if (reconnectIntervalRef.current === null) {
            reconnectIntervalRef.current = window.setInterval(checkConnection, 5000); // Check every 5 seconds
        }
    } else {
        if (reconnectIntervalRef.current !== null) {
            clearInterval(reconnectIntervalRef.current);
            reconnectIntervalRef.current = null;
        }
    }

    return () => {
        if (reconnectIntervalRef.current !== null) {
            clearInterval(reconnectIntervalRef.current);
        }
    };
  }, [isOnline, checkConnection]);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setInitError(null);
    try {
        const [pizzeriasRes, tablesRes, ordersRes] = await Promise.all([
            apiFetch(`${API_BASE_URL}/pizzerias`),
            apiFetch(`${API_BASE_URL}/tables`),
            apiFetch(`${API_BASE_URL}/orders`),
        ]);

        if (!pizzeriasRes.ok || !tablesRes.ok || !ordersRes.ok) {
            throw new Error('Network response was not ok');
        }

        const pizzeriasData = await pizzeriasRes.json();
        const tablesData = await tablesRes.json();
        const ordersData = await ordersRes.json();
        
        setPizzerias(pizzeriasData);
        setTables(tablesData);
        setOrders(ordersData);

    } catch (e) {
        console.error("Fetch error:", e);
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
          setIsOnline(false);
        }
        setInitError("Não foi possível conectar ao servidor. Verifique se o backend (server.js) está rodando e tente novamente.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If we are in an initial error state and the connection comes back online, retry fetching data.
    if (isOnline && initError) {
      fetchData();
    }
  }, [isOnline, initError, fetchData]);

  // Initial data fetch from backend
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retryInit = fetchData;

  // Hydrate state from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedPizzeriaId = localStorage.getItem('cartPizzeriaId');
    if (savedCart && savedPizzeriaId) {
      setCart(JSON.parse(savedCart));
      setCartPizzeriaId(savedPizzeriaId);
    }
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Persist cart and user to localStorage
  useEffect(() => {
    if (cart.length > 0 && cartPizzeriaId) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('cartPizzeriaId', cartPizzeriaId);
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('cartPizzeriaId');
    }
  }, [cart, cartPizzeriaId]);

  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
  }, [currentUser]);
  
  const navigate = (newView: string, newParams: Record<string, string> = {}) => {
    setView(newView);
    setParams(newParams);
    window.scrollTo(0, 0);
  };

  const calculateTotalPrice = (item: Omit<CartItem, 'id' | 'totalPrice'>): number => {
      let total = item.menuItem.price;
      if(item.menuItem.customizable){
          total *= item.customizations.size.priceModifier || 1;
          total += item.customizations.crust?.additionalPrice || 0;
          item.customizations.toppings?.forEach(t => total += t.additionalPrice || 0);
          if(item.customizations.isHalfAndHalf && item.customizations.secondFlavor){
              const secondFlavorPrice = item.customizations.secondFlavor.price * (item.customizations.size.priceModifier || 1);
              total = Math.max(total, secondFlavorPrice);
          }
      }
      return total * item.quantity;
  };

  const addToCart = (item: Omit<CartItem, 'id' | 'totalPrice'>, pizzeriaId: string) => {
    if (cartPizzeriaId && cartPizzeriaId !== pizzeriaId) {
        if(!window.confirm("Você possui itens de outra pizzaria no seu carrinho. Deseja limpá-lo e adicionar este item?")){
            return;
        }
        setCart([]);
    }
    setCartPizzeriaId(pizzeriaId);
    setCart(prevCart => {
      const newItem = { ...item, id: Date.now().toString(), totalPrice: calculateTotalPrice(item) };
      return [...prevCart, newItem];
    });
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    setCart(cart => cart.map(item => {
        if (item.id === cartItemId) {
            if (quantity <= 0) return null;
            const updatedItem = {...item, quantity};
            return {...updatedItem, totalPrice: calculateTotalPrice(updatedItem)};
        }
        return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (cartItemId: string) => setCart(cart => cart.filter(item => item.id !== cartItemId));
  
  const clearCart = (pizzeriaId: string) => {
      if(cartPizzeriaId === pizzeriaId) {
          setCart([]);
          setCartPizzeriaId(null);
      }
  }

  const getCartTotal = () => cart.reduce((total, item) => total + item.totalPrice, 0);
  const getPizzeria = (pizzeriaId: string) => pizzerias.find(p => p.id === pizzeriaId);

  const placeOrder = async (customer: Order['customer'], orderType: OrderType, pizzeriaId: string): Promise<ApiResponse> => {
    const pizzeria = getPizzeria(pizzeriaId);
    if (!pizzeria) return { success: false, message: "Pizzaria não encontrada." };

    const subtotal = getCartTotal();
    const deliveryFee = orderType === 'delivery' ? pizzeria.deliveryFee : 0;
    const total = subtotal + deliveryFee;

    const orderData = {
      pizzeriaId,
      pizzeriaName: pizzeria.name,
      items: cart,
      customer,
      subtotal,
      deliveryFee,
      total,
      orderType,
      userId: currentUser?.id
    };

    try {
        const response = await apiFetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const newOrder = await response.json();
            setCurrentOrder(newOrder);
            setOrders(prev => [...prev, newOrder]);
            clearCart(pizzeriaId);
            navigate('orderStatus', { orderId: newOrder.id });
            return { success: true };
        } else {
            return { success: false, message: "Falha ao realizar o pedido.", isNetworkError: false };
        }
    } catch(e) {
        console.error("Failed to place order:", e);
        return { success: false, message: "Falha na comunicação com o servidor. Tente novamente.", isNetworkError: true };
    }
  };
  
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<ApiResponse> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if(response.ok) {
            const updatedOrder = await response.json();
            if (currentOrder && currentOrder.id === orderId) {
              setCurrentOrder(updatedOrder);
            }
            setOrders(orders => orders.map(o => o.id === orderId ? updatedOrder : o));
            return { success: true };
        }
        return { success: false, message: "Não foi possível atualizar o status do pedido.", isNetworkError: false };
    } catch (e) {
        console.error("Failed to update order status:", e);
        return { success: false, message: "Falha na comunicação ao atualizar o status do pedido.", isNetworkError: true };
    }
  };

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (response.ok) {
            const user = await response.json();
            setCurrentUser(user);
            setView('landing');
            return { success: true };
        }
        const message = await response.text();
        return { success: false, message: message || "E-mail ou senha inválidos.", isNetworkError: false };
    } catch (e) {
        console.error("Login request failed:", e);
        return { success: false, message: "Falha de conexão. O servidor parece estar offline.", isNetworkError: true };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setView('landing');
  };
  
  const register = async (userData: Omit<User, 'id' | 'addresses' | 'role'>): Promise<ApiResponse> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (response.ok) {
            const newUser = await response.json();
            setCurrentUser(newUser);
            return { success: true };
        }
        const message = await response.text();
        return { success: false, message: message || "Não foi possível realizar o cadastro.", isNetworkError: false };
    } catch (e) {
        console.error("Registration request failed:", e);
        return { success: false, message: "Falha de conexão. O servidor parece estar offline.", isNetworkError: true };
    }
  };

  // --- Owner Functions ---
  const getOwnerPizzeria = () => pizzerias.find(p => p.ownerId === currentUser?.id);

  const updateMenuItem = async (pizzeriaId: string, updatedItem: MenuItem): Promise<ApiResponse> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/pizzerias/${pizzeriaId}/menu/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
    });
    if(response.ok) {
        const savedItem = await response.json();
        setPizzerias(pizzerias => pizzerias.map(p => {
            if (p.id === pizzeriaId) {
                return { ...p, menu: p.menu.map(item => item.id === savedItem.id ? savedItem : item) };
            }
            return p;
        }));
        return { success: true };
    } else {
        return { success: false, message: "Não foi possível atualizar o item.", isNetworkError: false };
    }
    } catch(e) {
        console.error("Failed to update menu item:", e);
        return { success: false, message: "Falha na comunicação ao atualizar o item.", isNetworkError: true };
    }
  };

  const addMenuItem = async (pizzeriaId: string, newItem: Omit<MenuItem, 'id'>): Promise<ApiResponse> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/pizzerias/${pizzeriaId}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
    });
    if(response.ok) {
        const savedItem = await response.json();
        setPizzerias(pizzerias => pizzerias.map(p => {
            if (p.id === pizzeriaId) {
                return { ...p, menu: [...p.menu, savedItem] };
            }
            return p;
        }));
        return { success: true };
    } else {
        return { success: false, message: "Não foi possível adicionar o item.", isNetworkError: false };
    }
    } catch (e) {
        console.error("Failed to add menu item:", e);
        return { success: false, message: "Falha na comunicação ao adicionar o item.", isNetworkError: true };
    }
  };

  const deleteMenuItem = async (pizzeriaId: string, menuItemId: string): Promise<ApiResponse> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/pizzerias/${pizzeriaId}/menu/${menuItemId}`, {
          method: 'DELETE'
      });
      if(response.ok) {
          setPizzerias(pizzerias => pizzerias.map(p => {
              if (p.id === pizzeriaId) {
                  return { ...p, menu: p.menu.filter(item => item.id !== menuItemId) };
              }
              return p;
          }));
          return { success: true };
      } else {
        return { success: false, message: "Não foi possível remover o item.", isNetworkError: false };
      }
    } catch (e) {
        console.error("Failed to delete menu item:", e);
        return { success: false, message: "Falha na comunicação ao remover o item.", isNetworkError: true };
    }
  };
  const updateTableStatus = async (tableId: string, status: Table['status']): Promise<ApiResponse> => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/tables/${tableId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if(response.ok) {
            const updatedTable = await response.json();
            setTables(tables => tables.map(t => t.id === tableId ? updatedTable : t));
            return { success: true };
        } else {
            return { success: false, message: "Não foi possível atualizar a mesa.", isNetworkError: false };
        }
    } catch (e) {
        console.error("Failed to update table status:", e);
        return { success: false, message: "Falha na comunicação ao atualizar a mesa.", isNetworkError: true };
    }
  };

  // --- Admin Functions ---
  const togglePizzeriaActive = async (pizzeriaId: string): Promise<ApiResponse> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/pizzerias/${pizzeriaId}/toggle-active`, {
          method: 'PATCH'
      });
      if(response.ok) {
          const updatedPizzeria = await response.json();
          setPizzerias(pizzerias => pizzerias.map(p => p.id === pizzeriaId ? updatedPizzeria : p));
          return { success: true };
      } else {
          return { success: false, message: "Não foi possível alterar o status da pizzaria.", isNetworkError: false };
      }
    } catch (e) {
        console.error("Failed to toggle pizzeria active status:", e);
        return { success: false, message: "Falha na comunicação ao alterar o status da pizzaria.", isNetworkError: true };
    }
  };

  return (
    <AppContext.Provider value={{ 
        view, params, navigate, 
        isLoading, initError, retryInit, transientError, setTransientError, isOnline,
        cart, addToCart, updateCartItemQuantity, removeFromCart, getCartTotal, clearCart,
        currentOrder, orders, placeOrder, updateOrderStatus,
        pizzerias, getPizzeria,
        cartPizzeriaId,
        currentUser, login, logout, register,
        getOwnerPizzeria, updateMenuItem, addMenuItem, deleteMenuItem, tables, updateTableStatus,
        togglePizzeriaActive
    }}>
      {children}
    </AppContext.Provider>
  );
};