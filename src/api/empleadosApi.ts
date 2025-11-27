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

export async function crearEmpleado(
  payload: EmpleadoCreateRequest
): Promise<Empleado> {
  const res = await apiClient.post<Empleado>("/api/empleados", payload);
  return res.data;
}

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

// Helper opcional si en algún lado usabas getEmpleados(page, size)
export const getEmpleados = async (page = 0, size = 10): Promise<EmpleadosPage> => {
  return fetchEmpleados(page, size);
};