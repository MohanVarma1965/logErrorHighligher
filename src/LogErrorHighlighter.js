import React, { useState, useEffect, useCallback } from "react";
import { saveAs } from "file-saver";
import { FixedSizeList as List } from "react-window"; // For virtualized rendering

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
    const stream = file.stream();
    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let parsedLogs = [];

    function processChunk({ done, value }) {
      if (done) {
        setLogs(parsedLogs);
        setLoading(false);
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split("\n");

      buffer = lines.pop(); // Keep the last, possibly incomplete line in the buffer

      parsedLogs = [
        ...parsedLogs,
        ...lines.map((line, index) => ({
          line,
          index,
          highlight: line.includes("Error") || line.includes("Warning"),
          color: line.includes("Error") ? colors.error : line.includes("Warning") ? colors.warning : null,
        })),
      ];

      reader.read().then(processChunk);
    }

    reader.read().then(processChunk);
  };

  const downloadHighlightedFile = () => {
    const highlightedText = logs
      .map((log) => {
        if (log.highlight) {
          return `<div style="background-color: ${log.color}; padding: 5px;">${log.line}</div>`;
        }
        return `<div>${log.line}</div>`;
      })
      .join("");

    const blob = new Blob([`<html><body>${highlightedText}</body></html>`], {
      type: "text/html;charset=utf-8",
    });
    saveAs(blob, "highlighted_log.html");
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "All") return true;
    if (filter === "Errors Only") return log.highlight && log.color === colors.error;
    if (filter === "Warnings Only") return log.highlight && log.color === colors.warning;
    return false;
  });

  const Row = ({ index, style }) => (
    <div
      style={{
        ...style,
        backgroundColor: filteredLogs[index].highlight ? filteredLogs[index].color : "transparent",
        padding: "5px",
        borderRadius: "5px",
        margin: "5px 0",
      }}
    >
      {filteredLogs[index].line}
    </div>
  );

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <input type="file" onChange={handleFileUpload} style={styles.fileInput} />

      <label style={styles.label}>Filter Logs: </label>
      <select onChange={(e) => setFilter(e.target.value)} value={filter} style={styles.dropdown}>
        <option value="All">All</option>
        <option value="Errors Only">Errors Only</option>
        <option value="Warnings Only">Warnings Only</option>
      </select>

      <button onClick={downloadHighlightedFile} style={{ ...styles.button, ...styles.buttonPrimary }}>
        Download Highlighted Log (HTML)
      </button>

      {loading && <div style={styles.spinner}>🔄 Processing...</div>}

      <div style={{ margin: "20px 0", height: "400px", width: "100%" }}>
        <h3>Log Preview:</h3>
        <List
          height={400}
          itemCount={filteredLogs.length}
          itemSize={35} // Height of each row
          width={"100%"}
        >
          {Row}
        </List>
      </div>
    </div>
  );
}

const styles = {
  fileInput: {
    marginBottom: "20px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  label: {
    marginRight: "10px",
    fontWeight: "bold",
  },
  dropdown: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    marginBottom: "20px",
  },
  spinner: {
    margin: "20px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#555",
  },
  button: {
    margin: "10px",
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
  buttonSecondary: {
    backgroundColor: "#FF5733", // Orange color for secondary button
  },
};

export default LogErrorHighlighter;
