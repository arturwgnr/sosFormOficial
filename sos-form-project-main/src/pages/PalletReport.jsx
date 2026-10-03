import { useState } from "react";
import "../css/PalletReport.css";
import SignaturePad from "../components/SignaturePad";
import { generatePalletReportPDF } from "../utils/pdfGenerator";
import { generatePalletReportId } from "../utils/idGenerator";

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

export default function PalletReport() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  // Incrementar força o remonte do <form>, limpando também os SignaturePad.
  const [formKey, setFormKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // validações manuais (loan + assinaturas)
    if (!formData.loan) newErrors.loan = "Selecione uma opção.";
    if (!formData.clientSignature)
      newErrors.clientSignature = "Assinatura do cliente obrigatória.";
    if (!formData.sosSignature)
      newErrors.sosSignature = "Assinatura do responsável obrigatória.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const id = generatePalletReportId();
      const pdfUrl = await generatePalletReportPDF({ ...formData, id });

      // Salva no histórico
      const newReport = {
        id,
        type: "paleteira",
        client: formData.client,
        date: new Date().toISOString(),
        pdfUrl,
      };

      const saved = JSON.parse(localStorage.getItem("reports") || "[]");
      saved.push(newReport);
      localStorage.setItem("reports", JSON.stringify(saved));

      downloadPdf(pdfUrl, id);

      // Limpa o formulário (e as assinaturas, via remonte do <form>)
      setFormData(initialFormData);
      setErrors({});
      setFormKey((k) => k + 1);

      alert("✅ PDF gerado, baixado e salvo no histórico!");
    }
  };

  return (
    <div className="pallet-report">
      <div className="report-container">
        <h1>Relatório de Serviço Paleteira</h1>

        <form key={formKey} className="report-form" onSubmit={handleSubmit}>
          {/* Linha 1 */}
          <div className="form-row">
            <label>
              Cliente:
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Cidade:
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {/* Linha 2 */}
          <div className="form-row">
            <label>
              Nome:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Tel.:
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {/* Linha 3 */}
          <div className="form-row">
            <label>
              Marca/Modelo:
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              E-mail:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </label>
          </div>

          {/* Linha 4 */}
          <label>
            Defeito relatado pelo cliente:
            <textarea
              name="defect"
              rows={2}
              value={formData.defect}
              onChange={handleChange}
              required
            ></textarea>
          </label>

          {/* Linha 5 */}
          <label>
            Descrição do serviço:
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </label>

          {/* Linha 6 */}
          <div className="form-row">
            <span>Empréstimo de paleteira:</span>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="loan"
                  value="yes"
                  checked={formData.loan === "yes"}
                  onChange={handleChange}
                />{" "}
                Sim
              </label>
              <label>
                <input
                  type="radio"
                  name="loan"
                  value="no"
                  checked={formData.loan === "no"}
                  onChange={handleChange}
                />{" "}
                Não
              </label>
            </div>
            {errors.loan && <p className="error">{errors.loan}</p>}
          </div>

          {/* Linha 7 */}
          <label>
            Marca/Modelo (empréstimo):
            <input
              type="text"
              name="loanModel"
              value={formData.loanModel}
              onChange={handleChange}
            />
          </label>

          {/* Assinaturas */}
          <div className="form-row signatures">
            <div>
              <SignaturePad
                label="Assinatura do Cliente"
                onEnd={(dataUrl) =>
                  setFormData((prev) => ({ ...prev, clientSignature: dataUrl }))
                }
              />
              {errors.clientSignature && (
                <p className="error">{errors.clientSignature}</p>
              )}
            </div>
            <div>
              <SignaturePad
                label="Assinatura do Responsável (SOS)"
                onEnd={(dataUrl) =>
                  setFormData((prev) => ({ ...prev, sosSignature: dataUrl }))
                }
              />
              {errors.sosSignature && (
                <p className="error">{errors.sosSignature}</p>
              )}
            </div>
          </div>

          <button type="submit">Salvar Relatório</button>
        </form>
      </div>
    </div>
  );
}
