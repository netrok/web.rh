// src/pages/EmpleadosPage.tsx
import React, { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  getEmpleados,
  deleteEmpleado,
  type Empleado,
} from "../api/empleadosApi";
import { EmpleadosToolbar } from "../components/EmpleadosToolbar";
import { EmpleadosStats } from "../components/EmpleadosStats";
import EmpleadosTable from "../components/EmpleadosTable";
import EmpleadoFormModal from "../components/EmpleadoFormModal";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { useAuth } from "../context/AuthContext";

const EmpleadosPage: React.FC = () => {
  const { hasRole } = useAuth();

  // permisos por rol
  const canCreate = hasRole("SUPERADMIN", "ADMIN", "RRHH");
  const canEdit = hasRole("SUPERADMIN", "ADMIN", "RRHH");
  const canDelete = hasRole("SUPERADMIN", "ADMIN");

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [empleadoEdit, setEmpleadoEdit] = useState<Empleado | null>(null);

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [empleadoDelete, setEmpleadoDelete] = useState<Empleado | null>(null);

  // --- Carga de empleados (paginado) ---
  const cargarEmpleados = async (pageToLoad: number = page) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEmpleados({
        page: pageToLoad,
        search,
        soloActivos,
      });

      setEmpleados(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (err) {
      console.error(err);
      setError("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  // Primera carga y cuando cambian filtros/buscador
  useEffect(() => {
    setPage(0);
    void cargarEmpleados(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, soloActivos]);

  // --- Toolbar ---
  const handleNuevo = () => {
    if (!canCreate) return;
    setEmpleadoEdit(null);
    setOpenForm(true);
  };

  const handleRefresh = () => {
    void cargarEmpleados(0);
  };

  // --- Cambio de página desde la tabla ---
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void cargarEmpleados(newPage);
  };

  // --- Tabla: editar / eliminar ---
  const handleEditar = (empleado: Empleado) => {
    if (!canEdit) return;
    setEmpleadoEdit(empleado);
    setOpenForm(true);
  };

  const handleSolicitarEliminar = (empleado: Empleado) => {
    if (!canDelete) return;
    setEmpleadoDelete(empleado);
    setOpenConfirmDelete(true);
  };

  // --- Form modal: después de guardar ---
  const handleSaved = async () => {
    setOpenForm(false);
    setEmpleadoEdit(null);
    await cargarEmpleados(page);
  };

  // --- Confirmar eliminación ---
  const handleConfirmarEliminar = async () => {
    if (!empleadoDelete) return;

    try {
      await deleteEmpleado(empleadoDelete.id);
      setOpenConfirmDelete(false);
      setEmpleadoDelete(null);
      await cargarEmpleados(page);
    } catch (err) {
      console.error(err);
      setError("Error al eliminar empleado");
    }
  };

  // --- Stats rápidos (sobre la página actual) ---
  const total = empleados.length;
  const activos = empleados.filter((e) => e.activo).length;
  const inactivos = total - activos;

  // --- Descripción filtros para PDF ---
  const filtrosDescripcion = [
    soloActivos ? "Solo activos" : "Todos",
    `Página ${page + 1} de ${totalPages}`,
    search ? `Búsqueda: "${search}"` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box p={3}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={600}>
          Empleados
        </Typography>

        <EmpleadosStats total={total} activos={activos} inactivos={inactivos} />

        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
          {loading && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Cargando empleados...
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <EmpleadosToolbar
            search={search}
            onSearchChange={setSearch}
            soloActivos={soloActivos}
            onSoloActivosChange={setSoloActivos}
            onNuevo={handleNuevo}
            onRefresh={handleRefresh}
            empleados={empleados}
            filtrosDescripcion={filtrosDescripcion}
            loading={loading}
            canCreate={canCreate}
          />

          <EmpleadosTable
            empleados={empleados}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onEdit={handleEditar}
            onDelete={handleSolicitarEliminar}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </Paper>
      </Stack>

      <EmpleadoFormModal
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEmpleadoEdit(null);
        }}
        empleado={empleadoEdit}
        onSaved={handleSaved}
      />

      <ConfirmDeleteDialog
        open={openConfirmDelete}
        title="Eliminar empleado"
        description={
          empleadoDelete
            ? `¿Seguro que deseas eliminar a ${empleadoDelete.nombres} ${empleadoDelete.apellidoPaterno}?`
            : ""
        }
        onCancel={() => {
          setOpenConfirmDelete(false);
          setEmpleadoDelete(null);
        }}
        onConfirm={handleConfirmarEliminar}
      />
    </Box>
  );
};

export default EmpleadosPage;
