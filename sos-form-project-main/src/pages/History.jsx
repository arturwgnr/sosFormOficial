import { useEffect, useState } from "react";
import "../css/History.css";

export default function History() {
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    id: "",
    type: "paleteira",
    client: "",
    date: "",
    pdfFile: null,
  });

  // Carrega histórico salvo
  useEffect(() => {
    const saved = localStorage.getItem("reports");
    if (saved) {
      setReports(JSON.parse(saved));
    }
  }, []);

  // Salva no localStorage
  const saveReports = (data) => {
    localStorage.setItem("reports", JSON.stringify(data));
    setReports(data);
  };

  // Upload manual
  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!newReport.id || !newReport.client || !newReport.date || !newReport.pdfFile) {
      alert("⚠ Preencha todos os campos e envie um PDF.");
      return;
    }

    // Converte o PDF para base64
    const file = newReport.pdfFile;
    const reader = new FileReader();

    reader.onloadend = () => {
      const pdfUrl = reader.result;

      const report = {
        id: newReport.id,
        type: newReport.type,
        client: newReport.client,
        date: newReport.date,
        pdfUrl,
      };

      const updated = [...reports, report];
      saveReports(updated);

      // Reset do form
      setNewReport({ id: "", type: "paleteira", client: "", date: "", pdfFile: null });
      alert("✅ Documento adicionado ao histórico!");
    };

    reader.readAsDataURL(file);
  };

  const handleDownload = (url, id, type) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `Relatorio-${type}-${id}.pdf`;
    link.click();
  };

  return (
    <div className="history">
      <h1>Adicionar Relatórios</h1>

      {/* 🔥 Novo Formulário Manual */}
      <form className="manual-form" onSubmit={handleManualAdd}>
        <h2>Adicionar relatório manualmente</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="ID"
            value={newReport.id}
            onChange={(e) => setNewReport({ ...newReport, id: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Cliente"
            value={newReport.client}
            onChange={(e) => setNewReport({ ...newReport, client: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <select
            value={newReport.type}
            onChange={(e) =>
              setNewReport({ ...newReport, type: e.target.value })
            }
          >
            <option value="paleteira">Paleteira</option>
            <option value="empilhadeira">Empilhadeira</option>
          </select>

          <input
            type="date"
            value={newReport.date}
            onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
            required
          />
        </div>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setNewReport({ ...newReport, pdfFile: e.target.files ? e.target.files[0] : null })
          }
          required
        />

        <button type="submit">➕ Adicionar ao histórico</button>
      </form>

      

      {/* Mobile (cards) */}
      <div className="history-cards">
        {reports.map((report) => (
          <div key={report.id} className="history-card">
            <h3>{report.client}</h3>
            <p><strong>ID:</strong> {report.id}</p>
            <p><strong>Tipo:</strong> {report.type === "paleteira" ? "Paleteira" : "Empilhadeira"}</p>
            <p><strong>Data:</strong> {new Date(report.date).toLocaleDateString("pt-BR")}</p>
            <div className="history-actions">
              <button onClick={() => handleDownload(report.pdfUrl, report.id, report.type)}>⬇ Baixar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop (tabela) */}
      <table className="history-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.client}</td>
              <td>{report.type === "paleteira" ? "Paleteira" : "Empilhadeira"}</td>
              <td>{new Date(report.date).toLocaleDateString("pt-BR")}</td>
              <td>
                
                <button onClick={() => handleDownload(report.pdfUrl, report.id, report.type)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
