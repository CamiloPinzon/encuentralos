import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function extractFeaturesAndEmbed(base64Image: string, mimeType: string, category: string): Promise<{ features: string; embedding: number[] } | null> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY no está configurado. Omitiendo extracción de características.");
      return null;
    }

    // 1. Extraer características detalladas con Gemini Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = '';
    if (category === 'pet') {
      prompt = `
        Analiza esta imagen de una mascota minuciosamente. 
        Describe detalladamente: 
        1. Especie (perro, gato, ave, etc.)
        2. Raza aproximada o mezcla
        3. Colores principales y secundarios
        4. Tamaño aproximado
        5. Marcas distintivas (manchas, cicatrices, forma de orejas, cola)
        6. Accesorios (collar, ropa, chapita)
        El objetivo es crear una descripción lo más precisa posible para que otro sistema pueda encontrar coincidencias textuales con reportes similares. Devuelve solo el texto descriptivo, sin viñetas ni intros.
      `;
    } else {
      prompt = `
        Analiza esta imagen de una persona minuciosamente.
        Describe detalladamente:
        1. Género aparente
        2. Edad aproximada (bebé, niño, joven, adulto, anciano)
        3. Color y estilo de cabello
        4. Color de piel
        5. Ropa visible (colores y tipo de prenda)
        6. Rasgos distintivos (gafas, tatuajes, cicatrices, contextura física)
        El objetivo es crear una descripción lo más precisa posible para que otro sistema pueda encontrar coincidencias textuales con reportes similares. Devuelve solo el texto descriptivo, sin viñetas ni intros.
      `;
    }

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const features = result.response.text();

    if (!features) return null;

    // 2. Generar el embedding del texto descriptivo
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(features);
    const embedding = embeddingResult.embedding.values;

    return { features, embedding };
  } catch (error) {
    console.error("Error al extraer características o generar embedding:", error);
    return null;
  }
}
