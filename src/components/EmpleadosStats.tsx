// src/components/EmpleadosStats.tsx
import React from "react";
import { Stack, Card, CardContent, Typography } from "@mui/material";

export interface EmpleadosStatsProps {
  total: number;
  activos: number;
  inactivos: number;
}

export const EmpleadosStats: React.FC<EmpleadosStatsProps> = ({
  total,
  activos,
  inactivos,
}) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: "stretch" }}
    >
      <Card elevation={2} sx={{ flex: 1, minWidth: 0 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Total empleados
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {total}
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ flex: 1, minWidth: 0 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Activos
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {activos}
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ flex: 1, minWidth: 0 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Inactivos
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {inactivos}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};
