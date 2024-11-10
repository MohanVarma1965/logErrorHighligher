import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { AutoSizer, List } from "react-virtualized";

function LogErrorHighlighter() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const colors = {
    error: "#ffcccc", // Light red for errors
    warning: "#ffeb99", // Light orange for warnings
  };

  // Apply gradient background to the body
  useEffect(() => {
    document.body.style.background = "linear-gradient(rgb(243 213 224), rgb(253, 253, 253))";

    // Cleanup to reset body background when the component unmounts
    return () => {
      document.body.style.background = "";
    };
  }, []);

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

  // Filter logs based on filter selection and search term
  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Errors Only" && log.highlight && log.color === colors.error) ||
      (filter === "Warnings Only" && log.highlight && log.color === colors.warning) ||
      (filter === "Errors and Warnings" &&
        log.highlight &&
        (log.color === colors.error || log.color === colors.warning));

    const matchesSearch = log.line.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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
        color: "#333",
      }}
    >
      {filteredLogs[index].line}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Log Error Highlighter</h1>
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

      <div style={styles.filterSearchContainer}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Filter Logs:</label>
          <select onChange={(e) => setFilter(e.target.value)} value={filter} style={styles.dropdown}>
            <option value="All">All</option>
            <option value="Errors Only">Errors Only</option>
            <option value="Warnings Only">Warnings Only</option>
            <option value="Errors and Warnings">Errors and Warnings</option>
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Search:</label>
          <input
            type="text"
            placeholder="Search logs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {loading && <div style={styles.spinner}>🔄 Processing...</div>}

      <div style={styles.logPreview}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              rowCount={filteredLogs.length}
              rowHeight={getRowHeight}
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
    background: "linear-gradient(rgb(182, 185, 221), rgb(253, 253, 253))",
    textAlign: "center",
    padding: "10px",
    minHeight: "95vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    overflowY: "auto",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  fileInput: {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.3s",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
  },
  label: {
    fontWeight: "bold",
    fontSize: "16px",
    marginRight: "8px",
  },
  filterSearchContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "30px",
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  dropdown: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.3s",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  searchInput: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "200px",
    transition: "box-shadow 0.3s",
    backgroundColor: "#fff",
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
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s, transform 0.2s",
    flex: "1 1 200px",
  },
  buttonPrimary: {
    backgroundColor: "#4CAF50",
  },
  buttonError: {
    backgroundColor: "#FF5733",
  },
  buttonWarning: {
    backgroundColor: "#FFC300",
  },
  buttonBoth: {
    backgroundColor: "#8E44AD",
  },
  logPreview: {
    flexGrow: 1,
    width: "95%",
    padding: "10px",
    border: "2px dotted green",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
};

export default LogErrorHighlighter;
