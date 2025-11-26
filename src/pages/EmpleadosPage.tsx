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
  MenuItem,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";

function formatearNombre(e: Empleado) {
  return `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim();
}

type ActivoFilter = "todos" | "activos" | "inactivos";

export function EmpleadosPage() {
  const { showSuccess, showError } = useNotification();

  const [empleadosPage, setEmpleadosPage] = useState<EmpleadosPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [empleadoEdit, setEmpleadoEdit] = useState<Empleado | null>(null);

  const [search, setSearch] = useState("");
  const [activoFilter, setActivoFilter] = useState<ActivoFilter>("todos");

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
      const data = await fetchEmpleados(page, size, currentSearch, currentActivo);
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

  const handleEliminar = async (empleado: Empleado) => {
    const nombre = formatearNombre(empleado);

    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar al empleado:\n\n${empleado.numEmpleado} - ${nombre}?`
    );

    if (!confirmado) return;

    try {
      await deleteEmpleado(empleado.id);
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
    }
  };

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

  const handleActivoChange = (e: any) => {
    const value = e.target.value as ActivoFilter;
    setActivoFilter(value);

    const activoValue =
      value === "activos" ? true : value === "inactivos" ? false : undefined;

    cargarEmpleados(0, empleadosPage?.size ?? 20, search, activoValue);
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
                        onClick={() => handleEliminar(e)}
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
        onSaved={() => {
          const isEdit = !!empleadoEdit;
          cargarEmpleados(
            empleadosPage?.number ?? 0,
            empleadosPage?.size ?? 20,
            search,
            getActivoValue()
          );
          setShowModal(false);
          setEmpleadoEdit(null);
          showSuccess(
            isEdit
              ? "Empleado actualizado correctamente."
              : "Empleado creado correctamente."
          );
        }}
        empleado={empleadoEdit}
      />
    </Container>
  );
}
