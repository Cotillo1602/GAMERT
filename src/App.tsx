import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import { StateSync } from "./lib/api/StateSync";
import { Phone } from "./components/layout/Layout";
import { ToastProvider } from "./components/layout/Toast";
import { routes } from "./routes";

/** Marco de dispositivo que envuelve todas las pantallas del prototipo. */
function Shell() {
  return (
    <Phone>
      <Outlet />
    </Phone>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

const router = createBrowserRouter([
  {
    element: (
      <>
        <StateSync />
        <AppProvider>
          <ToastProvider>
            <Shell />
          </ToastProvider>
        </AppProvider>
      </>
    ),
    children: [{ index: true, element: <Navigate to="/home" replace /> }, ...routes],
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
