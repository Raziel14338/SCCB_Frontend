import { ROLES } from "../models/Usuario";

/**
 * navegacion
 * ------------------------------------------------------------------
 * Única fuente de verdad de qué ve cada rol: enlaces del menú y
 * pantalla de inicio tras el login. Si agregas una ruta nueva, se
 * declara aquí y en App.jsx, nada más.
 */
export const ENLACES = [
  { to: "/dashboard", label: "Panel de control", roles: null },
  { to: "/monitoreo", label: "Monitoreo", roles: null },
  { to: "/alertas", label: "Alertas", roles: null },
  { to: "/admin/dashboard", label: "Administración", roles: [ROLES.ADMIN_RED] },
  { to: "/infraestructura", label: "Infraestructura", roles: [ROLES.ADMIN_RED] },
  { to: "/fiscalizacion/dashboard", label: "Fiscalización", roles: [ROLES.FISCAL_ANH] },
  { to: "/fiscalizacion/cupos", label: "Cupos", roles: [ROLES.FISCAL_ANH] },
  { to: "/operador/dashboard", label: "Despacho", roles: [ROLES.OPERADOR_YPFB] },
];

export const RUTA_INICIO = Object.freeze({
  [ROLES.ADMIN_RED]: "/admin/dashboard",
  [ROLES.FISCAL_ANH]: "/fiscalizacion/dashboard",
  [ROLES.OPERADOR_YPFB]: "/operador/dashboard",
});

export function enlacesParaRol(nombreRol) {
  return ENLACES.filter((e) => !e.roles || e.roles.includes(nombreRol));
}

export function rutaInicioParaRol(nombreRol) {
  return RUTA_INICIO[nombreRol] ?? "/dashboard";
}