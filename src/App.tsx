import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
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

const router = createBrowserRouter([
  {
    element: (
      <AppProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AppProvider>
    ),
    children: [{ index: true, element: <Navigate to="/home" replace /> }, ...routes],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
