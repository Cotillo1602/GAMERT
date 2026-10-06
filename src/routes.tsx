import { Navigate, type RouteObject } from "react-router-dom";

import { Splash } from "./screens/Splash";
import { Login } from "./screens/Login";
import { Registro } from "./screens/Registro";
import { Home } from "./screens/Home";
import { Torneos } from "./screens/Torneos";
import { MisTorneos } from "./screens/MisTorneos";
import { DetalleTorneo } from "./screens/DetalleTorneo";
import { Inscripcion } from "./screens/Inscripcion";
import { Resultado } from "./screens/Resultado";
import { Cuadro } from "./screens/Cuadro";
import { Ranking } from "./screens/Ranking";
import { Clasificacion } from "./screens/Clasificacion";
import { Perfil } from "./screens/Perfil";
import { Configuracion } from "./screens/Configuracion";
import { Billetera } from "./screens/Billetera";
import { Organizaciones } from "./screens/Organizaciones";
import { Notificaciones } from "./screens/Notificaciones";
import { Categorias, Categoria } from "./screens/Categorias";
import { Menu } from "./screens/Menu";
import { Cargando } from "./screens/Cargando";
import { Confirmacion } from "./screens/Confirmacion";
import { Organizar } from "./screens/Organizar";
import { CrearTorneo } from "./screens/CrearTorneo";

/* Rutas del prototipo adaptadas al modelo real: el browse es por juego
   (no por categorías sueltas), el ranking es por GameId y el cuadro lo
   genera la app a partir de las reglas que declara el organizador. */
export const routes: RouteObject[] = [
  { path: "/splash", element: <Splash /> },
  { path: "/login", element: <Login /> },
  { path: "/registro", element: <Registro /> },

  { path: "/home", element: <Home /> },
  { path: "/torneos", element: <Torneos /> },
  { path: "/mis-torneos", element: <MisTorneos /> },
  { path: "/ranking", element: <Ranking /> },
  { path: "/ranking/:gameId", element: <Ranking /> },
  { path: "/perfil", element: <Perfil /> },

  /* el browse de juegos reemplaza a las categorías */
  { path: "/juegos", element: <Categorias /> },
  { path: "/juegos/:id", element: <Categoria /> },
  { path: "/categorias", element: <Navigate to="/juegos" replace /> },
  { path: "/categorias/:id", element: <Categoria /> },

  /* flujo del torneo: la app opera cuadro y resultados */
  { path: "/torneo/:id", element: <DetalleTorneo /> },
  { path: "/torneo/:id/inscripcion", element: <Inscripcion /> },
  { path: "/torneo/:id/cuadro", element: <Cuadro /> },
  { path: "/torneo/:id/resultado/:matchId", element: <Resultado /> },
  { path: "/torneo/:id/clasificacion", element: <Clasificacion /> },
  { path: "/torneo/:id/confirmacion", element: <Confirmacion /> },

  /* organización: el usuario declara reglas y premio, la app ejecuta */
  { path: "/organizar", element: <Organizar /> },
  { path: "/organizar/crear", element: <CrearTorneo /> },

  { path: "/configuracion", element: <Configuracion /> },
  { path: "/billetera", element: <Billetera /> },
  { path: "/organizaciones", element: <Organizaciones /> },
  { path: "/notificaciones", element: <Notificaciones /> },
  { path: "/menu", element: <Menu /> },
  { path: "/cargando", element: <Cargando /> },
  { path: "/confirmacion", element: <Navigate to="/home" replace /> },
  { path: "*", element: <Navigate to="/home" replace /> },
];
