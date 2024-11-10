import React, { useState } from "react";
import { saveAs } from "file-saver";
import { AutoSizer, List } from "react-virtualized"; // For auto-sizing rows

function LogErrorHighlighter() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  const colors = {
    error: "#ffcccc", // Light red for errors
    warning: "#ffeb99", // Light orange for warnings
  };

  const handleFileUpload = (event) => {
    setLoading(true);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n");

      const parsedLogs = lines.map((line, index) => ({
        line,
        index,
        highlight: line.includes("Error") || line.includes("Warning"),
        color: line.includes("Error") ? colors.error : line.includes("Warning") ? colors.warning : null,
      }));

      setLogs(parsedLogs);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const downloadFile = (filteredLogs, filename) => {
    const fileContent = filteredLogs
      .map((log) => {
        if (log.highlight) {
          return `<div style="background-color: ${log.color}; padding: 5px;">${log.line}</div>`;
        }
        return `<div>${log.line}</div>`;
      })
      .join("");

    const blob = new Blob([`<html><body>${fileContent}</body></html>`], {
      type: "text/html;charset=utf-8",
    });
    saveAs(blob, filename);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "All") return true;
    if (filter === "Errors Only") return log.highlight && log.color === colors.error;
    if (filter === "Warnings Only") return log.highlight && log.color === colors.warning;
    if (filter === "Errors and Warnings")
      return log.highlight && (log.color === colors.error || log.color === colors.warning);
    return false;
  });

  // Calculate row height dynamically based on content
  const getRowHeight = ({ index }) => {
    const lineLength = filteredLogs[index].line.length;
    return Math.max(40, Math.ceil(lineLength / 100) * 20); // Adjust height based on line length
  };

  const Row = ({ index, style }) => (
    <div
      style={{
        ...style,
        backgroundColor: filteredLogs[index].highlight ? filteredLogs[index].color : "transparent",
        padding: "10px",
        borderRadius: "5px",
        boxSizing: "border-box",
      }}
    >
      {filteredLogs[index].line}
    </div>
  );

  return (
    <div style={styles.container}>
      <input type="file" onChange={handleFileUpload} style={styles.fileInput} />

      <div style={styles.controls}>
        <button
          onClick={() => downloadFile(filteredLogs, "highlighted_log.html")}
          style={{ ...styles.button, ...styles.buttonPrimary }}
        >
          Download Highlighted Log (HTML)
        </button>
        <button
          onClick={() =>
            downloadFile(
              logs.filter((log) => log.color === colors.error),
              "errors_only.html"
            )
          }
          style={{ ...styles.button, ...styles.buttonError }}
        >
          Download Errors Only
        </button>
        <button
          onClick={() =>
            downloadFile(
              logs.filter((log) => log.color === colors.warning),
              "warnings_only.html"
            )
          }
          style={{ ...styles.button, ...styles.buttonWarning }}
        >
          Download Warnings Only
        </button>
        <button
          onClick={() =>
            downloadFile(
              logs.filter((log) => log.color),
              "errors_and_warnings.html"
            )
          }
          style={{ ...styles.button, ...styles.buttonBoth }}
        >
          Download Errors & Warnings
        </button>
      </div>

      <div style={styles.filterContainer}>
        <label style={styles.label}>Filter Logs:</label>
        <select onChange={(e) => setFilter(e.target.value)} value={filter} style={styles.dropdown}>
          <option value="All">All</option>
          <option value="Errors Only">Errors Only</option>
          <option value="Warnings Only">Warnings Only</option>
          <option value="Errors and Warnings">Errors and Warnings</option>
        </select>
      </div>

      {loading && <div style={styles.spinner}>🔄 Processing...</div>}

      <div style={styles.logPreview}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              rowCount={filteredLogs.length}
              rowHeight={getRowHeight} // Dynamic height for each row
              rowRenderer={({ index, key, style }) => <Row key={key} index={index} style={style} />}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(to left, rgb(231 231 231), rgb(143 191 251))",
    textAlign: "center",
    padding: "20px",
    minHeight: "95vh", // Full viewport height
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    overflowY: "auto", // Use only one scrollbar for the page
  },
  fileInput: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  controls: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px", // Space between buttons
  },
  label: {
    fontWeight: "bold",
  },
  filterContainer: {
    marginBottom: "20px",
  },
  dropdown: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  spinner: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonPrimary: {
    backgroundColor: "#4CAF50", // Green color for primary button
  },
  buttonError: {
    backgroundColor: "#FF5733", // Red color for errors button
  },
  buttonWarning: {
    backgroundColor: "#FFC300", // Yellow color for warnings button
  },
  buttonBoth: {
    backgroundColor: "#8E44AD", // Purple color for errors & warnings button
  },
  logPreview: {
    flexGrow: 1,
    width: "95%",
    padding: "20px",
    border: "2px dotted green",
  },
};

export default LogErrorHighlighter;
