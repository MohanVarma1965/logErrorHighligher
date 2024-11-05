import React, { useState } from "react";
import { saveAs } from "file-saver";

function LogErrorHighlighter() {
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const colors = {
    error: "#ffcccc", // Light red for errors
    warning: "#ffeb99", // Light orange for warnings
  };

  const handleFileUpload = (event) => {
    setLoading(true); // Show spinner
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n");
      const parsedLogs = lines.map((line, index) => {
        let highlight = false;
        let color = null;

        if (line.includes("Error")) {
          highlight = true;
          color = colors.error;
        } else if (line.includes("Warning")) {
          highlight = true;
          color = colors.warning;
        }

        return {
          line,
          index,
          highlight,
          color,
        };
      });

      // Separate error sections for downloadErrorsWithColors functionality
      const errorSections = parsedLogs.reduce((sections, log, i, arr) => {
        if (log.highlight && (log.color === colors.error || log.color === colors.warning)) {
          sections.push([log, arr[i + 1] || null, arr[i + 2] || null].filter(Boolean));
        }
        return sections;
      }, []);

      setLogs(parsedLogs);
      setErrors(errorSections);
      setLoading(false); // Hide spinner
    };
    reader.readAsText(file);
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

  const downloadErrorsWithColors = () => {
    const errorText = errors
      .map((section) =>
        section.map((line) => `<div style="background-color: ${line.color}; padding: 5px;">${line.line}</div>`).join("")
      )
      .join("<br /><br />");

    const blob = new Blob([`<html><body>${errorText}</body></html>`], {
      type: "text/html;charset=utf-8",
    });
    saveAs(blob, "colored_errors.html");
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Filter logic based on the selected filter option
  const filteredLogs = logs.filter((log) => {
    if (filter === "All") return true;
    if (filter === "Errors Only") return log.highlight && log.color === colors.error;
    if (filter === "Warnings Only") return log.highlight && log.color === colors.warning;
    if (filter === "Errors and Warnings")
      return log.highlight && (log.color === colors.error || log.color === colors.warning);
    return true;
  });

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <input type="file" onChange={handleFileUpload} style={styles.fileInput} />

      <label style={styles.label}>Filter Logs: </label>
      <select onChange={handleFilterChange} value={filter} style={styles.dropdown}>
        <option value="All">All</option>
        <option value="Errors Only">Errors Only</option>
        <option value="Warnings Only">Warnings Only</option>
        <option value="Errors and Warnings">Errors and Warnings</option>
      </select>

      <div />
      <button onClick={downloadHighlightedFile} style={styles.button}>
        Download Highlighted Log (HTML)
      </button>
      <div />
      <button onClick={downloadErrorsWithColors} style={styles.button}>
        Download Errors with Colors (HTML)
      </button>

      {loading && <div style={styles.spinner}>🔄 Processing...</div>}

      <div>
        <h3>Log Preview:</h3>
        {filteredLogs.map((log) => (
          <pre
            key={log.index}
            style={{
              backgroundColor: log.highlight ? log.color : "transparent",
              padding: "5px",
              borderRadius: "5px",
              margin: "5px 0",
            }}
          >
            {log.line}
          </pre>
        ))}
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
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default LogErrorHighlighter;
