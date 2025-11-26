// src/api/empleadosApi.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

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
  const params: any = { page, size };

  if (search && search.trim() !== "") {
    params.q = search.trim();
  }

  if (typeof activo === "boolean") {
    params.activo = activo;
  }

  const res = await axios.get<EmpleadosPage>(`${API_BASE_URL}/api/empleados`, {
    params,
  });
  return res.data;
}

export async function crearEmpleado(
  payload: EmpleadoCreateRequest
): Promise<Empleado> {
  const res = await axios.post<Empleado>(
    `${API_BASE_URL}/api/empleados`,
    payload
  );
  return res.data;
}

export async function updateEmpleado(
  id: number,
  payload: EmpleadoUpdateRequest
): Promise<Empleado> {
  const res = await axios.put<Empleado>(
    `${API_BASE_URL}/api/empleados/${id}`,
    payload
  );
  return res.data;
}

export async function deleteEmpleado(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/api/empleados/${id}`);
}
