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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";

export interface EmpleadosToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  soloActivos: boolean;
  onSoloActivosChange: (value: boolean) => void;
  onNuevo: () => void;
  onRefresh: () => void;
}

export const EmpleadosToolbar: React.FC<EmpleadosToolbarProps> = ({
  search,
  onSearchChange,
  soloActivos,
  onSoloActivosChange,
  onNuevo,
  onRefresh,
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
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
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

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Tooltip title="Recargar lista">
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNuevo}
        >
          Nuevo empleado
        </Button>
      </Stack>
    </Box>
  );
};
