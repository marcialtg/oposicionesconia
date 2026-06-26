import fs from 'fs';

// Chunks extraídos de la web
const CHUNKS = [
  {"content": "Para presentarte a las oposiciones de secundaria necesitas: un Grado universitario en la especialidad, el Máster en Formación del Profesorado, tener 16 años cumplidos, no exceder la edad de jubilación y no padecer enfermedad inhabilitante.", "source": "faq"},
  {"content": "Cada comunidad autónoma puede añadir requisitos específicos en su convocatoria anual para las oposiciones de secundaria.", "source": "faq"},
  {"content": "El baremo de méritos en oposiciones docentes sigue el RD 276/2007 y puntúa hasta 10 puntos: experiencia docente (máx. 5 pts), formación académica (máx. 3 pts) y otros méritos como cursos homologados y publicaciones (máx. 2 pts).", "source": "faq"},
  {"content": "La programación didáctica LOMLOE debe incluir 12 apartados obligatorios: introducción y contextualización, marco normativo, competencias clave, competencias específicas y criterios de evaluación, saberes básicos, metodología DUA, situaciones de aprendizaje, evaluación, calificación, atención a la diversidad, recursos y evaluación de la programación.", "source": "faq"},
  {"content": "Las normas clave de legislación para oposiciones de secundaria son: LOMLOE (Ley 3/2020), RD 217/2022 (currículo ESO), RD 243/2022 (currículo Bachillerato), RD 157/2022 (currículo Primaria), RD 276/2007 (baremo de méritos) y los decretos autonómicos de cada CCAA.", "source": "faq"},
  {"content": "Usando IA, puedes reducir el tiempo de creación de materiales en un 70%, permitiéndote dedicar el resto del tiempo a memorizar y practicar la oratoria.", "source": "faq"},
  {"content": "Elena está entrenada con bases de datos específicas de Educación Secundaria (Geografía e Historia, Lengua, Matemáticas, Inglés, etc.) y FP. No da respuestas genéricas.", "source": "faq"},
  {"content": "Usar IA para preparar tus materiales (temas, programación) es totalmente legal y estratégico.", "source": "faq"},
  {"content": "El análisis de perfil analiza tu base académica, tiempo disponible y tus bloqueos actuales para generar una hoja de ruta de estudio personalizada.", "source": "faq"},
  {"content": "Para presentarte a las oposiciones de secundaria necesitas: Grado universitario o Licenciatura, Máster en Formación del Profesorado, ser español o ciudadano UE, tener 16 años y no exceder jubilación.", "source": "blog"},
  {"content": "El temario de Geografía e Historia consta de 72 temas organizados en 4 bloques: Historia, Geografía, Historia del Arte, Historia de España.", "source": "blog"},
  {"content": "El temario de Lengua Castellana y Literatura tiene 72 temas según el BOE de 21 de septiembre de 1993, que abarcan gramática, lingüística, literatura española e hispanoamericana.", "source": "blog"},
  {"content": "El temario de Matemáticas tiene 71 temas según el BOE de 21 de septiembre de 1993, divididos en Álgebra, Geometría, Análisis Matemático y Estadística.", "source": "blog"},
  {"content": "El temario de Inglés tiene 69 temas según el BOE de 21 de septiembre de 1993, que incluyen lingüística aplicada, didáctica del inglés y literatura anglosajona.", "source": "blog"},
  {"content": "El temario de Biología y Geología tiene 75 temas según el BOE de 21 de septiembre de 1993, con bloques de Biología Celular, Genética, Ecología y Geología.", "source": "blog"},
  {"content": "El temario de Física y Química tiene 75 temas según el BOE de 21 de septiembre de 1993, de Mecánica, Termodinámica, Química Orgánica e Inorgánica.", "source": "blog"},
  {"content": "Cada CCAA selecciona un número concreto de temas para el examen de desarrollo.", "source": "blog"},
  {"content": "La oposición de secundaria consta de dos fases: oposición (60% de la nota) y concurso (40%).", "source": "blog"},
  {"content": "La fase de oposición incluye: Prueba práctica (30%), Desarrollo de un tema (30%), Programación didáctica (20%), y Unidad didáctica (20%).", "source": "blog"},
  {"content": "Es necesario obtener un mínimo de 5 puntos en cada parte para superar la fase de oposición.", "source": "blog"},
  {"content": "Experiencia docente (máx. 5 puntos): hasta 2,5 por experiencia en centros públicos en la especialidad, 1,5 en privados y 1 por otras especialidades.", "source": "blog"},
  {"content": "Formación académica (máx. 3 puntos): nota del expediente (hasta 1,5), doctorado (hasta 1), másteres (hasta 0,5).", "source": "blog"},
  {"content": "Otros méritos (máx. 2 puntos): cursos homologados, idiomas C1/C2, publicaciones y proyectos de innovación.", "source": "blog"},
  {"content": "La preparación de una oposición de secundaria requiere entre 6 y 12 meses de estudio intensivo.", "source": "blog"},
  {"content": "Dedica 4-5 horas diarias divididas en mañana (temario nuevo), tarde (repaso y tests) y noche (legislación).", "source": "blog"},
  {"content": "Realiza al menos un simulacro semanal en condiciones reales para controlar tiempos y gestionar la ansiedad.", "source": "blog"},
  {"content": "Dedica 30 minutos diarios a leer y comprender la LOMLOE, los reales decretos y la normativa de tu CCAA.", "source": "blog"},
  {"content": "Ensaya la exposición oral de tu programación y unidad didáctica al menos 3 veces antes del examen.", "source": "blog"},
  {"content": "La programación didáctica es un documento que planifica la actividad docente para un curso escolar completo.", "source": "blog"},
  {"content": "En las oposiciones de secundaria, la programación didáctica supone el 20% de la nota de la fase de oposición.", "source": "blog"},
  {"content": "La extensión recomendada de la programación didáctica es entre 40 y 70 páginas.", "source": "blog"},
  {"content": "La legislación aplicable incluye: LOMLOE, RD 217/2022 (ESO), RD 243/2022 (Bachiller), RD 157/2022 (Primaria) y decretos autonómicos.", "source": "blog"},
  {"content": "Las diferencias por CCAA afectan al número de unidades didácticas (10-15), formato de entrega y ponderación en la nota final.", "source": "blog"},
  {"content": "Errores frecuentes: no contextualizar, copiar modelos, legislación desactualizada y extensión inadecuada.", "source": "blog"},
  {"content": "El baremo se rige por el Real Decreto 276/2007 y permite sumar hasta 10 puntos adicionales.", "source": "blog"},
  {"content": "Experiencia Docente (hasta 5 pts): centros públicos misma especialidad 2,5 pts; otras especialidades 1 pt; privados 1,5 pts.", "source": "blog"},
  {"content": "Formación Académica (hasta 3 pts): nota media 1,5 pts; doctorado 1 pt; máster 0,5 pts; idiomas C1/C2 0,5 pts.", "source": "blog"},
  {"content": "Para maximizar puntos: haz sustituciones en centros públicos, cursos homologados de 125h+, máster oficial y certifica idiomas C1/C2.", "source": "blog"},
  {"content": "Elena es una preparadora IA entrenada con miles de programaciones de éxito y normativa vigente de cada CCAA.", "source": "elena"},
  {"content": "Elena conoce la LOMLOE de cada CCAA, está especializada en Secundaria, FP y EOI, disponible 24/7.", "source": "elena"},
  {"content": "Elena puede generar situaciones de aprendizaje validadas LOMLOE para tu especialidad y CCAA.", "source": "elena"},
  {"content": "La Calculadora de méritos permite obtener tu puntuación del baremo según RD 276/2007 al instante.", "source": "recursos"},
  {"content": "La Plantilla Programación Didáctica contiene los 12 apartados LOMLOE con ejemplos editables.", "source": "recursos"},
  {"content": "El Resumen legislación incluye LOMLOE, RD 157/2022, 217/2022, 243/2022 y normativa autonómica.", "source": "recursos"},
  {"content": "Elena analiza tu situación en 90 segundos mediante un cuestionario de perfil.", "source": "pasos"},
  {"content": "Recibes un plan estratégico personalizado con temas y recursos que necesitas.", "source": "pasos"},
  {"content": "Accedes a herramientas IA para generar situaciones de aprendizaje y supuestos corregidos.", "source": "pasos"},
  {"content": "Nuestra IA condensa meses de investigación bibliográfica en segundos.", "source": "features"},
  {"content": "Elena actúa como preparador personal 24/7 para preparación por libre.", "source": "features"},
];

const CF_ACCOUNT = process.env.CF_ACCOUNT;
const CF_TOKEN = process.env.CF_TOKEN;
const EMBED_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/@cf/baai/bge-base-en-v1.5`;

async function getEmbeddings(texts) {
  const resp = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texts })
  });
  if (!resp.ok) throw new Error(`Embedding API error: ${resp.status}`);
  const data = await resp.json();
  if (!data.success) throw new Error(`Embedding API: ${JSON.stringify(data.errors)}`);
  return data.result.data;
}

async function main() {
  const texts = CHUNKS.map(c => c.content);
  console.log(`Generating embeddings for ${texts.length} chunks...`);
  const embeddings = await getEmbeddings(texts);
  console.log(`Got ${embeddings.length} embeddings, dim=${embeddings[0].length}`);

  const kb = CHUNKS.map((chunk, i) => ({
    content: chunk.content,
    source: chunk.source,
    embedding: embeddings[i]
  }));

  const out = `// Auto-generated by scripts/build-kb.mjs — ${new Date().toISOString()}
export const KB = ${JSON.stringify(kb, null, 2)};
`;
  fs.writeFileSync('functions/api/rag/kb.mjs', out);
  console.log('Written to functions/api/rag/kb.mjs');
}

main().catch(e => { console.error(e); process.exit(1); });
