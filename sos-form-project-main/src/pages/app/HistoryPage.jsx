import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import DeleteReportsModal from "./DeleteReportsModal";
import { reportsApi } from "../../api/reports";
import { useAuth } from "../../context/useAuth";
import { generatePalletReportPDF } from "../../utils/pdfGenerator";
import { generateForkliftReportPDF } from "../../utils/pdfForkliftGenerator";
import { REPORT_TYPE_LABEL, formatDateTime } from "../../utils/reportLabels";
import "./admin/AdminPages.css";
import "./HistoryPage.css";

const PAGE_SIZE = 15;

function downloadPdf(pdfUrl, id, type) {
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = `Relatorio-${type === "PALLET" ? "paleteira" : "empilhadeira"}-${id}.pdf`;
  link.click();
}

export default function HistoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [reports, setReports] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: "", type: "", from: "", to: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  // Modo "excluir" (só admin; o backend confere tudo de novo): mostra a
  // seleção nas linhas. `selected` guarda a linha inteira por ID, pra
  // seleção sobreviver à troca de página e o modal ter cliente e data.
  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState({});
  const [toDelete, setToDelete] = useState([]);

  useEffect(() => {
    let active = true;
    setReports(null);

    reportsApi
      .list({ ...filters, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!active) return;
        // Página ficou vazia (ex: excluiu tudo da última): volta uma.
        if (res.reports.length === 0 && page > 1) {
          setPage((p) => p - 1);
          return;
        }
        setReports(res.reports);
        setTotal(res.total);
      })
      .catch(() => active && setError("Não foi possível carregar o histórico."));

    return () => {
      active = false;
    };
  }, [filters, page, reloadKey]);

  function updateFilter(key, value) {
    setPage(1);
    setSelected({});
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDeleteMode() {
    setDeleteMode((v) => !v);
    setSelected({});
  }

  function toggleRow(row) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[row.id]) delete next[row.id];
      else next[row.id] = row;
      return next;
    });
  }

  const pageAllSelected = Boolean(reports?.length) && reports.every((r) => selected[r.id]);
  const pageSomeSelected = Boolean(reports?.some((r) => selected[r.id]));

  function togglePage() {
    setSelected((prev) => {
      const next = { ...prev };
      reports.forEach((r) => {
        if (pageAllSelected) delete next[r.id];
        else next[r.id] = r;
      });
      return next;
    });
  }

  function handleDeleted(ids) {
    setSelected((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    setToDelete([]);
    setReloadKey((k) => k + 1);
  }

  async function handleDownload(row) {
    setDownloadingId(row.id);
    try {
      const { report } = await reportsApi.get(row.id);
      const payload = { id: report.publicId, ...report.data, clientSignature: report.clientSignature, sosSignature: report.sosSignature };

      const pdfUrl =
        report.type === "PALLET" ? await generatePalletReportPDF(payload) : await generateForkliftReportPDF(payload);

      downloadPdf(pdfUrl, report.publicId, report.type);
    } catch {
      setError("Não foi possível gerar o PDF desse relatório.");
    } finally {
      setDownloadingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const selectedRows = Object.values(selected);
  const selectedCount = selectedRows.length;

  return (
    <div>
      <PageHeader title="Histórico" subtitle={`${total} relatório${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`} />

      <div className="card card--padded history-filters">
        <div className="history-filters__search">
          <span className="material-symbols-outlined" aria-hidden="true">
            search
          </span>
          <input
            type="search"
            placeholder="Buscar por cliente ou ID (ex: PAL-0001)"
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
          />
        </div>
        <div className="history-filters__bar">
          <div className="history-filters__row">
            <select value={filters.type} onChange={(e) => updateFilter("type", e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="PALLET">Paleteira</option>
              <option value="FORKLIFT">Empilhadeira</option>
            </select>
            <input type="date" value={filters.from} onChange={(e) => updateFilter("from", e.target.value)} />
            <span className="history-filters__to-label">até</span>
            <input type="date" value={filters.to} onChange={(e) => updateFilter("to", e.target.value)} />
          </div>

          {isAdmin && (
            <div
              className={`admin-actions history-admin-actions ${deleteMode ? "is-armed" : ""}`}
              role="group"
              aria-label="Ações administrativas"
            >
              <span className="admin-actions__label">
                <span className="material-symbols-outlined" aria-hidden="true">
                  shield_lock
                </span>
                Ações administrativas
              </span>
              <Button
                variant={deleteMode ? "danger" : "subtle"}
                size="sm"
                icon={deleteMode ? "close" : "delete"}
                onClick={toggleDeleteMode}
                aria-pressed={deleteMode}
              >
                {deleteMode ? "Cancelar exclusão" : "Excluir relatórios"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {deleteMode && (
        <div className="history-selection" role="status">
          <span className="history-selection__count">
            <span className="material-symbols-outlined" aria-hidden="true">
              {selectedCount ? "check_box" : "info"}
            </span>
            {selectedCount === 0
              ? "Selecione na lista os relatórios a excluir. A seleção vale entre páginas."
              : `${selectedCount} relatório${selectedCount === 1 ? "" : "s"} selecionado${selectedCount === 1 ? "" : "s"}`}
          </span>
          {selectedCount > 0 && (
            <div className="history-selection__actions">
              <Button variant="ghost" size="sm" onClick={() => setSelected({})}>
                Limpar seleção
              </Button>
              <Button variant="danger" size="sm" icon="delete" onClick={() => setToDelete(selectedRows)}>
                Excluir selecionados
              </Button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: "var(--color-error)", marginTop: "var(--space-4)", fontSize: "var(--text-sm)" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: "var(--space-6)" }}>
        {reports === null ? (
          <div style={{ padding: "var(--space-16)", textAlign: "center" }}>
            <Spinner size={28} />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="Nenhum relatório encontrado"
            description="Tente ajustar a busca ou os filtros."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className={`table ${deleteMode ? "history-table--selecting" : ""}`}>
                <thead>
                  <tr>
                    {deleteMode && (
                      <th className="history-check">
                        <input
                          type="checkbox"
                          checked={pageAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = pageSomeSelected && !pageAllSelected;
                          }}
                          onChange={togglePage}
                          aria-label="Selecionar todos desta página"
                        />
                      </th>
                    )}
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th style={{ textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className={selected[r.id] ? "is-selected" : undefined}>
                      {deleteMode && (
                        <td className="history-check">
                          <input
                            type="checkbox"
                            checked={Boolean(selected[r.id])}
                            onChange={() => toggleRow(r)}
                            aria-label={`Selecionar ${r.publicId}`}
                          />
                        </td>
                      )}
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{r.publicId}</td>
                      <td>{r.data?.client || "-"}</td>
                      <td>
                        <Badge tone={r.type === "PALLET" ? "primary" : "accent"}>{REPORT_TYPE_LABEL[r.type]}</Badge>
                      </td>
                      <td>{formatDateTime(r.createdAt)}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="history-row-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="download"
                            loading={downloadingId === r.id}
                            onClick={() => handleDownload(r)}
                          >
                            PDF
                          </Button>
                          {deleteMode && (
                            <Button
                              variant="danger"
                              size="sm"
                              icon="delete"
                              onClick={() => setToDelete([r])}
                              aria-label={`Excluir ${r.publicId}`}
                            >
                              Excluir
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="history-pagination">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="chevron_left"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_right
                  </span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {isAdmin && (
        <DeleteReportsModal reports={toDelete} onClose={() => setToDelete([])} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
