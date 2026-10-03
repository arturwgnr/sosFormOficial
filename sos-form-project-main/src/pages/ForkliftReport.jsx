import { useState } from "react";
import "../css/PalletReport.css";
import SignaturePad from "../components/SignaturePad";
import { generateForkliftReportPDF } from "../utils/pdfForkliftGenerator";
import { generateForkliftReportId } from "../utils/idGenerator";

export default function ForkliftReport() {
  const [formData, setFormData] = useState({
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
    result: "positive",
    observation: "",
    serviceType: "warranty",
    clientSignature: "",
    sosSignature: "",
  });

  const [errors, setErrors] = useState({});

  // Inputs simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Inputs dinâmicos (tabelas)
  const handleArrayChange = (e, index, field, key) => {
    const newArr = [...formData[key]];
    newArr[index] = { ...newArr[index], [field]: e.target.value };
    setFormData((prev) => ({ ...prev, [key]: newArr }));
  };

  const addRow = (key, row) => {
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], row] }));
  };

  const removeRow = (key, index) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.clientSignature)
      newErrors.clientSignature = "Assinatura do cliente obrigatória.";
    if (!formData.sosSignature)
      newErrors.sosSignature = "Assinatura do responsável obrigatória.";

    setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
  const id = generateForkliftReportId();
  const pdfUrl = await generateForkliftReportPDF({ ...formData, id });

  // Salva no histórico
  const newReport = {
    id,
    type: "empilhadeira",
    client: formData.client,
    date: new Date().toISOString(),
    pdfUrl,
  };

 const saved = JSON.parse(localStorage.getItem("reports") || "[]");
saved.push(newReport);
localStorage.setItem("reports", JSON.stringify(saved));

alert("✅ PDF gerado e salvo no histórico!");
}
  };

  return (
    <div className="pallet-report">
      <div className="report-container">
        <h1>Relatório de Serviço - Empilhadeira</h1>

        <form className="report-form" onSubmit={handleSubmit}>
          {/* Cabeçalho */}
          <div className="form-row">
            <label>
              Cliente:
              <input type="text" name="client" value={formData.client} onChange={handleChange} required />
            </label>
            <label>
              Cidade:
              <input type="text" name="city" value={formData.city} onChange={handleChange} required />
            </label>
          </div>

          <label>
            Chamado:
            <input type="text" name="call" value={formData.call} onChange={handleChange} />
          </label>

          <div className="form-row">
            <label>
              Marca/Modelo:
              <input type="text" name="model" value={formData.model} onChange={handleChange} />
            </label>
            <label>
              Matrícula:
              <input type="text" name="serial" value={formData.serial} onChange={handleChange} />
            </label>
            <label>
              Horímetro:
              <input type="text" name="hourMeter" value={formData.hourMeter} onChange={handleChange} />
            </label>
          </div>

          <label>
            Defeito apresentado:
            <textarea name="defect" rows={2} value={formData.defect} onChange={handleChange}></textarea>
          </label>

          <label>
            Possíveis causas:
            <textarea name="cause" rows={2} value={formData.cause} onChange={handleChange}></textarea>
          </label>

          <label>
            Solução:
            <textarea name="solution" rows={2} value={formData.solution} onChange={handleChange}></textarea>
          </label>

          {/* Tabela - Outros Serviços */}
          <h3>Outros serviços</h3>
          {formData.services.map((s, i) => (
            <div key={i} className="form-row">
              <input placeholder="Nome" value={s.name} onChange={(e) => handleArrayChange(e, i, "name", "services")} />
              <input type="date" value={s.date} onChange={(e) => handleArrayChange(e, i, "date", "services")} />
              <input placeholder="Das" value={s.from} onChange={(e) => handleArrayChange(e, i, "from", "services")} />
              <input placeholder="Até" value={s.to} onChange={(e) => handleArrayChange(e, i, "to", "services")} />
              <input placeholder="Total" value={s.total} onChange={(e) => handleArrayChange(e, i, "total", "services")} />
              <button type="button" onClick={() => removeRow("services", i)}>Remover</button>
            </div>
          ))}
          <button type="button" onClick={() => addRow("services", { name: "", date: "", from: "", to: "", total: "" })}>
            ➕ Add serviço
          </button>

          {/* Tabela - Viagem Efetuada */}
          <h3>Viagem efetuada</h3>
          {formData.trips.map((t, i) => (
            <div key={i} className="form-row">
              <input placeholder="De" value={t.from} onChange={(e) => handleArrayChange(e, i, "from", "trips")} />
              <input placeholder="Até" value={t.to} onChange={(e) => handleArrayChange(e, i, "to", "trips")} />
              <input placeholder="KM" value={t.km} onChange={(e) => handleArrayChange(e, i, "km", "trips")} />
              <input placeholder="Horas" value={t.hours} onChange={(e) => handleArrayChange(e, i, "hours", "trips")} />
              <input placeholder="Total" value={t.total} onChange={(e) => handleArrayChange(e, i, "total", "trips")} />
              <button type="button" onClick={() => removeRow("trips", i)}>Remover</button>
            </div>
          ))}
          <button type="button" onClick={() => addRow("trips", { from: "", to: "", km: "", hours: "", total: "" })}>
            ➕ Add viagem
          </button>

          {/* Tabela - Material Empregado */}
          <h3>Material empregado</h3>
          {formData.materials.map((m, i) => (
            <div key={i} className="form-row">
              <input placeholder="Quant." value={m.qty} onChange={(e) => handleArrayChange(e, i, "qty", "materials")} />
              <input placeholder="Descrição" value={m.desc} onChange={(e) => handleArrayChange(e, i, "desc", "materials")} />
              <button type="button" onClick={() => removeRow("materials", i)}>Remover</button>
            </div>
          ))}
          <button type="button" onClick={() => addRow("materials", { qty: "", desc: "" })}>
            ➕ Add material
          </button>

          {/* Rodapé */}
          <h3>Rodapé</h3>
          <div className="form-row">
            <span>Teste efetuado:</span>
            <label><input type="radio" name="testDone" value="yes" checked={formData.testDone === "yes"} onChange={handleChange}/> Sim</label>
            <label><input type="radio" name="testDone" value="no" checked={formData.testDone === "no"} onChange={handleChange}/> Não</label>
          </div>

          <label>
            Motivo:
            <input type="text" name="reason" value={formData.reason} onChange={handleChange} />
          </label>

          <div className="form-row">
            <span>Resultado:</span>
            <label><input type="radio" name="result" value="positivo" checked={formData.result === "positive"} onChange={handleChange}/> Positivo</label>
            <label><input type="radio" name="result" value="negativo" checked={formData.result === "negative"} onChange={handleChange}/> Negativo</label>
          </div>

          <label>
            Observações:
            <textarea name="observation" rows={3} value={formData.observation} onChange={handleChange}></textarea>
          </label>

          <label>
            Tipo de serviço:
            <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
              <option value="garantia">Em garantia</option>
              <option value="contrato">Contrato</option>
              <option value="a faturar">A faturar</option>
            </select>
          </label>

          {/* Assinaturas */}
          <div className="form-row signatures">
            <div>
              <SignaturePad
                label="Assinatura do Cliente"
                onEnd={(dataUrl) => setFormData((prev) => ({ ...prev, clientSignature: dataUrl }))}
              />
              {errors.clientSignature && <p className="error">{errors.clientSignature}</p>}
            </div>
            <div>
              <SignaturePad
                label="Assinatura do Responsável (SOS)"
                onEnd={(dataUrl) => setFormData((prev) => ({ ...prev, sosSignature: dataUrl }))}
              />
              {errors.sosSignature && <p className="error">{errors.sosSignature}</p>}
            </div>
          </div>

          <button type="submit">Salvar Relatório</button>
        </form>
      </div>
    </div>
  );
}
