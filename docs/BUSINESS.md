# Modelo de Negocio

## 1. Propuesta de valor

**Para** emprendedores y dueños de negocio que se esfuerzan pero no ven el crecimiento esperado,
**el Diagnóstico 360°** es una herramienta de autoevaluación
**que** revela en minutos los desbalances entre su vida interna, su negocio y su capacidad de crecer,
**a diferencia de** las evaluaciones tradicionales centradas solo en métricas financieras,
**porque** integra vida + negocio + crecimiento, incluye la dimensión espiritual y entrega una narrativa estratégica personalizada.

> *"El problema rara vez es falta de esfuerzo; suele ser falta de foco."*

### Diferenciadores

- Modelo **3D integral** (persona → negocio → crecimiento) con relación causal explícita.
- **Dimensión espiritual**, poco común en modelos empresariales.
- **Escala propia de Madurez**: lenguaje común entre emprendedor y mentor.
- **Inferencia cruzada** con nombres memorables ("Techo de Cristal", "Cubo Agujereado").
- **IA como consultor**: narrativa confrontativa y accionable, no un puntaje frío.

---

## 2. Modelo: diagnóstico gratuito como *lead magnet* → mentoría

El diagnóstico **no se cobra**. Es la puerta de entrada al negocio principal de Acme Consultores: **coaching y mentoría empresarial**.

```
 ATRACCIÓN            CAPTACIÓN              ACTIVACIÓN              CONVERSIÓN               RETENCIÓN
┌──────────┐      ┌──────────────┐      ┌──────────────────┐     ┌────────────────────┐    ┌───────────────────┐
│ Landing  │ ───▶ │ Registro +   │ ───▶ │ 30 preguntas →   │ ──▶ │ CTA WhatsApp a     │ ─▶ │ Recordatorio a     │
│ "Tú eres │      │ perfil (lead │      │ dashboard + IA   │     │ ventas / mentoría  │    │ 30 días → nuevo    │
│ el techo"│      │ calificado)  │      │ (momento "ajá")  │     │ (mentorshipTransi- │    │ diagnóstico →      │
└──────────┘      └──────────────┘      └──────────────────┘     │ tionText)          │    │ análisis evolución │
                                                                 └────────────────────┘    └───────────────────┘
```

| Etapa | Mecanismo en el producto |
|-------|--------------------------|
| **Captación** | Registro obligatorio antes del cuestionario; perfil con nombre, negocio, país, ciudad, teléfono → lead calificado y contactable. |
| **Calificación** | El IG, el nivel de madurez y las alertas segmentan al lead (crisis / intervención / mantenimiento / crecimiento). |
| **Activación** | Dashboard con advertencias directas ("crudeWarning") y plan de 30 días que demuestra valor inmediato. |
| **Conversión** | `Module6Action` + `mentorshipTransitionText` → WhatsApp del equipo comercial. |
| **Retención / recompra** | Histórico, vista de evolución y email automático a 30 días para remedir. |

### Usos internos de la herramienta

1. **Punto de entrada** a sesiones de coaching o mentoría.
2. **Filtro** para identificar el nivel del emprendedor.
3. **Base de trabajo** para diseñar planes personalizados.

---

## 3. Segmentos

| Segmento | Señal en el diagnóstico | Oferta natural |
|----------|-------------------------|----------------|
| En crisis | IG < 4 (`CRISIS`) | Intervención intensiva / acompañamiento 1:1 |
| En riesgo | IG 4–5.9 (`INTERVENTION`) | Programa correctivo con foco en cuellos de botella |
| Estancado | IG 6–7.9 (`MAINTENANCE`) | Mentoría para salir de la zona de confort |
| En crecimiento | IG ≥ 8 (`GROWTH`) | Escalamiento, liderazgo y delegación |

---

## 4. Métricas sugeridas (KPIs)

Hoy el `AnalyticsLoggerService` solo emite logs (`GlobalScore`, `RiskLevel`, flags). Métricas recomendadas, todas derivables de la base actual:

- Tasa registro → perfil completo → diagnóstico finalizado.
- Distribución de IG y de niveles de madurez por país.
- Frecuencia de cada alerta cruzada.
- Clics en el CTA de WhatsApp (requiere instrumentación).
- Tasa de re-diagnóstico tras el recordatorio de 30 días.

---

## 5. Brechas de negocio pendientes

- **Webhook a CRM** para que ventas reciba leads automáticamente (especificado, no implementado).
- **Reporte PDF** descargable/enviable con branding.
- **Panel ADMIN**: el rol existe en la base de datos, pero no hay endpoints ni vistas que lo usen.
- **Consentimiento de tratamiento de datos**: la spec exige un checkbox obligatorio en el registro.
