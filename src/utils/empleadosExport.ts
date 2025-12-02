// src/utils/empleadosExport.ts
import type { Empleado } from "../api/empleadosApi";

// ---- Excel (XLSX) ----
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ---- PDF (jsPDF + autoTable) ----
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportEmpleadosToXlsx(
  empleados: Empleado[],
  fileName: string = "empleados.xlsx"
) {
  const data = empleados.map((e) => ({
    ID: e.id,
    "Número empleado": e.numEmpleado,
    Nombre: `${e.nombres} ${e.apellidoPaterno} ${
      e.apellidoMaterno ?? ""
    }`.trim(),
    Teléfono: e.telefono ?? "",
    Email: e.email ?? "",
    "Fecha ingreso": e.fechaIngreso ?? "",
    Activo: e.activo ? "Sí" : "No",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Empleados");

  const wbout = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
}

type ExportPdfOptions = {
  titulo?: string;
  filtrosDescripcion?: string;
  fileName?: string;
};

export function exportEmpleadosToPdf(
  empleados: Empleado[],
  options: ExportPdfOptions = {}
) {
  const {
    titulo = "Listado de empleados",
    filtrosDescripcion,
    fileName = "empleados.pdf",
  } = options;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;
  let currentY = 14;

  const total = empleados.length;
  const activos = empleados.filter((e) => e.activo).length;
  const inactivos = total - activos;

  // === ENCABEZADO CORPORATIVO ===
  const headerHeight = 22;
  doc.setFillColor(25, 118, 210); // azul MUI
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("GV · Recursos Humanos", marginX, 9);

  doc.setFontSize(15);
  doc.text(titulo, pageWidth / 2, 13, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const fechaStr = new Date().toLocaleString("es-MX");
  doc.text(`Generado: ${fechaStr}`, pageWidth - marginX, 9, {
    align: "right",
  });

  currentY = headerHeight + 4;

  // Subtítulo / filtros
  if (filtrosDescripcion) {
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(filtrosDescripcion, marginX, currentY);
    currentY += 5;
  }

  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 4;

  // === TABLA ===
  const body = empleados.map((e) => [
    e.id,
    e.numEmpleado,
    `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim(),
    e.telefono ?? "",
    e.email ?? "",
    e.fechaIngreso ?? "",
    e.activo ? "Activo" : "Inactivo",
  ]);

  const autoTableOptions: any = {
    startY: currentY,
    head: [
      [
        "ID",
        "Número",
        "Nombre",
        "Teléfono",
        "Email",
        "Fecha ingreso",
        "Estado",
      ],
    ],
    body,
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      valign: "middle",
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 40,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.1,
    didDrawPage: () => {
      const footerY = pageHeight - 8;

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);

      const resumen = `Total: ${total}   Activos: ${activos}   Inactivos: ${inactivos}`;
      doc.text(resumen, marginX, footerY);

      doc.text(
        "GV-RH · Gestión de Recursos Humanos",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );

      const numPages =
        (doc.internal as any).getNumberOfPages?.() ??
        (doc as any).getNumberOfPages?.() ??
        1;
      const pageNumber = String(numPages);
      doc.text(`Página ${pageNumber}`, pageWidth - marginX, footerY, {
        align: "right",
      });
    },
  };

  autoTable(doc as any, autoTableOptions);

  doc.save(fileName);
}
