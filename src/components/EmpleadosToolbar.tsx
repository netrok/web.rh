// src/components/EmpleadosToolbar.tsx
import React from "react";
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Menu,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { Add as AddIcon } from "@mui/icons-material";

type ActivoFilter = "todos" | "activos" | "inactivos";

interface EmpleadosToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  activoFilter: ActivoFilter;
  onActivoFilterChange: (value: ActivoFilter) => void;
  onNuevo: () => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
  onExportPdf: () => void;
}

export const EmpleadosToolbar: React.FC<EmpleadosToolbarProps> = ({
  search,
  onSearchChange,
  onSearchSubmit,
  activoFilter,
  onActivoFilterChange,
  onNuevo,
  onExportCsv,
  onExportXlsx,
  onExportPdf,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(anchorEl);

  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  const handleActivoChange = (event: SelectChangeEvent<ActivoFilter>) => {
    const value = event.target.value as ActivoFilter;
    onActivoFilterChange(value);
  };

  const handleOpenExportMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setAnchorEl(null);
  };

  const handleExportCsvClick = () => {
    handleCloseExportMenu();
    onExportCsv();
  };

  const handleExportXlsxClick = () => {
    handleCloseExportMenu();
    onExportXlsx();
  };

  const handleExportPdfClick = () => {
    handleCloseExportMenu();
    onExportPdf();
  };

  return (
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
        onChange={(e) => onSearchChange(e.target.value)}
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

      <Button variant="outlined" onClick={onSearchSubmit}>
        Buscar
      </Button>

      <Button variant="outlined" onClick={handleOpenExportMenu}>
        Exportar
      </Button>
      <Menu anchorEl={anchorEl} open={exportMenuOpen} onClose={handleCloseExportMenu}>
        <MenuItem onClick={handleExportCsvClick}>Exportar CSV</MenuItem>
        <MenuItem onClick={handleExportXlsxClick}>Exportar XLSX</MenuItem>
        <MenuItem onClick={handleExportPdfClick}>Exportar PDF</MenuItem>
      </Menu>

      <Button variant="contained" startIcon={<AddIcon />} onClick={onNuevo}>
        Nuevo empleado
      </Button>
    </Stack>
  );
};
