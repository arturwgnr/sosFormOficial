import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import SignaturePad from "../../components/SignaturePad";
import { reportsApi } from "../../api/reports";
import { ApiError } from "../../api/client";
import { generateForkliftReportPDF } from "../../utils/pdfForkliftGenerator";
import { serviceTotal, tripRoundTrip } from "../../utils/timeCalc";
import "./ReportForm.css";

// Totais são sempre recalculados a partir dos horários (nunca digitados),
// e gravados junto nos dados do relatório.
function withComputedTotals(services, trips) {
  return {
    services: services.map((s) => ({ ...s, total: serviceTotal(s) })),
    trips: trips.map((t) => {
      const calc = tripRoundTrip(t);
      return { ...t, hours: calc.oneWayHours, total: calc.text };
    }),
  };
}

function TotalCell({ value, label, note }) {
  return (
    <div className="report-form__cell">
      <span className="report-form__cell-label">{label}</span>
      <output className={`report-form__total ${value ? "" : "is-empty"}`} aria-live="polite">
        {value || "--"}
      </output>
      {note && <span className="report-form__cell-note">{note}</span>}
    </div>
  );
}

const initialFormData = {
  client: "",
  city: "",
  call: "",
  model: "",
  serial: "",
  hourMeter: "",
  defect: "",
  cause: "",
  solution: "",
  services: [{ name: "", date: "", from: "", to: "", total: "" }],
  trips: [{ from: "", to: "", km: "", hours: "", total: "" }],
  materials: [{ qty: "", desc: "" }],
  testDone: "no",
  reason: "",
  result: "positivo",
  observation: "",
  serviceType: "garantia",
  clientSignature: "",
  sosSignature: "",
};

function downloadPdf(pdfUrl, id) {
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = `Relatorio-empilhadeira-${id}.pdf`;
  link.click();
}

export default function ForkliftReportPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, index, field, key) => {
    const newArr = [...formData[key]];
    newArr[index] = { ...newArr[index], [field]: e.target.value };
    setFormData((prev) => ({ ...prev, [key]: newArr }));
  };

  const addRow = (key, row) => {
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], row] }));
  };

  const removeRow = (key, index) => {
    setFormData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const newErrors = {};

    if (!formData.clientSignature) newErrors.clientSignature = "Assinatura do cliente obrigatória.";
    if (!formData.sosSignature) newErrors.sosSignature = "Assinatura do responsável obrigatória.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const {
        client, city, call, model, serial, hourMeter, defect, cause, solution,
        materials, testDone, reason, result, observation, serviceType,
      } = formData;
      const { services, trips } = withComputedTotals(formData.services, formData.trips);

      const { report } = await reportsApi.create({
        type: "FORKLIFT",
        data: {
          client, city, call, model, serial, hourMeter, defect, cause, solution,
          services, trips, materials, testDone, reason, result, observation, serviceType,
        },
        clientSignature: formData.clientSignature,
        sosSignature: formData.sosSignature,
      });

      const pdfUrl = await generateForkliftReportPDF({
        id: report.publicId,
        client, city, call, model, serial, hourMeter, defect, cause, solution,
        services, trips, materials, testDone, reason, result, observation, serviceType,
        clientSignature: formData.clientSignature,
        sosSignature: formData.sosSignature,
      });
      downloadPdf(pdfUrl, report.publicId);

      setFormData(initialFormData);
      setErrors({});
      setFormKey((k) => k + 1);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível salvar o relatório.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Relatório de Empilhadeira"
        subtitle="Preencha o atendimento e colete as assinaturas."
        actions={
          <Button variant="ghost" icon="history" onClick={() => navigate("/app/historico")}>
            Ver histórico
          </Button>
        }
      />

      <form key={formKey} className="report-form" onSubmit={handleSubmit} noValidate>
        <Alert tone="error">{formError}</Alert>

        <div className="card report-form__section">
          <h2 className="report-form__section-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              person
            </span>
            Cliente e equipamento
          </h2>
          <div className="report-form__row report-form__row--2">
            <Field label="Cliente" required>
              <input type="text" name="client" value={formData.client} onChange={handleChange} required />
            </Field>
            <Field label="Cidade" required>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </Field>
          </div>
          <Field label="Chamado">
            <input type="text" name="call" value={formData.call} onChange={handleChange} />
          </Field>
          <div className="report-form__row report-form__row--3">
            <Field label="Marca/Modelo">
              <input type="text" name="model" value={formData.model} onChange={handleChange} />
            </Field>
            <Field label="Matrícula">
              <input type="text" name="serial" value={formData.serial} onChange={handleChange} />
            </Field>
            <Field label="Horímetro">
              <input type="text" name="hourMeter" value={formData.hourMeter} onChange={handleChange} />
            </Field>
          </div>
        </div>

        <div className="card report-form__section">
          <h2 className="report-form__section-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              build
            </span>
            Diagnóstico
          </h2>
          <Field label="Defeito apresentado">
            <textarea name="defect" rows={2} value={formData.defect} onChange={handleChange} />
          </Field>
          <Field label="Possíveis causas">
            <textarea name="cause" rows={2} value={formData.cause} onChange={handleChange} />
          </Field>
          <Field label="Solução">
            <textarea name="solution" rows={2} value={formData.solution} onChange={handleChange} />
          </Field>
        </div>

        <div className="card report-form__section">
          <h2 className="report-form__section-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              construction
            </span>
            Outros serviços
          </h2>
          <div className="report-form__table">
            {formData.services.map((s, i) => (
              <div key={i} className="report-form__table-row">
                <label className="report-form__cell report-form__cell--wide">
                  <span className="report-form__cell-label">Nome</span>
                  <input
                    placeholder="Nome"
                    value={s.name}
                    onChange={(e) => handleArrayChange(e, i, "name", "services")}
                  />
                </label>
                <label className="report-form__cell report-form__cell--wide">
                  <span className="report-form__cell-label">Data</span>
                  <input
                    type="date"
                    value={s.date}
                    onChange={(e) => handleArrayChange(e, i, "date", "services")}
                  />
                </label>
                <label className="report-form__cell">
                  <span className="report-form__cell-label">Das</span>
                  <input
                    type="time"
                    placeholder="HH:MM"
                    value={s.from}
                    onChange={(e) => handleArrayChange(e, i, "from", "services")}
                  />
                </label>
                <label className="report-form__cell">
                  <span className="report-form__cell-label">Até</span>
                  <input
                    type="time"
                    placeholder="HH:MM"
                    value={s.to}
                    onChange={(e) => handleArrayChange(e, i, "to", "services")}
                  />
                </label>
                <div className="report-form__cell--wide">
                  <TotalCell label="Total" value={serviceTotal(s)} />
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  iconOnly
                  icon="delete"
                  className="report-form__table-remove"
                  onClick={() => removeRow("services", i)}
                  aria-label="Remover serviço"
                />
              </div>
            ))}
          </div>
          <Button
            variant="subtle"
            size="sm"
            icon="add"
            onClick={() => addRow("services", { name: "", date: "", from: "", to: "", total: "" })}
          >
            Adicionar serviço
          </Button>
          <p className="report-form__hint">
            Horários no formato HH:MM (24h), digite ou escolha. Se passar da meia-noite, o total já
            considera.
          </p>
        </div>

        <div className="card report-form__section">
          <h2 className="report-form__section-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              local_shipping
            </span>
            Viagem efetuada
          </h2>
          <div className="report-form__table">
            {formData.trips.map((t, i) => (
              <div key={i} className="report-form__table-row report-form__table-row--trips">
                <label className="report-form__cell">
                  <span className="report-form__cell-label">Das</span>
                  <input
                    type="time"
                    placeholder="HH:MM"
                    value={t.from}
                    onChange={(e) => handleArrayChange(e, i, "from", "trips")}
                  />
                </label>
                <label className="report-form__cell">
                  <span className="report-form__cell-label">Até</span>
                  <input
                    type="time"
                    placeholder="HH:MM"
                    value={t.to}
                    onChange={(e) => handleArrayChange(e, i, "to", "trips")}
                  />
                </label>
                <label className="report-form__cell">
                  <span className="report-form__cell-label">KM (só a ida)</span>
                  <input
                    inputMode="decimal"
                    placeholder="Ex: 35"
                    value={t.km}
                    onChange={(e) => handleArrayChange(e, i, "km", "trips")}
                  />
                </label>
                <TotalCell
                  label="Total"
                  value={tripRoundTrip(t).text}
                  note="Total inclui ida e volta"
                />
                <Button
                  variant="danger"
                  size="sm"
                  iconOnly
                  icon="delete"
                  onClick={() => removeRow("trips", i)}
                  aria-label="Remover viagem"
                />
              </div>
            ))}
          </div>
          <Button
            variant="subtle"
            size="sm"
            icon="add"
            onClick={() => addRow("trips", { from: "", to: "", km: "", hours: "", total: "" })}
          >
            Adicionar viagem
          </Button>
          <p className="report-form__hint">
            Informe só o trajeto de ida (horários HH:MM e km). A volta é calculada automaticamente.
          </p>
        </div>

        <div className="card report-form__section">
          <h2 className="report-form__section-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              inventory_2
            </span>
            Material empregado
          </h2>
          <div className="report-form__table">
            {formData.materials.map((m, i) => (
              <div key={i} className="report-form__table-row report-form__table-row--materials">
                <input placeholder="Quant." value={m.qty} onChange={(e) => handleArrayChange(e, i, "qty", "materials")} />
                <input
                  placeholder="Descrição"
                  value={m.desc}
                  onChange={(e) => handleArrayChange(e, i, "desc", "materials")}
                />
                <Button
                  variant="danger"
                  size="sm"
                  iconOnly
                  icon="delete"
                  onClick={() => removeRow("materials", i)}
                  aria-label="Remover material"
                />
              </div>
            ))}
          </div>
          <Button
            variant="subtle"
            size="sm"
            icon="add"
            onClick={() => addRow("materials", { qty: "", desc: "" })}
          >
            Adicionar material
          </Button>
        </div>

        <div className="card report-form__section">
          <h2 className="report-form__section-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              fact_check
            </span>
            Rodapé do atendimento
          </h2>

          <Field label="Teste efetuado">
            <div className="report-form__radio-group">
              <label>
                <input
                  type="radio"
                  name="testDone"
                  value="yes"
                  checked={formData.testDone === "yes"}
                  onChange={handleChange}
                />
                Sim
              </label>
              <label>
                <input
                  type="radio"
                  name="testDone"
                  value="no"
                  checked={formData.testDone === "no"}
                  onChange={handleChange}
                />
                Não
              </label>
            </div>
          </Field>

          <Field label="Motivo">
            <input type="text" name="reason" value={formData.reason} onChange={handleChange} />
          </Field>

          <Field label="Resultado">
            <div className="report-form__radio-group">
              <label>
                <input
                  type="radio"
                  name="result"
                  value="positivo"
                  checked={formData.result === "positivo"}
                  onChange={handleChange}
                />
                Positivo
              </label>
              <label>
                <input
                  type="radio"
                  name="result"
                  value="negativo"
                  checked={formData.result === "negativo"}
                  onChange={handleChange}
                />
                Negativo
              </label>
            </div>
          </Field>

          <Field label="Observações">
            <textarea name="observation" rows={3} value={formData.observation} onChange={handleChange} />
          </Field>

          <Field label="Tipo de serviço">
            <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
              <option value="garantia">Em garantia</option>
              <option value="contrato">Contrato</option>
              <option value="a faturar">A faturar</option>
            </select>
          </Field>
        </div>

        <div className="card report-form__section">
          <h2 className="report-form__section-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              draw
            </span>
            Assinaturas
          </h2>
          <div className="report-form__signatures">
            <div>
              <SignaturePad
                label="Assinatura do Cliente"
                onEnd={(dataUrl) => setFormData((prev) => ({ ...prev, clientSignature: dataUrl }))}
              />
              {errors.clientSignature && <p className="field__error">{errors.clientSignature}</p>}
            </div>
            <div>
              <SignaturePad
                label="Assinatura do Responsável (SOS)"
                onEnd={(dataUrl) => setFormData((prev) => ({ ...prev, sosSignature: dataUrl }))}
              />
              {errors.sosSignature && <p className="field__error">{errors.sosSignature}</p>}
            </div>
          </div>
        </div>

        <div className="report-form__submit">
          <Button type="submit" variant="primary" icon="save" loading={submitting}>
            Salvar e baixar PDF
          </Button>
        </div>
      </form>
    </div>
  );
}
