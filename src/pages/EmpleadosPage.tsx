// src/pages/EmpleadosPage.tsx
import { useEffect, useState } from "react";
import {
  fetchEmpleados,
  type Empleado,
  type EmpleadosPage,
  deleteEmpleado,
} from "../api/empleadosApi";
import { EmpleadoFormModal } from "../components/EmpleadoFormModal";
import { EmpleadosToolbar } from "../components/EmpleadosToolbar";
import { EmpleadosStats } from "../components/EmpleadosStats";
import { EmpleadosTable } from "../components/EmpleadosTable";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { useNotification } from "../context/NotificationContext";

import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Toolbar,
} from "@mui/material";

// Libs para exportar
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ActivoFilter = "todos" | "activos" | "inactivos";

export function EmpleadosPage() {
  const { showSuccess, showError } = useNotification();

  const [empleadosPage, setEmpleadosPage] = useState<EmpleadosPage | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [empleadoEdit, setEmpleadoEdit] = useState<Empleado | null>(null);

  const [search, setSearch] = useState("");
  const [activoFilter, setActivoFilter] = useState<ActivoFilter>("todos");

  // Paginación local
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);

  // Confirmación eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState<Empleado | null>(
    null
  );

  const getActivoValue = (): boolean | undefined => {
    if (activoFilter === "activos") return true;
    if (activoFilter === "inactivos") return false;
    return undefined;
  };

  const cargarEmpleados = async (
    pageParam: number,
    sizeParam: number,
    searchParam: string,
    activoParam: boolean | undefined
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmpleados(
        pageParam,
        sizeParam,
        searchParam,
        activoParam
      );
      setEmpleadosPage(data);
    } catch (err: any) {
      console.error("ERROR axios:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
      setError("No se pudieron cargar los empleados.");
      showError("No se pudieron cargar los empleados.");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial + cuando cambian página o filtro de activo
  useEffect(() => {
    cargarEmpleados(page, pageSize, search, getActivoValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activoFilter]);

  const empleados = empleadosPage?.content ?? [];

  // Stats de la página actual
  const totalEnPagina = empleados.length;
  const activosEnPagina = empleados.filter((e) => e.activo).length;
  const inactivosEnPagina = totalEnPagina - activosEnPagina;

  const abrirNuevo = () => {
    setEmpleadoEdit(null);
    setShowModal(true);
  };

  const abrirEditar = (empleado: Empleado) => {
    setEmpleadoEdit(empleado);
    setShowModal(true);
  };

  // Confirmación de eliminación
  const solicitarEliminar = (empleado: Empleado) => {
    setEmpleadoToDelete(empleado);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setEmpleadoToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!empleadoToDelete) {
      handleCloseConfirm();
      return;
    }

    try {
      await deleteEmpleado(empleadoToDelete.id);
      await cargarEmpleados(page, pageSize, search, getActivoValue());
      showSuccess("Empleado eliminado correctamente.");
    } catch (err: any) {
      console.error("Error al eliminar empleado:", err);
      showError("No se pudo eliminar el empleado.");
    } finally {
      handleCloseConfirm();
    }
  };

  // Buscar
  const handleSearchSubmit = () => {
    setPage(0);
    cargarEmpleados(0, pageSize, search, getActivoValue());
  };

  // Cambio de filtro de activo (auto-recarga con useEffect)
  const handleActivoFilterChange = (value: ActivoFilter) => {
    setActivoFilter(value);
    setPage(0);
  };

  // Cambio de página desde la tabla (0-based)
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // ---------- EXPORTACIONES (sobre la página actual) ----------

  const buildPlainRows = () =>
    empleados.map((e) => ({
      ID: e.id,
      NumEmpleado: e.numEmpleado,
      Nombres: e.nombres,
      ApellidoPaterno: e.apellidoPaterno,
      ApellidoMaterno: e.apellidoMaterno ?? "",
      Telefono: e.telefono ?? "",
      Email: e.email ?? "",
      FechaIngreso: e.fechaIngreso,
      Activo: e.activo ? "SI" : "NO",
    }));

  const handleExportCsv = () => {
    if (!empleados || empleados.length === 0) {
      showError("No hay empleados para exportar.");
      return;
    }

    const rows = buildPlainRows();
    const headers = Object.keys(rows[0]) as (keyof (typeof rows)[number])[];

    const csvContent =
      [
        headers.join(";"),
        ...rows.map((row) =>
          headers
            .map((h) => {
              const value = row[h] ?? "";
              const escaped = String(value).replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(";")
        ),
      ].join("\r\n") + "\r\n";

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "empleados.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportXlsx = () => {
    if (!empleados || empleados.length === 0) {
      showError("No hay empleados para exportar.");
      return;
    }

    const rows = buildPlainRows();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Empleados");

    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "empleados.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!empleados || empleados.length === 0) {
      showError("No hay empleados para exportar.");
      return;
    }

    const rows = buildPlainRows();

    const headers = [
      "ID",
      "NumEmpleado",
      "Nombres",
      "ApellidoPaterno",
      "ApellidoMaterno",
      "Telefono",
      "Email",
      "FechaIngreso",
      "Activo",
    ];

    const body = rows.map((r) => [
      r.ID,
      r.NumEmpleado,
      r.Nombres,
      r.ApellidoPaterno,
      r.ApellidoMaterno,
      r.Telefono,
      r.Email,
      r.FechaIngreso,
      r.Activo,
    ]);

    const filtros: string[] = [];
    if (search.trim()) {
      filtros.push(`Búsqueda: "${search.trim()}"`);
    }
    if (activoFilter !== "todos") {
      filtros.push(
        `Estado: ${activoFilter === "activos" ? "Activos" : "Inactivos"}`
      );
    }
    const filtrosTexto =
      filtros.length > 0 ? filtros.join(" | ") : "Sin filtros";

    const ahora = new Date();
    const fechaTexto = ahora.toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    doc.setFontSize(14);
    doc.text("Listado de empleados", 40, 40);

    doc.setFontSize(10);
    doc.text(`Filtros: ${filtrosTexto}`, 40, 58);
    doc.text(`Generado: ${fechaTexto}`, 40, 72);

    autoTable(doc, {
      startY: 90,
      head: [headers],
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },
    });

    doc.save("empleados.pdf");
  };

  // ---------- FIN EXPORTACIONES ----------

  const handleModalSaved = () => {
    const isEdit = !!empleadoEdit;
    cargarEmpleados(page, pageSize, search, getActivoValue());
    setEmpleadoEdit(null);

    showSuccess(
      isEdit
        ? "Empleado actualizado correctamente."
        : "Empleado creado correctamente."
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Toolbar
          sx={{
            px: 0,
            mb: 1,
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h5" component="h1">
            Empleados
          </Typography>

          <EmpleadosToolbar
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            activoFilter={activoFilter}
            onActivoFilterChange={handleActivoFilterChange}
            onNuevo={abrirNuevo}
            onExportCsv={handleExportCsv}
            onExportXlsx={handleExportXlsx}
            onExportPdf={handleExportPdf}
          />
        </Toolbar>

        {!loading && !error && (
          <EmpleadosStats
            total={totalEnPagina}
            activos={activosEnPagina}
            inactivos={inactivosEnPagina}
          />
        )}

        {loading && (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        )}

        {error && !loading && <Alert severity="error">{error}</Alert>}

        {!loading && !error && empleados.length === 0 && (
          <Alert severity="info">No hay empleados registrados.</Alert>
        )}

        {!loading && !error && empleados.length > 0 && (
          <EmpleadosTable
            empleados={empleados}
            page={page}
            totalPages={empleadosPage?.totalPages ?? 1}
            onPageChange={handlePageChange}
            onEdit={abrirEditar}
            onDelete={solicitarEliminar}
          />
        )}
      </Paper>

      <EmpleadoFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleModalSaved}
        empleado={empleadoEdit}
      />

      <ConfirmDeleteDialog
        open={confirmOpen}
        empleado={empleadoToDelete}
        onCancel={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
      />
    </Container>
  );
}
