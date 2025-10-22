"use client";

import useLocalStorage from "@/hooks/use-local-storage";
import AOS from "aos";
import "aos/dist/aos.css";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { CartItem } from "@/types";

interface AppContextProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getCartItemCount: () => number;
  clearCart: () => void;
}

type AppProviderProps = {
  children: ReactNode;
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export default function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
      // Add any other global AOS settings you want
    });
  }, []);
  const [cart, setCart] = useLocalStorage<CartItem[]>("cart", []);

  function addToCart(productId: number, quantity: number = 1) {
    if (quantity === 0) return;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        const newQuantity = updatedCart[existingItemIndex].quantity + quantity;

        if (newQuantity <= 0) {
          return prevCart;
        }

        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: newQuantity,
        };

        return updatedCart;
      }

      if (quantity > 0) {
        return [...prevCart, { productId, quantity }];
      }

      return prevCart;
    });
  }

  function removeFromCart(productId: number) {
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity,
        };
        return updatedCart;
      }

      // If item doesn't exist, add it
      return [...prevCart, { productId, quantity }];
    });
  }

  function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <AppContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartItemCount,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppProvider = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppProvider must be used within an AppProvider");
  }
  return context;
};
