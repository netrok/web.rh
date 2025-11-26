// src/types/jspdf-autotable.d.ts
declare module "jspdf-autotable" {
  import jsPDF from "jspdf";

  export interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    styles?: Record<string, any>;
    headStyles?: Record<string, any>;
    // por si usas más opciones del plugin:
    [key: string]: any;
  }

  const autoTable: (doc: jsPDF, options: AutoTableOptions) => jsPDF;

  export default autoTable;
}
