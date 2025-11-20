import { Slide, Campaign, Asset } from './types';

export const SLIDES: Slide[] = [
  {
    id: 0,
    eyebrow: "Introducción",
    title: "Por qué un sistema de pitches en WhatsApp",
    subtitle: "Contexto y objetivos del manual",
    contentData: {
      type: 'grid-cards',
      cards: [
        {
          title: "⚠ Problema actual",
          titleColor: "text-red-400",
          content: "Los asesores responden de forma improvisada. No hay estandarización, cada uno da precios o información diferente sobre el Micro CPAP Transcend y no podemos medir qué mensaje cierra más ventas.",
          type: 'text'
        },
        {
          title: "✔ Solución propuesta",
          titleColor: "text-accent",
          content: "Implementar el SPM-WhatsApp: 5 tipos de pitch predefinidos + biblioteca de materiales oficiales. Esto permite trazabilidad, profesionalismo y aumento en la tasa de conversión.",
          type: 'text'
        }
      ]
    },
    chatContactName: "Cliente Potencial",
    chatContactStatus: "en línea",
    chatAvatarSeed: 1,
    chatScenario: [
      { id: '1', text: "Hola, vi el anuncio del Micro CPAP Transcend en Facebook. ¿Me das info?", isSender: false, timestamp: "10:05 AM" },
      { id: '2', text: "¡Hola! Claro que sí. Soy Ana de Soporte Vital. 🩺\nEl Transcend es el CPAP más pequeño del mercado, ideal si viajas. ¿Es tu primer equipo o ya usas uno?", isSender: true, timestamp: "10:06 AM" },
      { id: '3', text: "Ya uso uno grande y es muy ruidoso.", isSender: false, timestamp: "10:06 AM" }
    ]
  },
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
            "Test A/B: Probar 5 versiones de pitch para ver cuál vende más.",
            "Velocidad: Reducir tiempos de respuesta usando plantillas."
          ],
          type: 'list'
        },
        {
          title: "📊 Métricas Clave",
          content: [
            "Pitch utilizado (A, B, C, D, E).",
            "Estado final (Cerrado / Seguimiento / Perdido).",
            "Tiempo promedio de cierre."
          ],
          type: 'list'
        }
      ]
    },
    chatContactName: "Equipo Comercial",
    chatContactStatus: "en línea",
    chatAvatarSeed: 2,
    chatScenario: [
      { id: '1', text: "Reporte del día - Asesor Juan 📝", isSender: true },
      { id: '2', text: "Total conversaciones: 15\nVentas cerradas: 3\nPitch más efectivo hoy: Pitch B (Diferenciales)\nNota: El video de 'modo viaje' está funcionando muy bien para cerrar.", isSender: true },
      { id: '3', text: "¡Excelente Juan! Sigamos empujando el Pitch B mañana.", isSender: false }
    ]
  },
  {
    id: 2,
    eyebrow: "Marco SPM-WhatsApp",
    title: "Qué es el Sistema de Pitch Modular",
    subtitle: "Estructura: Texto Base + Apoyo + Cierre",
    contentData: {
      type: 'text-card',
      text: "No enviamos 'bloques de texto' gigantes. Usamos módulos según la necesidad del cliente.",
      cards: [
        {
            title: "Los 5 Tipos de Pitch",
            content: [
                "A| Educativo: Qué es y cómo funciona.",
                "B| Diferenciales: Por qué es mejor (tamaño/peso).",
                "C| Confianza: Garantía, soporte local.",
                "D| Casos de Uso: Viajeros frecuentes, campers.",
                "E| Urgencia: Precio, promo mes, stock bajo."
            ],
            type: 'list'
        }
      ]
    },
    chatContactName: "Guía Asesor (Bot)",
    chatContactStatus: "en línea",
    chatAvatarSeed: 3,
    chatScenario: [
      { id: '0', text: "Simulación interna", isSender: false, style: 'system' },
      { id: '1', text: "Cliente pregunta: \"¿Pero sí tiene suficiente potencia? Mi CPAP actual es muy grande.\"", isSender: false },
      { id: '2', text: "💡 Recomendación: Usa Pitch B (Diferenciales)", isSender: true, style: 'highlight' },
      { id: '3', text: "\"El Micro CPAP Transcend tiene la misma potencia (4-20 cmH2O) que tu equipo de mesa, pero cabe en la palma de tu mano. Es tecnología de vibración reducida.\"", isSender: true }
    ]
  },
  {
    id: 3,
    eyebrow: "Materiales",
    title: "Biblioteca de contenidos",
    subtitle: "Qué se envía y cuándo se usa",
    contentData: {
      type: 'text-card',
      text: "El texto no vende solo. El material visual valida la promesa.",
      cards: [
        {
            title: "📂 Kit de Archivos Aprobados",
            content: [
                "🎥 Video Demo (30s): Muestra tamaño real en mano.",
                "📄 PDF Técnico: Ficha de especificaciones Micro Transcend.",
                "🆚 Tabla Comparativa: Transcend vs CPAP Tradicional.",
                "📸 Galería: Fotos del kit de viaje y baterías."
            ],
            type: 'list'
        }
      ],
      quote: "🛑 Regla de oro: Nunca envíes un archivo sin un texto previo explicando qué es."
    },
    chatContactName: "Cliente Dr. López",
    chatContactStatus: "en línea",
    chatAvatarSeed: 4,
    chatScenario: [
      { id: '1', text: "Doctor, le comparto la ficha técnica donde puede ver los niveles de ruido y la duración de la batería P8. 👇", isSender: true },
      { id: '2', text: "Ficha_Tecnica_Transcend.pdf", isSender: true, type: 'file', metadata: { fileName: 'Ficha_Tecnica_Transcend.pdf', fileSize: '1.2 MB • 12 páginas', fileType: 'PDF' } },
      { id: '3', text: "Perfecto, justo lo que necesitaba para revisar con mi neumólogo. Gracias.", isSender: false }
    ]
  },
  {
    id: 4,
    eyebrow: "Flujo Estándar",
    title: "Los 4 pasos de la venta",
    subtitle: "Ruta recomendada para asesores",
    contentData: {
        type: 'text-card',
        cards: [{
            title: "",
            content: [
                "1| Saludo + Contexto: 'Hola [Nombre], vi que te interesó el Micro CPAP...'",
                "2| Filtro: '¿Buscas reemplazar tu equipo actual o es el primero?' (Define Pitch A o B).",
                "3| Pitch + Material: Texto persuasivo + Video/PDF de apoyo.",
                "4| Cierre: Llamada a la acción clara (Link de pago, Agendar llamada)."
            ],
            listOrdered: true,
            type: 'list'
        }]
    },
    chatContactName: "Laura (Cliente)",
    chatContactStatus: "en línea",
    chatAvatarSeed: 5,
    chatScenario: [
      { id: '1', text: "Es para mi papá, viaja mucho.", isSender: false },
      { id: '2', text: "1️⃣ Entiendo Laura. Para viajeros, el Transcend es ideal por sus baterías portátiles.", isSender: true },
      { id: '3', text: "2️⃣ ¿Él ya tiene la fórmula médica con la presión configurada?", isSender: true },
      { id: '4', text: "Sí, ya la tenemos.", isSender: false },
      { id: '5', text: "3️⃣ Perfecto. Mira este video de 30s donde mostramos cómo cabe en la maleta de mano. [Video Adjunto]", isSender: true },
      { id: '6', text: "4️⃣ ¿Te gustaría que te envíe la cotización formal ahora mismo?", isSender: true }
    ]
  },
  {
    id: 5,
    eyebrow: "Medición",
    title: "Registro de resultados",
    subtitle: "Sin datos no hay optimización",
    contentData: {
        type: 'text-card',
        text: "Mientras integramos el software final, usamos una Google Sheet compartida. Es obligatorio registrar cada interacción de venta.",
        cards: [{
            title: "📝 Campos obligatorios",
            content: [
                "Datos Cliente: Fecha/Hora, Nombre, Celular",
                "Datos Venta: Pitch usado (A-E), Material enviado, Resultado Final"
            ],
            type: 'list'
        }]
    },
    chatContactName: "Grupo Ventas",
    chatContactStatus: "en línea",
    chatAvatarSeed: 6,
    chatScenario: [
      { id: '1', text: "Por favor no olviden llenar la hoja antes de las 5pm.", isSender: false },
      { id: '2', text: "Resumen Rápido - Cliente Carlos M.\n-------------------------\nPitch: D (Viajeros)\nMaterial: Video Demo\nObjeción: Precio\nManejo: Ofrecí plan de cuotas.\nEstado: VENTA ✅", isSender: true },
      { id: '3', text: "¡Bien recuperado ese cierre!", isSender: false }
    ]
  },
  {
    id: 6,
    eyebrow: "Buenas Prácticas",
    title: "Lo que SÍ y lo que NO",
    subtitle: "Checklist de calidad para el equipo",
    contentData: {
      type: 'grid-cards',
      cards: [
        {
          title: "👍 SÍ HACER",
          titleColor: "text-accent",
          content: [
            "Responder en < 5 min.",
            "Personalizar el saludo (Usar nombre).",
            "Explicar qué es el archivo adjunto.",
            "Recordar prescripción médica."
          ],
          type: 'list'
        },
        {
          title: "👎 EVITAR",
          titleColor: "text-red-400",
          content: [
            "Audios de > 1 min sin resumen.",
            "Enviar solo PDF sin texto ('Ahí le va').",
            "Prometer entregas imposibles.",
            "Copiar/pegar con formato erróneo."
          ],
          type: 'list'
        }
      ]
    },
    chatContactName: "Supervisor",
    chatContactStatus: "en línea",
    chatAvatarSeed: 7,
    chatScenario: [
      { id: '1', text: "Equipo, revisión de calidad de chats de ayer.", isSender: false },
      { id: '2', text: "Checklist de Calidad:\n✅ Saludo personalizado\n✅ Uso correcto de ortografía\n✅ Pitch adecuado seleccionado\n❌ Tiempos de respuesta (promedio 20 min, debemos bajarlo).", isSender: true },
      { id: '3', text: "Entendido, activaré las respuestas rápidas para mejorar el tiempo.", isSender: false }
    ]
  },
  {
    id: 7,
    eyebrow: "Escalabilidad",
    title: "Del manual a la automatización",
    subtitle: "Próximos pasos del sistema",
    contentData: {
      type: 'text-card',
      text: "Este manual es la base para entrenar nuestra futura automatización.",
      cards: [
        {
            title: "🚀 Roadmap Técnico",
            content: [
                "Fase 1 (Hoy): Manual + Excel (Validación humana).",
                "Fase 2 (Mes 2): Plantillas pre-cargadas en WhatsApp Business API.",
                "Fase 3 (Mes 6): Chatbot híbrido que califica leads automáticamente y sugiere el pitch al asesor en tiempo real vía CRM."
            ],
            type: 'list'
        }
      ],
      quote: "\"Si no registramos hoy qué funciona, no podremos automatizar nada mañana.\""
    },
    chatContactName: "Futuro CRM",
    chatContactStatus: "Bot",
    chatAvatarSeed: 8,
    chatScenario: [
      { id: '1', text: "Hola Asesor. Se ha detectado un nuevo lead de Google Ads.", isSender: false },
      { id: '2', text: "Interés: Micro CPAP Transcend.\nKeyword: 'viaje liviano'.", isSender: false },
      { id: '3', text: "Sugerencia: Enviar Plantilla Pitch D automáticamente.", isSender: false },
      { id: '4', text: "Autorizar envío. ✅", isSender: true },
      { id: '5', text: "Mensaje enviado. Lead guardado en CRM.", isSender: false }
    ]
  }
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Q3 Retargeting - Transcend CPAP',
    status: 'Active',
    lastUpdated: '2023-10-24',
    pitches: {
      A: {
        text: "¡Hola! Vimos que visitaste nuestra web de CPAP...",
        assets: []
      },
      B: {
        text: "¿Buscas algo más pequeño? El Transcend pesa solo 200g.",
        assets: []
      },
      C: {
        text: "Garantía extendida de 3 años si compras hoy.",
        assets: [{ id: 'a2', name: 'ficha_tecnica.pdf', type: 'PDF', category: 'Campaign', size: '450 KB' }]
      },
      D: {
        text: "Ideal para viajeros frecuentes. Batería P8 incluída.",
        assets: [{ id: 'a1', name: 'promo_viajero.jpg', type: 'JPG', category: 'Campaign', size: '1.2 MB' }]
      },
      E: {
        text: "Últimas 2 unidades en stock a precio 2023.",
        assets: []
      }
    }
  },
  {
    id: 'c2',
    name: 'Cold Leads - Doctores Neumólogos',
    status: 'Draft',
    lastUpdated: '2023-10-20',
    pitches: {
      A: { text: "Dr. [Nombre], le presento el nuevo standard en movilidad...", assets: [] },
      B: { text: "", assets: [] },
      C: { text: "", assets: [] },
      D: { text: "", assets: [] },
      E: { text: "", assets: [] }
    }
  }
];

export const LIBRARY_ASSETS: Asset[] = [
  { id: 'l1', name: 'Logo Transcend (Positivo)', type: 'PNG', category: 'Logo', size: '200 KB' },
  { id: 'l2', name: 'Logo Transcend (Negativo)', type: 'PNG', category: 'Logo', size: '200 KB' },
  { id: 'l3', name: 'Manual de Marca v2.0', type: 'PDF', category: 'Identity', size: '15 MB' },
  { id: 'l4', name: 'Política de Garantías', type: 'DOC', category: 'Legal', size: '50 KB' },
  { id: 'l5', name: 'Contrato Distribución', type: 'DOC', category: 'Legal', size: '120 KB' },
  { id: 'l6', name: 'Pack Fotos Producto 4K', type: 'JPG', category: 'Identity', size: '25 MB' },
];