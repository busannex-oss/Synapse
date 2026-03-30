
import { Lead } from "../types";

/**
 * Converts lead data into a formatted CSV string for professional spreadsheet use.
 */
export const generateCSV = (leads: Lead[]): string => {
  const headers = [
    "Node Name",
    "Industry",
    "Contact Phone",
    "Active Stage",
    "Potency Score",
    "Grounding Rating",
    "Signal Count",
    "Digital Status",
    "Vaulted Yield",
    "Fulfillment Status",
    "Completion Timestamp"
  ];

  const rows = leads.map(lead => [
    `"${lead.name.replace(/"/g, '""')}"`,
    lead.industry,
    lead.phone,
    lead.queue,
    `${lead.readinessScore}%`,
    lead.rating,
    lead.reviewCount,
    lead.status,
    lead.revenuePerLead || 0,
    lead.fulfillmentOutcome || "N/A",
    lead.completedAt || "Active"
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
};

/**
 * Triggers a browser download for the generated report.
 */
export const downloadReport = (leads: Lead[], filenameSuffix: string = "SNAPSHOT") => {
  const csvContent = generateCSV(leads);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `SYNAPSE_INTEL_${filenameSuffix}_${timestamp}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
