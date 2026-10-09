// Efeitos sonoros curtos, sintetizados com a Web Audio API (sem arquivos de
// áudio nem biblioteca). Volume baixo de propósito: é feedback, não alarme.

let audioCtx = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  // Navegadores suspendem o contexto até uma interação; o clique que
  // disparou a ação já conta como interação.
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// Toca uma sequência de notas: [{ freq, start, duration }], tempos em segundos.
function playNotes(notes, { type = "sine", volume = 0.08 } = {}) {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(note.freq, now + note.start);
    if (note.toFreq) {
      osc.frequency.exponentialRampToValueAtTime(note.toFreq, now + note.start + note.duration);
    }

    // Envelope curto: ataque rápido e decaimento suave, sem "clique".
    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(volume, now + note.start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.02);
  }
}

const SOUNDS = {
  // Aprovação: duas notas subindo (Mi5 -> Si5), brilhante e positiva.
  approve: () =>
    playNotes([
      { freq: 659.25, start: 0, duration: 0.14 },
      { freq: 987.77, start: 0.09, duration: 0.24 },
    ]),
  // Recusa: nota grave descendo, mais seca. Diferente da aprovação de propósito.
  reject: () =>
    playNotes([{ freq: 330, toFreq: 220, start: 0, duration: 0.28 }], { type: "triangle", volume: 0.1 }),
};

export function playSound(name) {
  const play = SOUNDS[name];
  if (!play) return;
  try {
    play();
  } catch {
    // Som é opcional: se o navegador bloquear, a ação segue normalmente.
  }
}
