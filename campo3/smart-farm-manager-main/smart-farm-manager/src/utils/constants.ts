export const BASE_URL = "http://localhost:3000/api";

export const DEFAULT_PAGE_SIZE = 10;
export const TABLE_PAGE_OPTIONS = [5, 10, 20, 50, 100];

// Field constants
export const FIELD_LOCATIONS = [
  { label: "Iași", value: "Iasi" },
  { label: "Suceava", value: "Suceava" },
  { label: "Botoșani", value: "Botosani" },
  { label: "Neamț", value: "Neamt" },
  { label: "Vaslui", value: "Vaslui" },
  { label: "Bacău", value: "Bacau" },
];
export const SOIL_TYPES = [
  { label: "Sandy", value: "Sandy" },
  { label: "Clay", value: "Clay" },
  { label: "Silt", value: "Silt" },
  { label: "Peat", value: "Peat" },
  { label: "Chalk", value: "Chalk" },
  { label: "Loam", value: "Loam" },
];

// Analytics colors
export const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// -------------------------------
//  NiVO Dark Theme
// -------------------------------
export const NIVO_THEME_DARK = {
  background: "#111827", // gray-900
  textColor: "#f3f4f6", // gray-100
  fontSize: 12,
  axis: {
    domain: {
      line: {
        stroke: "#555",
      },
    },
    ticks: {
      line: {
        stroke: "#777",
        strokeWidth: 1,
      },
      text: {
        fill: "#ddd",
      },
    },
    legend: {
      text: {
        fill: "#ddd",
      },
    },
  },
  grid: {
    line: {
      stroke: "#333",
      strokeWidth: 1,
    },
  },
  legends: {
    text: {
      fill: "#ddd",
    },
  },
  tooltip: {
    container: {
      background: "#1f2937", // gray-800
      color: "#f3f4f6",
      fontSize: 12,
      borderRadius: 6,
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      border: "1px solid #374151", // gray-700
    },
  },
  labels: {
    text: {
      fill: "#f3f4f6",
    },
  },
};

// -------------------------------
//  NiVO Light Theme
// -------------------------------
export const NIVO_THEME_LIGHT = {
  background: "#ffffff",
  textColor: "#111827", // gray-900
  fontSize: 12,
  axis: {
    domain: {
      line: {
        stroke: "#ccc",
      },
    },
    ticks: {
      line: {
        stroke: "#ddd",
        strokeWidth: 1,
      },
      text: {
        fill: "#555",
      },
    },
    legend: {
      text: {
        fill: "#444",
      },
    },
  },
  grid: {
    line: {
      stroke: "#e5e7eb", // gray-200
      strokeWidth: 1,
    },
  },
  legends: {
    text: {
      fill: "#444",
    },
  },
  tooltip: {
    container: {
      background: "#ffffff",
      color: "#111827",
      fontSize: 12,
      borderRadius: 6,
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      border: "1px solid #e5e7eb",
    },
  },
  labels: {
    text: {
      fill: "#111827",
    },
  },
};
