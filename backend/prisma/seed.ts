import { PrismaClient, DimensionType, SubdimensionType } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// BANCO DE PREGUNTAS (afirmaciones de ejemplo)
// Reglas de cálculo: docs/DOMAIN.md
// =============================================================================

const SURVEY_DATA = {
  title: 'Diagnóstico 360° del Emprendedor',
  description:
    'Herramienta de evaluación integral para identificar el estado actual del emprendedor en tres dimensiones fundamentales: su vida interna, su estructura de negocio y su capacidad de crecimiento.',
  sections: [
    // ─────────────────────────────────────────────────────────────────────────
    // DIMENSIÓN 1: INTERNA — Fundamento (quién eres)
    // ─────────────────────────────────────────────────────────────────────────
    {
      title: 'Área Interna',
      description: 'Fundamento — evalúa quién eres como persona.',
      order: 1,
      dimension: DimensionType.INTERNAL,
      subdimensions: [
        {
          type: SubdimensionType.SPIRITUAL,
          label: 'Espiritual',
          questions: [
            { order: 1,  text: 'Mis decisiones importantes están guiadas por mis valores y convicciones.' },
            { order: 2,  text: 'Reflexiono sobre el sentido de lo que hago antes de actuar.' },
            { order: 3,  text: 'Actúo de forma coherente con mis principios, incluso bajo presión.' },
          ],
        },
        {
          type: SubdimensionType.PERSONAL,
          label: 'Área Personal',
          questions: [
            { order: 4,  text: 'Cumplo los compromisos que asumo conmigo mismo.' },
            { order: 5,  text: 'Organizo mis prioridades al inicio de cada semana.' },
            { order: 6,  text: 'Invierto tiempo de forma regular en mi desarrollo profesional.' },
          ],
        },
        {
          type: SubdimensionType.RELATIONAL,
          label: 'Área Relacional',
          questions: [
            { order: 7,  text: 'Mantengo un equilibrio sano entre mi trabajo y mi vida personal.' },
            { order: 8,  text: 'Dedico tiempo de calidad a las personas importantes para mí.' },
            { order: 9,  text: 'Cuento con una red de apoyo a la que acudo cuando la necesito.' },
          ],
        },
      ],
    },
    // ─────────────────────────────────────────────────────────────────────────
    // DIMENSIÓN 2: NEGOCIO — Estructura (cómo operás)
    // ─────────────────────────────────────────────────────────────────────────
    {
      title: 'Área del Negocio',
      description: 'Estructura — evalúa cómo operás en tu negocio.',
      order: 2,
      dimension: DimensionType.BUSINESS,
      subdimensions: [
        {
          type: SubdimensionType.PURPOSE,
          label: 'Propósito y Visión',
          questions: [
            { order: 10, text: 'Puedo describir con claridad la visión de mi negocio a tres años.' },
            { order: 11, text: 'Tengo objetivos medibles definidos para este año.' },
            { order: 12, text: 'Mis decisiones de negocio están alineadas con un propósito claro.' },
          ],
        },
        {
          type: SubdimensionType.FINANCIAL,
          label: 'Área Financiera',
          questions: [
            { order: 13, text: 'Conozco con precisión la rentabilidad de mi negocio.' },
            { order: 14, text: 'Mantengo cuentas separadas para mis finanzas personales y del negocio.' },
            { order: 15, text: 'Llevo un registro actualizado de mi flujo de caja.' },
          ],
        },
        {
          type: SubdimensionType.SALES,
          label: 'Ventas',
          questions: [
            { order: 16, text: 'Tengo un proceso definido para atraer nuevos clientes.' },
            { order: 17, text: 'Convierto en ventas una proporción estable de mis oportunidades.' },
            { order: 18, text: 'Mis ingresos mensuales son predecibles.' },
          ],
        },
        {
          type: SubdimensionType.OPERATIONS,
          label: 'Operación',
          questions: [
            { order: 19, text: 'Las tareas clave de mi negocio están documentadas.' },
            { order: 20, text: 'Mi negocio puede operar varios días sin mi presencia.' },
            { order: 21, text: 'Cada semana sé exactamente qué actividades debo priorizar.' },
          ],
        },
        {
          type: SubdimensionType.MARKETING,
          label: 'Marketing',
          questions: [
            { order: 22, text: 'Tengo definido el perfil de mi cliente ideal.' },
            { order: 23, text: 'Mi propuesta de valor se entiende en pocas palabras.' },
            { order: 24, text: 'Publico contenido o me comunico con mi audiencia de forma constante.' },
          ],
        },
      ],
    },
    // ─────────────────────────────────────────────────────────────────────────
    // DIMENSIÓN 3: CRECIMIENTO — Expansión (hasta dónde podés llegar)
    // ─────────────────────────────────────────────────────────────────────────
    {
      title: 'Área de Crecimiento',
      description: 'Expansión — evalúa hasta dónde podés llegar.',
      order: 3,
      dimension: DimensionType.GROWTH,
      subdimensions: [
        {
          type: SubdimensionType.LEADERSHIP,
          label: 'Liderazgo y Equipo',
          questions: [
            { order: 25, text: 'Delego responsabilidades importantes con confianza.' },
            { order: 26, text: 'Cuento con personas comprometidas que sostienen la operación.' },
            { order: 27, text: 'Desarrollo las capacidades de las personas que trabajan conmigo.' },
          ],
        },
        {
          type: SubdimensionType.PLANNING,
          label: 'Planificación y Crecimiento',
          questions: [
            { order: 28, text: 'Tengo un plan de acción concreto para hacer crecer mi negocio.' },
            { order: 29, text: 'Mido periódicamente los resultados de mis iniciativas.' },
            { order: 30, text: 'Reservo tiempo fijo para trabajar en el negocio y no solo en él.' },
          ],
        },
      ],
    },
  ],
};

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🌱 Seeding Acme Consultores — Diagnóstico 360° del Emprendedor...');

  // --- Roles ---
  const roles = ['ADMIN', 'USER'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
  console.log('✔ Roles created:', roles.join(', '));

  // --- Survey ---
  const survey = await prisma.survey.upsert({
    where: { id: 'survey-diagnostico-360' },
    update: {
      title: SURVEY_DATA.title,
      description: SURVEY_DATA.description,
      isActive: true,
    },
    create: {
      id: 'survey-diagnostico-360',
      title: SURVEY_DATA.title,
      description: SURVEY_DATA.description,
      isActive: true,
    },
  });
  console.log(`✔ Survey: "${survey.title}"`);

  // --- Sections + Questions ---
  for (const sectionData of SURVEY_DATA.sections) {
    const section = await prisma.section.upsert({
      where: { surveyId_order: { surveyId: survey.id, order: sectionData.order } },
      update: {
        title: sectionData.title,
        description: sectionData.description,
        dimension: sectionData.dimension,
      },
      create: {
        surveyId: survey.id,
        title: sectionData.title,
        description: sectionData.description,
        order: sectionData.order,
        dimension: sectionData.dimension,
      },
    });

    console.log(`  ↳ Section [${section.order}]: ${section.title}`);

    for (const sub of sectionData.subdimensions) {
      for (const q of sub.questions) {
        await prisma.question.upsert({
          where: {
            // sectionId + order is unique enough for upsert
            id: `q-${String(q.order).padStart(2, '0')}`,
          },
          update: {
            text: q.text,
            dimension: sectionData.dimension,
            subdimension: sub.type,
          },
          create: {
            id: `q-${String(q.order).padStart(2, '0')}`,
            sectionId: section.id,
            text: q.text,
            order: q.order,
            dimension: sectionData.dimension,
            subdimension: sub.type,
          },
        });
      }
      console.log(`      • ${sub.label} (${sub.questions.length} preguntas) → ${sub.type}`);
    }
  }

  console.log('\n✅ Seeding completado. 30 preguntas plantadas.');
  console.log('   D1 INTERNAL: Sub1 SPIRITUAL, Sub2 PERSONAL, Sub3 RELATIONAL');
  console.log('   D2 BUSINESS: Sub4 PURPOSE, Sub5 FINANCIAL, Sub6 SALES, Sub7 OPERATIONS, Sub8 MARKETING');
  console.log('   D3 GROWTH:   Sub9 LEADERSHIP, Sub10 PLANNING');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
