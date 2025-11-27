// src/api/empleadosApi.ts
import apiClient from "./apiClient";

export interface Empleado {
  id: number;
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  telefono: string | null;
  email: string | null;
  fechaIngreso: string; // ISO (YYYY-MM-DD)
  activo: boolean;
}

export interface EmpleadosPage {
  content: Empleado[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual (0-based)
  size: number;
}

// Parámetros cómodos para el front
export type GetEmpleadosOptions = {
  page?: number;        // 0-based
  size?: number;
  search?: string;
  soloActivos?: boolean; // true = solo activos, false/undefined = todos
};

export type EmpleadoCreateRequest = {
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  email?: string;
  fechaIngreso: string; // YYYY-MM-DD
};

export type EmpleadoUpdateRequest = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  email?: string;
  fechaIngreso: string; // YYYY-MM-DD
  activo: boolean;
};

// Función base que pega al backend con query params directos
export async function fetchEmpleados(
  page = 0,
  size = 20,
  search?: string,
  activo?: boolean
): Promise<EmpleadosPage> {
  const params: Record<string, unknown> = { page, size };

  if (search && search.trim() !== "") {
    params.q = search.trim();
  }

  if (typeof activo === "boolean") {
    params.activo = activo;
  }

  const res = await apiClient.get<EmpleadosPage>("/api/empleados", {
    params,
  });
  return res.data;
}

// Versión friendly para el front (la que usas en EmpleadosPage)
export async function getEmpleados(
  options: GetEmpleadosOptions = {}
): Promise<EmpleadosPage> {
  const {
    page = 0,
    size = 20,
    search,
    soloActivos,
  } = options;

  // si soloActivos = true => activo=true
  // si soloActivos = false/undefined => no mandamos filtro y vienen todos
  const activo = soloActivos ? true : undefined;

  return fetchEmpleados(page, size, search, activo);
}

// Crear empleado (nombre en inglés como usas en EmpleadosPage)
export async function createEmpleado(
  payload: EmpleadoCreateRequest
): Promise<Empleado> {
  const res = await apiClient.post<Empleado>("/api/empleados", payload);
  return res.data;
}

// Alias en español por si en algún lado ya usabas crearEmpleado
export { createEmpleado as crearEmpleado };

export async function updateEmpleado(
  id: number,
  payload: EmpleadoUpdateRequest
): Promise<Empleado> {
  const res = await apiClient.put<Empleado>(`/api/empleados/${id}`, payload);
  return res.data;
}

export async function deleteEmpleado(id: number): Promise<void> {
  await apiClient.delete(`/api/empleados/${id}`);
}
