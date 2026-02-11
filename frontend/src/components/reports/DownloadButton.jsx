import { Download } from "lucide-react";

export function DownloadButton({ data, fileName, title = "Descargar" }) {
  const handleDownload = () => {
    if (!data || data.length === 0) {
      alert("No hay datos para descargar");
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            if (value === null || value === undefined) return "";
            const stringValue = String(value);
            if (stringValue.includes(",") || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(","),
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${fileName}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
      title={`Descargar ${title}`}
    >
      <Download size={16} />
      {title}
    </button>
  );
}
