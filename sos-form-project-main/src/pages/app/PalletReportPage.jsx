import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import SignaturePad from "../../components/SignaturePad";
import { reportsApi } from "../../api/reports";
import { ApiError } from "../../api/client";
import { generatePalletReportPDF } from "../../utils/pdfGenerator";
import "./ReportForm.css";

const initialFormData = {
  client: "",
  city: "",
  name: "",
  phone: "",
  model: "",
  email: "",
  defect: "",
  description: "",
  loan: "",
  loanModel: "",
  clientSignature: "",
  sosSignature: "",
};

function downloadPdf(pdfUrl, id) {
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = `Relatorio-paleteira-${id}.pdf`;
  link.click();
}

export default function PalletReportPage() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const newErrors = {};

    if (!formData.loan) newErrors.loan = "Selecione uma opção.";
    if (!formData.clientSignature) newErrors.clientSignature = "Assinatura do cliente obrigatória.";
    if (!formData.sosSignature) newErrors.sosSignature = "Assinatura do responsável obrigatória.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { client, city, name, phone, model, email, defect, description, loan, loanModel } = formData;

      const { report } = await reportsApi.create({
        type: "PALLET",
        data: { client, city, name, phone, model, email, defect, description, loan, loanModel },
        clientSignature: formData.clientSignature,
        sosSignature: formData.sosSignature,
      });

      const pdfUrl = await generatePalletReportPDF({
        id: report.publicId,
        client,
        city,
        name,
        phone,
        model,
        email,
        defect,
        description,
        loan,
        loanModel,
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
        title="Relatório de Paleteira"
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
            Cliente
          </h2>
          <div className="report-form__row report-form__row--2">
            <Field label="Cliente" required>
              <input type="text" name="client" value={formData.client} onChange={handleChange} required />
            </Field>
            <Field label="Cidade" required>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </Field>
          </div>
          <div className="report-form__row report-form__row--2">
            <Field label="Nome do contato" required>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </Field>
            <Field label="Telefone" required>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
            </Field>
          </div>
          <div className="report-form__row report-form__row--2">
            <Field label="Marca/Modelo" required>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required />
            </Field>
            <Field label="E-mail">
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </Field>
          </div>
        </div>

        <div className="card report-form__section">
          <h2 className="report-form__section-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              build
            </span>
            Atendimento
          </h2>
          <Field label="Defeito relatado pelo cliente" required>
            <textarea name="defect" rows={3} value={formData.defect} onChange={handleChange} required />
          </Field>
          <Field label="Descrição do serviço realizado" required>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Field>

          <Field label="Empréstimo de paleteira" required error={errors.loan}>
            <div className="report-form__radio-group">
              <label>
                <input
                  type="radio"
                  name="loan"
                  value="yes"
                  checked={formData.loan === "yes"}
                  onChange={handleChange}
                />
                Sim
              </label>
              <label>
                <input
                  type="radio"
                  name="loan"
                  value="no"
                  checked={formData.loan === "no"}
                  onChange={handleChange}
                />
                Não
              </label>
            </div>
          </Field>

          <Field label="Marca/Modelo do empréstimo">
            <input type="text" name="loanModel" value={formData.loanModel} onChange={handleChange} />
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
