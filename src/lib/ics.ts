// Calendario iCalendar (RFC 5545) de los eventos del IPPSE.
//
// - /prensa/<id>.ics  -> un evento, para "Agregar a mi calendario".
// - /calendario.ics   -> todos los eventos, para suscribirse desde Google
//   Calendar, Outlook o Apple Calendar (se actualiza con cada publicación).
//
// Los eventos solo tienen fecha (sin hora): se publican como eventos de día completo.

import { conBase } from './rutas';
import { contacto } from '../data/contacto';
import type { Evento } from '../data/prensa';

/** Escapa texto según RFC 5545 (barra, coma, punto y coma, saltos de línea). */
const escapar = (texto: string) =>
  texto.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r?\n/g, '\\n');

/** Corta líneas largas a 75 octetos, como pide el estándar (continuación con un espacio). */
const plegar = (linea: string) => {
  const partes: string[] = [];
  let actual = '';
  for (const caracter of linea) {
    if (new TextEncoder().encode(actual + caracter).length > 73) {
      partes.push(actual);
      actual = caracter;
    } else {
      actual += caracter;
    }
  }
  partes.push(actual);
  return partes.join('\r\n ');
};

const fechaIcs = (iso: string) => iso.replace(/-/g, '');

/** Día siguiente (DTEND es exclusivo en eventos de día completo). */
const diaSiguiente = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

const sello = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export const vevento = (e: Evento, site: URL) => {
  // Fechas AAAA-MM (sin día exacto) se anotan el día 1 y se aclara en la descripción.
  const dia = e.fecha.length === 7 ? `${e.fecha}-01` : e.fecha;
  const url = new URL(conBase(`/prensa/${e.id}/`), site).href;
  const descripcion = [
    e.tipoEvento,
    e.fecha.length === 7 ? 'Fecha exacta a confirmar.' : '',
    `Más información: ${url}`,
  ].filter(Boolean).join('\n');
  return [
    'BEGIN:VEVENT',
    `UID:${e.id}@${site.host}`,
    `DTSTAMP:${sello()}`,
    `DTSTART;VALUE=DATE:${fechaIcs(dia)}`,
    `DTEND;VALUE=DATE:${fechaIcs(diaSiguiente(dia))}`,
    `SUMMARY:${escapar(e.titulo)}`,
    `LOCATION:${escapar(e.lugar)}`,
    `DESCRIPTION:${escapar(descripcion)}`,
    `URL:${url}`,
    `ORGANIZER;CN=IPPSE:mailto:${contacto.email}`,
    'END:VEVENT',
  ];
};

export const respuestaIcs = (eventos: Evento[], site: URL, nombre: string) => {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IPPSE//Eventos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapar(nombre)}`,
    'X-WR-TIMEZONE:America/Asuncion',
    // Sugerencia de frecuencia de actualización para quienes se suscriben.
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
    ...eventos.flatMap((e) => vevento(e, site)),
    'END:VCALENDAR',
  ];
  return new Response(lineas.map(plegar).join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
