// src/components/EmpleadosStats.tsx
import React from "react";
import { Stack, Chip } from "@mui/material";

interface EmpleadosStatsProps {
  total: number;
  activos: number;
  inactivos: number;
}

export const EmpleadosStats: React.FC<EmpleadosStatsProps> = ({
  total,
  activos,
  inactivos,
}) => {
  if (total === 0) return null;

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
      <Chip label={`En página: ${total}`} variant="outlined" color="info" />
      <Chip label={`Activos: ${activos}`} variant="outlined" color="success" />
      <Chip
        label={`Inactivos: ${inactivos}`}
        variant="outlined"
        color={inactivos > 0 ? "warning" : "default"}
      />
    </Stack>
  );
};
