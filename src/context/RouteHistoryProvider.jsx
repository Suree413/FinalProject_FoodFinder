import { useCallback, useEffect, useRef } from "react";
import {
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { NavigationHistoryContext } from "./navigationHistoryContext";
import { Stack } from "../utils/Stack";

export function NavigationHistoryProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const historyStack = useRef(new Stack());
  const previousPath = useRef(
    `${location.pathname}${location.search}${location.hash}`,
  );
  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (currentPath === previousPath.current) return;

    if (navigationType === "PUSH") {
      historyStack.current.push(previousPath.current);
    } else if (navigationType === "POP") {
      historyStack.current.pop();
    }

    previousPath.current = currentPath;
  }, [currentPath, navigationType]);

  const goBack = useCallback(() => {
    navigate(historyStack.current.pop() || "/", { replace: true });
  }, [navigate]);

  return (
    <NavigationHistoryContext.Provider value={goBack}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}
