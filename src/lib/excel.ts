import * as XLSX from "xlsx";

export interface SheetDef {
  name: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
}

export function buildWorkbook(sheets: SheetDef[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);

    // Auto-width columns based on max content length
    const colWidths = sheet.headers.map((h, i) => {
      const maxData = sheet.rows.reduce((max, row) => {
        const cell = String(row[i] ?? "");
        return Math.max(max, cell.length);
      }, 0);
      return { wch: Math.max(h.length, maxData) + 2 };
    });
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  return wb;
}

export function workbookToBuffer(wb: XLSX.WorkBook): Buffer {
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function xlsxResponse(wb: XLSX.WorkBook, filename: string): Response {
  const buffer = workbookToBuffer(wb);
  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
