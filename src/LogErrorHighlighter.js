import React, { useState } from "react";
import { saveAs } from "file-saver";

function LogErrorHighlighter() {
  const [logs, setLogs] = useState([]);
  const [errors, setErrors] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const colors = ["#ffcccc", "#ffeb99", "#cce5ff", "#d9ccff"];

  const handleFileUpload = (event) => {
    setLoading(true); // Show spinner
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n");
      const parsedLogs = lines.map((line, index) => ({
        line,
        index,
        highlight: false,
        color: null,
      }));

      let errorSections = [];
      let colorIndex = 0;

      parsedLogs.forEach((log, i) => {
        if (log.line.includes("Error")) {
          const currentColor = colors[colorIndex % colors.length];

          // Highlight the error line and the next two lines with the current color
          log.highlight = true;
          log.color = currentColor;
          if (parsedLogs[i + 1]) {
            parsedLogs[i + 1].highlight = true;
            parsedLogs[i + 1].color = currentColor;
          }
          if (parsedLogs[i + 2]) {
            parsedLogs[i + 2].highlight = true;
            parsedLogs[i + 2].color = currentColor;
          }

          // Save the error section with the color
          errorSections.push([
            { ...log },
            parsedLogs[i + 1] ? { ...parsedLogs[i + 1] } : null,
            parsedLogs[i + 2] ? { ...parsedLogs[i + 2] } : null,
          ]);

          colorIndex++;
        }
      });

      setLogs(parsedLogs);
      setErrors(errorSections.filter(Boolean));
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
        section
          .filter(Boolean)
          .map((line) => `<div style="background-color: ${line.color}; padding: 5px;">${line.line}</div>`)
          .join("")
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

  const filteredLogs = filter === "Errors Only" ? logs.filter((log) => log.highlight) : logs;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <input type="file" onChange={handleFileUpload} style={styles.fileInput} />

      <label style={styles.label}>Filter Logs: </label>
      <select onChange={handleFilterChange} value={filter} style={styles.dropdown}>
        <option value="All">All</option>
        <option value="Errors Only">Errors Only</option>
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
