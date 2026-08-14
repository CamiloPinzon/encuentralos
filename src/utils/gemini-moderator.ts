import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar el cliente usando la variable de entorno
// Asegúrate de tener GEMINI_API_KEY en tu .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function moderateImage(base64Image: string, mimeType: string): Promise<{ isSafe: boolean; reason: string }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY no está configurado en las variables de entorno. Saltando la moderación de imagen.");
      // Si no hay key configurada, permitimos que pase para no romper el flujo principal en desarrollo
      return { isSafe: true, reason: 'Moderación omitida: falta clave de API' };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
      Actúa como un moderador de contenido estricto para una plataforma dedicada a reportar mascotas perdidas y encontradas.
      Analiza esta imagen y determina si es apropiada para la plataforma. 
      
      DEBES RECHAZAR la imagen si contiene algo de lo siguiente:
      1. Pornografía, desnudez o contenido sexual explícito.
      2. Violencia, sangre, maltrato animal o contenido gráfico.
      3. Contenido ilegal, armas o pedofilia.
      4. Intención de venta o compra de cualquier producto o servicio (incluyendo criaderos o venta de mascotas).
      5. Contenido irrelevante que NO muestre a una mascota o animal (ej. memes, capturas de pantalla solo con texto, paisajes vacíos, selfies donde no haya un animal).
      
      DEBES ACEPTAR la imagen si muestra claramente a una mascota o animal (perro, gato, ave, etc.) que podría estar perdido o encontrado, incluso si hay personas o texto acompañando a la mascota.
      
      Responde ESTRICTAMENTE en formato JSON con la siguiente estructura y sin texto adicional ni formato de markdown:
      {
        "isSafe": boolean,
        "reason": "Breve justificación de por qué fue aceptada o rechazada (en español)"
      }
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Extraer el JSON en caso de que Gemini responda con formato de markdown (ej. \`\`\`json ... \`\`\`)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
            isSafe: !!parsed.isSafe,
            reason: parsed.reason || 'Sin razón especificada'
        };
    } else {
         console.warn("La respuesta de Gemini no incluyó un JSON válido:", text);
         // Si falla el parseo, devolvemos false por precaución
         return { isSafe: false, reason: 'La imagen no pudo ser procesada correctamente por el moderador.' };
    }
  } catch (error) {
    console.error("Error en la moderación con Gemini:", error);
    // Si hay un error de red o de la API de Gemini, devolvemos false preventivamente, o lo dejamos pasar.
    // Para evitar bloquear la app entera por caída de Google, en este contexto devolveremos false 
    // y pediremos al usuario reintentar.
    return { isSafe: false, reason: 'Error en el servicio de moderación de imágenes. Por favor, intenta de nuevo más tarde.' };
  }
}
