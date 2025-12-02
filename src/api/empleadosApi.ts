// src/api/empleadosApi.ts
import { apiClient } from "./apiClient";

// ----- Tipos -----

export interface Empleado {
  id: number;
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  telefono: string | null;
  email: string | null;
  fechaIngreso: string | null; // ISO yyyy-MM-dd o fecha completa
  activo: boolean;

  // básicos adicionales
  fechaNacimiento: string | null;
  genero: string | null;
  estadoCivil: string | null;
  curp: string | null;
  rfc: string | null;
  nss: string | null;
  foto: string | null;

  // FK simples (ids)
  departamentoId: number | null;
  puestoId: number | null;
  turnoId: number | null;
  horarioId: number | null;
  supervisorId: number | null;

  // domicilio
  calle: string | null;
  numExt: string | null;
  numInt: string | null;
  colonia: string | null;
  municipio: string | null;
  estado: string | null;
  cp: string | null;
  nacionalidad: string | null;
  lugarNacimiento: string | null;

  // escolaridad / médico
  escolaridad: string | null;
  tipoSangre: string | null;

  // contacto emergencia
  contactoNombre: string | null;
  contactoTelefono: string | null;
  contactoParentesco: string | null;

  // bancario / nómina
  banco: string | null;
  cuentaBancaria: string | null;
  clabe: string | null;
  salarioBase: number | null;
  tipoContrato: string | null;
  tipoJornada: string | null;
  fechaBaja: string | null;
  motivoBaja: string | null;

  // IMSS / INFONAVIT / FONACOT
  imssRegPatronal: string | null;
  infonavitNumero: string | null;
  infonavitDescuentoTipo: string | null;
  infonavitDescuentoValor: number | null;
  fonacotNumero: string | null;

  // licencia
  licenciaNumero: string | null;
  licenciaTipo: string | null;
  licenciaVigencia: string | null;
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
  page?: number;       // 0-based
  size?: number;
  search?: string;
  soloActivos?: boolean; // true = solo activos, false/undefined = todos
};

// payload de alta
export interface EmpleadoCreateRequest {
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  telefono?: string | null;
  email?: string | null;
  fechaIngreso: string;   // yyyy-MM-dd requerido
  activo?: boolean;

  fechaNacimiento?: string | null;
  genero?: string | null;
  estadoCivil?: string | null;
  curp?: string | null;
  rfc?: string | null;
  nss?: string | null;
  foto?: string | null;

  departamentoId?: number | null;
  puestoId?: number | null;
  turnoId?: number | null;
  horarioId?: number | null;
  supervisorId?: number | null;

  calle?: string | null;
  numExt?: string | null;
  numInt?: string | null;
  colonia?: string | null;
  municipio?: string | null;
  estado?: string | null;
  cp?: string | null;
  nacionalidad?: string | null;
  lugarNacimiento?: string | null;

  escolaridad?: string | null;
  tipoSangre?: string | null;

  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoParentesco?: string | null;

  banco?: string | null;
  cuentaBancaria?: string | null;
  clabe?: string | null;
  salarioBase?: number | null;
  tipoContrato?: string | null;
  tipoJornada?: string | null;
  fechaBaja?: string | null;
  motivoBaja?: string | null;

  imssRegPatronal?: string | null;
  infonavitNumero?: string | null;
  infonavitDescuentoTipo?: string | null;
  infonavitDescuentoValor?: number | null;
  fonacotNumero?: string | null;

  licenciaNumero?: string | null;
  licenciaTipo?: string | null;
  licenciaVigencia?: string | null;
}

// payload de actualización
export interface EmpleadoUpdateRequest extends EmpleadoCreateRequest {
  activo: boolean;
}

// ----- Funciones -----

export async function getEmpleados(
  options: GetEmpleadosOptions = {}
): Promise<EmpleadosPage> {
  const { page = 0, size = 10, search, soloActivos } = options;

  const params: Record<string, unknown> = {
    page,
    size,
  };

  if (search && search.trim() !== "") {
    params.q = search.trim();
  }
  if (soloActivos !== undefined) {
    params.activo = soloActivos;
  }

  const response = await apiClient.get<EmpleadosPage>("/api/empleados", {
    params,
  });
  return response.data;
}

export async function createEmpleado(
  payload: EmpleadoCreateRequest
): Promise<Empleado> {
  const { data } = await apiClient.post<Empleado>("/api/empleados", payload);
  return data;
}

export async function updateEmpleado(
  id: number,
  payload: EmpleadoUpdateRequest
): Promise<Empleado> {
  const { data } = await apiClient.put<Empleado>(`/api/empleados/${id}`, payload);
  return data;
}

export async function deleteEmpleado(id: number): Promise<void> {
  await apiClient.delete(`/api/empleados/${id}`);
}
