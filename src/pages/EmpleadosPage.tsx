// src/pages/EmpleadosPage.tsx
import React, { useEffect, useState } from "react";
import {
  fetchEmpleados,
  type Empleado,
  type EmpleadosPage,
  deleteEmpleado,
} from "../api/empleadosApi";
import { EmpleadoFormModal } from "../components/EmpleadoFormModal";
import { useNotification } from "../context/NotificationContext";

import {
  Container,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Toolbar,
  Button,
  TextField,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";

// Libs para exportar
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatearNombre(e: Empleado) {
  return `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim();
}

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

  // Menú de exportación
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const exportMenuOpen = Boolean(exportAnchorEl);

  // Diálogo de confirmación de borrado
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState<Empleado | null>(
    null
  );

  const handleOpenExportMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  const getActivoValue = (): boolean | undefined => {
    if (activoFilter === "activos") return true;
    if (activoFilter === "inactivos") return false;
    return undefined;
  };

  const cargarEmpleados = async (
    page = 0,
    size = 20,
    currentSearch = search,
    currentActivo = getActivoValue()
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmpleados(
        page,
        size,
        currentSearch,
        currentActivo
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

  useEffect(() => {
    cargarEmpleados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empleados = empleadosPage?.content ?? [];

  const abrirNuevo = () => {
    setEmpleadoEdit(null);
    setShowModal(true);
  };

  const abrirEditar = (empleado: Empleado) => {
    setEmpleadoEdit(empleado);
    setShowModal(true);
  };

  // --- Confirmación de eliminación ---

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
      await cargarEmpleados(
        empleadosPage?.number ?? 0,
        empleadosPage?.size ?? 20,
        search,
        getActivoValue()
      );
      showSuccess("Empleado eliminado correctamente.");
    } catch (err: any) {
      console.error("Error al eliminar empleado:", err);
      showError("No se pudo eliminar el empleado.");
    } finally {
      handleCloseConfirm();
    }
  };

  // --- Fin confirmación eliminación ---

  const handleSearchClick = () => {
    cargarEmpleados(0, empleadosPage?.size ?? 20, search, getActivoValue());
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    const size = empleadosPage?.size ?? 20;
    cargarEmpleados(page - 1, size, search, getActivoValue());
  };

  const handleActivoChange = (event: SelectChangeEvent<ActivoFilter>) => {
    const value = event.target.value as ActivoFilter;
    setActivoFilter(value);

    const activoValue =
      value === "activos" ? true : value === "inactivos" ? false : undefined;

    cargarEmpleados(0, empleadosPage?.size ?? 20, search, activoValue);
  };

  // ---------- EXPORTACIONES ----------

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
    handleCloseExportMenu();

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
    handleCloseExportMenu();

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
    handleCloseExportMenu();

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

    // Filtros para mostrar en el PDF
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
    cargarEmpleados(
      empleadosPage?.number ?? 0,
      empleadosPage?.size ?? 20,
      search,
      getActivoValue()
    );
    setEmpleadoEdit(null);

    showSuccess(
      isEdit
        ? "Empleado actualizado correctamente."
        : "Empleado creado correctamente."
    );
  };

  const nombreEmpleadoAEliminar = empleadoToDelete
    ? `${empleadoToDelete.numEmpleado} - ${formatearNombre(empleadoToDelete)}`
    : "";

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

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexGrow: 1, justifyContent: "flex-end", flexWrap: "wrap" }}
          >
            <TextField
              size="small"
              placeholder="Buscar por número, nombre o apellido"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              sx={{ minWidth: 260 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="activo-filter-label">Estado</InputLabel>
              <Select
                labelId="activo-filter-label"
                label="Estado"
                value={activoFilter}
                onChange={handleActivoChange}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="activos">Activos</MenuItem>
                <MenuItem value="inactivos">Inactivos</MenuItem>
              </Select>
            </FormControl>

            <Button variant="outlined" onClick={handleSearchClick}>
              Buscar
            </Button>

            <Button variant="outlined" onClick={handleOpenExportMenu}>
              Exportar
            </Button>
            <Menu
              anchorEl={exportAnchorEl}
              open={exportMenuOpen}
              onClose={handleCloseExportMenu}
            >
              <MenuItem onClick={handleExportCsv}>Exportar CSV</MenuItem>
              <MenuItem onClick={handleExportXlsx}>Exportar XLSX</MenuItem>
              <MenuItem onClick={handleExportPdf}>Exportar PDF</MenuItem>
            </Menu>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirNuevo}
            >
              Nuevo empleado
            </Button>
          </Stack>
        </Toolbar>

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
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Fecha ingreso</TableCell>
                  <TableCell>Activo</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empleados.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.id}</TableCell>
                    <TableCell>{e.numEmpleado}</TableCell>
                    <TableCell>{formatearNombre(e)}</TableCell>
                    <TableCell>{e.telefono ?? "-"}</TableCell>
                    <TableCell>{e.email ?? "-"}</TableCell>
                    <TableCell>{e.fechaIngreso}</TableCell>
                    <TableCell>
                      <Chip
                        label={e.activo ? "Activo" : "Inactivo"}
                        color={e.activo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => abrirEditar(e)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => solicitarEliminar(e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {empleadosPage && empleadosPage.totalPages > 1 && (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                <Pagination
                  count={empleadosPage.totalPages}
                  page={empleadosPage.number + 1}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                />
              </Stack>
            )}
          </>
        )}
      </Paper>

      <EmpleadoFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleModalSaved}
        empleado={empleadoEdit}
      />

      {/* Diálogo de confirmación */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent dividers>
          <Typography>
            ¿Seguro que quieres eliminar al empleado:
          </Typography>
          <Typography fontWeight="bold" sx={{ mt: 1 }}>
            {nombreEmpleadoAEliminar}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
