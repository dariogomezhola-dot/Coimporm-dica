import { Slide, Campaign, Asset } from './types';

export const SLIDES: Slide[] = [
  {
    id: 0,
    eyebrow: "Introducción",
    title: "Wiki: Sistema SPM-WhatsApp",
    subtitle: "Protocolo de atención y ventas",
    contentData: {
      type: 'grid-cards',
      cards: [
        {
          title: "⚠ Problema Identificado",
          titleColor: "text-red-400",
          content: "Respuestas improvisadas y falta de seguimiento estructurado en leads de equipos médicos de alto valor.",
          type: 'text'
        },
        {
          title: "✔ Solución CRM",
          titleColor: "text-accent",
          content: "Uso obligatorio del Tablero Kanban + Scripts modulares. Cada cliente debe moverse de 'Nuevo' a 'Cerrado' siguiendo el proceso.",
          type: 'text'
        }
      ]
    },
    chatContactName: "Cliente Potencial",
    chatContactStatus: "en línea",
    chatAvatarSeed: 1,
    chatScenario: [
      { id: '1', text: "Hola, vi el anuncio del Micro CPAP Transcend. ¿Precio?", isSender: false, timestamp: "10:05 AM" },
      { id: '2', text: "¡Hola! Claro que sí. Soy Ana de Coimpormedica. 🩺\nEl Transcend es ideal para viajes. ¿Buscas reemplazar tu equipo actual o es el primero?", isSender: true, timestamp: "10:06 AM" },
      { id: '3', text: "Es para mi papá, viaja mucho.", isSender: false, timestamp: "10:06 AM" }
    ]
  },
  // ... (Existing slides can remain as reference material for the Wiki)
  {
    id: 1,
    eyebrow: "Objetivos",
    title: "Qué queremos lograr",
    subtitle: "Impacto en ventas y atención",
    contentData: {
      type: 'grid-cards',
      cards: [
        {
          title: "🎯 Metas del Sistema",
          content: [
            "Estandarizar: Unificar el tono de voz de la marca.",
            "Trazabilidad: Todo lead debe existir en el CRM.",
            "Velocidad: Uso de plantillas pre-cargadas."
          ],
          type: 'list'
        },
        {
          title: "📊 KPIs",
          content: [
            "Tiempo de respuesta < 5 min.",
            "Tasa de cierre > 20%.",
            "0 Leads perdidos por falta de seguimiento."
          ],
          type: 'list'
        }
      ]
    },
    chatContactName: "Gerencia",
    chatContactStatus: "en línea",
    chatAvatarSeed: 2,
    chatScenario: [
      { id: '1', text: "Recordatorio: Todo lead contactado debe moverse a la columna 'En Proceso' inmediatamente.", isSender: true },
      { id: '2', text: "Entendido.", isSender: false }
    ]
  },
];

// Mock Campaigns used only for initial state if DB is empty
export const CAMPAIGNS: Campaign[] = [];

export const LIBRARY_ASSETS: Asset[] = [
  { id: 'l1', name: 'Logo Coimpormedica (Oficial)', type: 'PNG', category: 'Logo', size: '200 KB' },
  { id: 'l3', name: 'Manual de Identidad Corporativa', type: 'PDF', category: 'Identity', size: '15 MB' },
  { id: 'l4', name: 'Política de Garantías y Devoluciones', type: 'DOC', category: 'Legal', size: '50 KB' },
  { id: 'l5', name: 'Formato Vinculación Clientes', type: 'DOC', category: 'Legal', size: '120 KB' },
  { id: 'l6', name: 'Brochure Institucional 2024', type: 'PDF', category: 'Identity', size: '5 MB' },
];