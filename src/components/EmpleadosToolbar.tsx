// src/components/EmpleadosToolbar.tsx
import React from "react";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Button,
  FormControlLabel,
  Switch,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import TableViewIcon from "@mui/icons-material/TableView";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import type { Empleado } from "../api/empleadosApi";
import {
  exportEmpleadosToXlsx,
  exportEmpleadosToPdf,
} from "../utils/empleadosExport";

export interface EmpleadosToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  soloActivos: boolean;
  onSoloActivosChange: (value: boolean) => void;
  onNuevo: () => void;
  onRefresh: () => void;

  // para export
  empleados: Empleado[];
  filtrosDescripcion?: string;
  loading?: boolean;

  // control por roles
  canCreate?: boolean; // opcional, default true
}

export const EmpleadosToolbar: React.FC<EmpleadosToolbarProps> = ({
  search,
  onSearchChange,
  soloActivos,
  onSoloActivosChange,
  onNuevo,
  onRefresh,
  empleados,
  filtrosDescripcion,
  loading,
  canCreate = true,
}) => {
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onSearchChange(event.target.value);
  };

  const handleSoloActivosToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onSoloActivosChange(event.target.checked);
  };

  const handleExportXlsx = () => {
    if (!empleados.length) {
      alert("No hay empleados para exportar.");
      return;
    }
    exportEmpleadosToXlsx(empleados, "empleados.xlsx");
  };

  const handleExportPdf = () => {
    if (!empleados.length) {
      alert("No hay empleados para exportar.");
      return;
    }
    exportEmpleadosToPdf(empleados, {
      titulo: "Listado de empleados",
      filtrosDescripcion,
      fileName: "empleados.pdf",
    });
  };

  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      {/* Filtros izquierda */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flex: 1 }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar por nombre, número..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Tooltip title="Mostrar solo empleados activos">
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={soloActivos}
                onChange={handleSoloActivosToggle}
              />
            }
            label="Solo activos"
          />
        </Tooltip>
      </Stack>

      {/* Acciones derecha */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ mt: { xs: 1, sm: 0 } }}
      >
        <Tooltip title="Exportar a Excel">
          <span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TableViewIcon />}
              onClick={handleExportXlsx}
              disabled={loading || empleados.length === 0}
            >
              Excel
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Exportar a PDF">
          <span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportPdf}
              disabled={loading || empleados.length === 0}
            >
              PDF
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Recargar lista">
          <span>
            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNuevo}
          disabled={!canCreate}
        >
          Nuevo empleado
        </Button>
      </Stack>
    </Box>
  );
};
