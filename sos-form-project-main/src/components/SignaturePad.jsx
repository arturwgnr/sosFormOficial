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
      <p className="signature-container__label">{label}</p>
      <SignatureCanvas
        ref={sigCanvas}
        penColor="#152c4b"
        canvasProps={{
          className: "signature-canvas",
          width: 320,
          height: 140,
        }}
        onEnd={handleEnd}
      />
      <button type="button" onClick={handleClear} className="clear-btn">
        <span className="material-symbols-outlined" aria-hidden="true">
          ink_eraser
        </span>
        Limpar
      </button>
    </div>
  );
}
