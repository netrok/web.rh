// src/utils/empleadosExport.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Ajusta esta interfaz si tu Empleado tiene más campos
export interface Empleado {
  id: number;
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  telefono?: string | null;
  email?: string | null;
  fechaIngreso?: string | null; // ISO yyyy-MM-dd o similar
  activo: boolean;
}

/**
 * Exporta la lista de empleados a un archivo XLSX.
 */
export function exportEmpleadosToXlsx(empleados: Empleado[], fileName = "empleados.xlsx") {
  if (!empleados.length) {
    alert("No hay empleados para exportar.");
    return;
  }

  const rows = empleados.map((e) => ({
    "Num empleado": e.numEmpleado,
    "Nombre completo": `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim(),
    Teléfono: e.telefono ?? "",
    Email: e.email ?? "",
    "Fecha ingreso": e.fechaIngreso ?? "",
    Activo: e.activo ? "Sí" : "No",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Empleados");
  XLSX.writeFile(workbook, fileName);
}

/**
 * Exporta la lista de empleados a un PDF con tabla.
 */
export function exportEmpleadosToPdf(
  empleados: Empleado[],
  options?: {
    titulo?: string;
    filtrosDescripcion?: string;
    fileName?: string;
  }
) {
  if (!empleados.length) {
    alert("No hay empleados para exportar.");
    return;
  }

  const titulo = options?.titulo ?? "Listado de empleados";
  const filtrosDescripcion = options?.filtrosDescripcion ?? "";
  const fileName = options?.fileName ?? "empleados.pdf";

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(titulo, pageWidth / 2, 40, { align: "center" });

  // Subtítulo / filtros
  if (filtrosDescripcion) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(filtrosDescripcion, pageWidth / 2, 60, { align: "center" });
  }

  // Encabezado y filas para autoTable
  const headers = [
    "Num empleado",
    "Nombre completo",
    "Teléfono",
    "Email",
    "Fecha ingreso",
    "Activo",
  ];

  const body = empleados.map((e) => [
    e.numEmpleado,
    `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim(),
    e.telefono ?? "",
    e.email ?? "",
    e.fechaIngreso ?? "",
    e.activo ? "Sí" : "No",
  ]);

  autoTable(doc, {
    head: [headers],
    body,
    startY: filtrosDescripcion ? 80 : 60,
    styles: {
      fontSize: 9,
    },
    headStyles: {
      fillColor: [33, 150, 243], // azulito, opcional
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(fileName);
}
