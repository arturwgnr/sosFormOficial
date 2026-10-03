import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "../css/SignaturePad.css";

export default function SignaturePad({ onEnd, label }) {
  const sigCanvas = useRef(null);

  const handleClear = () => {
    sigCanvas.current?.clear();
    onEnd("");
  };

  const handleEnd = () => {
  if (sigCanvas.current) {
    const canvas = sigCanvas.current.getCanvas();
    const dataUrl = canvas.toDataURL("image/png"); // 👈 salva inteiro
    onEnd(dataUrl);
  }
};

  return (
    <div className="signature-container">
      <p>{label}</p>
      <SignatureCanvas
  ref={sigCanvas}
  penColor="black"
  canvasProps={{
    className: "signature-canvas",
    width: 250,
    height: 100,
  }}
  onEnd={handleEnd}
/>
      <button type="button" onClick={handleClear} className="clear-btn">
        Limpar
      </button>
    </div>
  );
}
