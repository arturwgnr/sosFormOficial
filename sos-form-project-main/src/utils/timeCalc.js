// Cálculo de duração entre horários "HH:MM", usado em "Outros serviços"
// e "Viagem efetuada" (formulário e PDF). Funções puras, sem dependência.

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** "07:30" -> 450 (minutos desde 00:00). Inválido -> null. */
export function parseTime(value) {
  if (typeof value !== "string") return null;
  const match = TIME_RE.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Minutos entre "Das" e "Até". Se "Até" for antes de "Das", o serviço
 * passou da meia-noite (22:00 até 02:00 = 240). Horários iguais = 0.
 * Algum horário inválido ou vazio -> null.
 */
export function minutesBetween(from, to) {
  const start = parseTime(from);
  const end = parseTime(to);
  if (start === null || end === null) return null;
  const diff = end - start;
  return diff >= 0 ? diff : diff + 24 * 60;
}

/** 720 -> "12h", 150 -> "2h30", 45 -> "45min", 0 -> "0h". null -> "". */
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0 && m > 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

/** "12,5" ou "12.5" -> 12.5. Vazio ou inválido -> null. */
export function parseKm(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** 120 -> "120 km", 12.5 -> "12,5 km". */
export function formatKm(km) {
  if (km === null || km === undefined) return "";
  return `${km.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
}

/** Total de um serviço: só a duração. */
export function serviceTotal(service) {
  return formatDuration(minutesBetween(service.from, service.to));
}

/**
 * Viagem: o usuário informa UM trajeto (só a ida). O total é ida e volta
 * (horas x2 e km x2). Devolve as partes e um texto pronto
 * ("3h · 120 km"); partes que não dá pra calcular ficam de fora.
 */
export function tripRoundTrip(trip) {
  const oneWayMinutes = minutesBetween(trip.from, trip.to);
  const oneWayKm = parseKm(trip.km);
  const minutes = oneWayMinutes === null ? null : oneWayMinutes * 2;
  const km = oneWayKm === null ? null : oneWayKm * 2;
  const hoursText = formatDuration(minutes);
  const kmText = formatKm(km);
  return {
    oneWayHours: formatDuration(oneWayMinutes),
    oneWayKm: formatKm(oneWayKm),
    hours: hoursText,
    km: kmText,
    text: [hoursText, kmText].filter(Boolean).join(" · "),
  };
}
