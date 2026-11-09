import { createContext, useContext } from "react";

export const NavigationHistoryContext = createContext(null);

export function useNavigationHistory() {
  const goBack = useContext(NavigationHistoryContext);
  if (!goBack) {
    throw new Error(
      "useNavigationHistory must be used within NavigationHistoryProvider",
    );
  }
  return goBack;
}
