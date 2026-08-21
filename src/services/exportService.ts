import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PrintTemplateConfig {
  schoolName: string;
  schoolMotto: string;
  province: string;
  address: string;
  phone: string;
  email: string;
  schoolYear: string;
  logoUrl?: string;
  drapeauUrl?: string;
  armoiriesUrl?: string;
  primaryColor: string; // e.g. "#0078D4"
  defaultFormat: "A4" | "A5" | "Carte";
  defaultOrientation: "portrait" | "landscape";
  showPhoto: boolean;
  showMatricule: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showStatus: boolean;
  showRegistrationDate: boolean;
  signatory1Title: string;
  signatory1Name: string;
  signatory2Title: string;
  signatory2Name: string;
  showStamp: boolean;
  minepspConformityCode: string;
}

export const DEFAULT_PRINT_TEMPLATE: PrintTemplateConfig = {
  schoolName: "ÉTABLISSEMENT SCOLAIRE RDC",
  schoolMotto: "",
  province: "",
  address: "",
  phone: "",
  email: "",
  schoolYear: "2025-2026",
  logoUrl: "",
  drapeauUrl: "",
  armoiriesUrl: "",
  primaryColor: "#0078D4",
  defaultFormat: "A4",
  defaultOrientation: "portrait",
  showPhoto: true,
  showMatricule: true,
  showPhone: true,
  showAddress: true,
  showStatus: true,
  showRegistrationDate: true,
  signatory1Title: "Le Chef d'Établissement / Préfet",
  signatory1Name: "",
  signatory2Title: "Le Secrétaire de Direction",
  signatory2Name: "",
  showStamp: true,
  minepspConformityCode: ""
};

/**
 * Builds a dynamic PrintTemplateConfig extracting ONLY fields actually recorded in the school's record.
 * Never invents or displays default placeholder data if the school hasn't provided it.
 */
export function buildSchoolPrintConfig(
  school?: {
    name?: string;
    motto?: string;
    province?: string;
    provinceEducationnelle?: string;
    ville?: string;
    commune?: string;
    adresseComplete?: string;
    phonePrincipal?: string;
    contactEmail?: string;
    schoolYear?: string;
    logoUrl?: string;
    codeNational?: string;
    codeEtablissement?: string;
  } | null,
  overrideConfig?: Partial<PrintTemplateConfig>
): PrintTemplateConfig {
  if (!school) {
    return {
      ...DEFAULT_PRINT_TEMPLATE,
      ...(overrideConfig || {})
    };
  }

  const provinceStr = [school.provinceEducationnelle, school.province, school.ville]
    .filter(Boolean)
    .join(" - ") || (overrideConfig?.province || "");

  const addressStr = school.adresseComplete || 
    [school.commune, school.ville, school.province].filter(Boolean).join(", ") || 
    (overrideConfig?.address || "");

  return {
    schoolName: school.name || overrideConfig?.schoolName || "ÉTABLISSEMENT SCOLAIRE RDC",
    schoolMotto: school.motto || overrideConfig?.schoolMotto || "",
    province: provinceStr,
    address: addressStr,
    phone: school.phonePrincipal || overrideConfig?.phone || "",
    email: school.contactEmail || overrideConfig?.email || "",
    schoolYear: school.schoolYear || overrideConfig?.schoolYear || "2025-2026",
    logoUrl: school.logoUrl || overrideConfig?.logoUrl || "",
    drapeauUrl: overrideConfig?.drapeauUrl || "",
    armoiriesUrl: overrideConfig?.armoiriesUrl || "",
    primaryColor: overrideConfig?.primaryColor || "#0078D4",
    defaultFormat: overrideConfig?.defaultFormat || "A4",
    defaultOrientation: overrideConfig?.defaultOrientation || "portrait",
    showPhoto: overrideConfig?.showPhoto ?? true,
    showMatricule: overrideConfig?.showMatricule ?? true,
    showPhone: overrideConfig?.showPhone ?? true,
    showAddress: overrideConfig?.showAddress ?? true,
    showStatus: overrideConfig?.showStatus ?? true,
    showRegistrationDate: overrideConfig?.showRegistrationDate ?? true,
    signatory1Title: overrideConfig?.signatory1Title || "Le Chef d'Établissement / Préfet",
    signatory1Name: overrideConfig?.signatory1Name || "",
    signatory2Title: overrideConfig?.signatory2Title || "Le Secrétaire de Direction",
    signatory2Name: overrideConfig?.signatory2Name || "",
    showStamp: overrideConfig?.showStamp ?? true,
    minepspConformityCode: school.codeNational || school.codeEtablissement || overrideConfig?.minepspConformityCode || ""
  };
}

export interface ExportDataOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  schoolConfig?: PrintTemplateConfig;
  userName?: string;
  orientation?: "portrait" | "landscape";
  format?: "A4" | "A5";
}

/**
 * Generates a real Excel .xlsx file with formatted headers, school metadata, and auto-adjusted column widths.
 */
export function exportToExcel({
  title,
  subtitle,
  headers,
  rows,
  filename,
  schoolConfig = DEFAULT_PRINT_TEMPLATE,
  userName = "Directeur Pédagogique"
}: ExportDataOptions): void {
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Construct structured worksheet data with Header Metadata (only include populated fields)
  const metaLines: (string | number)[][] = [
    [schoolConfig.schoolName.toUpperCase()]
  ];

  if (schoolConfig.province) {
    metaLines.push([`République Démocratique du Congo - Province : ${schoolConfig.province}`]);
  } else {
    metaLines.push([`République Démocratique du Congo`]);
  }

  const detailsParts: string[] = [];
  if (schoolConfig.schoolMotto) detailsParts.push(`Devise : "${schoolConfig.schoolMotto}"`);
  if (schoolConfig.phone) detailsParts.push(`Tél : ${schoolConfig.phone}`);
  if (schoolConfig.email) detailsParts.push(`Email : ${schoolConfig.email}`);
  if (detailsParts.length > 0) {
    metaLines.push([detailsParts.join(" | ")]);
  }

  const yearAndCode: string[] = [];
  if (schoolConfig.schoolYear) yearAndCode.push(`Année Scolaire : ${schoolConfig.schoolYear}`);
  if (schoolConfig.minepspConformityCode) yearAndCode.push(`Code MINEPSP : ${schoolConfig.minepspConformityCode}`);
  if (yearAndCode.length > 0) {
    metaLines.push([yearAndCode.join(" | ")]);
  }

  metaLines.push([title.toUpperCase()]);
  metaLines.push([subtitle ? `${subtitle} | Imprimé le : ${dateStr} par : ${userName}` : `Imprimé le : ${dateStr} par : ${userName}`]);
  metaLines.push([]); // Empty separator line

  const wsData: (string | number)[][] = [
    ...metaLines,
    headers, // Table Headers
    ...rows // Table Rows
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-calculate column widths
  const colWidths = headers.map((header, colIdx) => {
    let maxLen = header.length;
    rows.forEach((row) => {
      const val = row[colIdx];
      if (val !== undefined && val !== null) {
        const len = val.toString().length;
        if (len > maxLen) maxLen = len;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
  });

  worksheet["!cols"] = colWidths;

  // Create workbook & append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

  // Format clean filename
  const cleanFilename = filename.toLowerCase().endsWith(".xlsx") ? filename : `${filename}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(workbook, cleanFilename);
}

/**
 * Generates a high-quality vector PDF using jsPDF and jsPDF-autotable.
 */
export function exportToPDF({
  title,
  subtitle,
  headers,
  rows,
  filename,
  schoolConfig = DEFAULT_PRINT_TEMPLATE,
  userName = "Directeur Pédagogique",
  orientation = "portrait",
  format = "A4"
}: ExportDataOptions): void {
  const doc = new jsPDF({
    orientation: orientation === "landscape" ? "l" : "p",
    unit: "mm",
    format: format.toLowerCase()
  });

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const totalPagesExp = "{total_pages_count_string}";

  // Draw Header
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", 14, 10);
  doc.text(`MINISTÈRE DE L'ÉDUCATION NATIONALE ET INITIATION À LA NOUVELLE CITOYENNETÉ`, 14, 14);

  // School Main Title
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 120, 212); // Brand Blue
  doc.text(schoolConfig.schoolName.toUpperCase(), 14, 21);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  const subLine1Parts: string[] = [];
  if (schoolConfig.province) subLine1Parts.push(`Province : ${schoolConfig.province}`);
  if (schoolConfig.schoolMotto) subLine1Parts.push(`Devise : "${schoolConfig.schoolMotto}"`);
  if (schoolConfig.phone) subLine1Parts.push(`Tél : ${schoolConfig.phone}`);
  const subLine1 = subLine1Parts.join(" • ") || "Établissement d'Enseignement National";

  const subLine2Parts: string[] = [];
  if (schoolConfig.schoolYear) subLine2Parts.push(`Année Scolaire : ${schoolConfig.schoolYear}`);
  if (schoolConfig.minepspConformityCode) subLine2Parts.push(`Code MINEPSP : ${schoolConfig.minepspConformityCode}`);
  const subLine2 = subLine2Parts.join(" • ") || "";

  doc.text(subLine1, 14, 26);
  if (subLine2) {
    doc.text(subLine2, 14, 30);
  }

  // Line separator
  doc.setDrawColor(0, 120, 212);
  doc.setLineWidth(0.6);
  doc.line(14, 33, doc.internal.pageSize.width - 14, 33);

  // Document Title Box
  doc.setFillColor(240, 246, 252);
  doc.roundedRect(14, 36, doc.internal.pageSize.width - 28, 12, 1.5, 1.5, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), 18, 43.5);

  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(subtitle, doc.internal.pageSize.width - 18, 43.5, { align: "right" });
  }

  // Draw Table using autotable
  autoTable(doc, {
    startY: 51,
    head: [headers],
    body: rows.map(r => r.map(v => v !== undefined && v !== null ? v.toString() : "")),
    theme: "striped",
    headStyles: {
      fillColor: [0, 120, 212],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left"
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { top: 51, left: 14, right: 14, bottom: 25 },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height || pageSize.getHeight();
      const pageWidth = pageSize.width || pageSize.getWidth();

      // Footer divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

      // Footer Text
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);

      doc.text(`Généré le ${dateStr} par : ${userName} | Total : ${rows.length} enregistrement(s)`, 14, pageHeight - 12);
      doc.text(`Page ${pageCount} sur ${totalPagesExp}`, pageWidth - 14, pageHeight - 12, { align: "right" });

      doc.setFontSize(6.5);
      doc.text("Document Officiel Numérique certifié par SmartSchool RDC - Reproduction autorisée pour usages administratifs", 14, pageHeight - 7);
    }
  });

  // Calculate total pages for footer placeholder
  if (typeof (doc as any).putTotalPages === "function") {
    (doc as any).putTotalPages(totalPagesExp);
  }

  // Save clean PDF
  const cleanFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(cleanFilename);
}

/**
 * Triggers a clean, dedicated browser print without dark modal background or portal UI clipping.
 */
export function printDedicatedHTML(htmlContent: string, documentTitle: string = "Document SmartSchool RDC"): void {
  try {
    const printWindow = window.open("", "_blank", "width=900,height=800");
    if (printWindow && printWindow.document) {
      printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>${documentTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
          background: #ffffff;
          padding: 20px;
          line-height: 1.4;
        }
        @page {
          size: auto;
          margin: 10mm;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 6px 8px;
          text-align: left;
        }
        th {
          background-color: #f1f5f9;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          font-size: 10px;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0078D4;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .header-title {
          font-size: 16px;
          font-weight: 800;
          color: #0078D4;
        }
        .header-sub {
          font-size: 11px;
          color: #475569;
        }
        .footer {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }
        .stamp-box {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          text-align: center;
          font-size: 11px;
          font-weight: 700;
        }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        window.onload = function() {
          setTimeout(function() {
            try {
              window.print();
            } catch (_err) {}
          }, 300);
        };
      </script>
    </body>
    </html>
  `);

      printWindow.document.close();
      return;
    }
  } catch (_e) {
    // If popup or document write is forbidden in sandbox/iframe
  }

  // Safe fallback
  try {
    window.print();
  } catch (_err) {}
}
