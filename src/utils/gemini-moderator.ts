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

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      Eres el sistema de moderación de seguridad para una aplicación de reporte de mascotas y personas perdidas.
      Tu única tarea es bloquear y rechazar contenido explícitamente ilegal o inapropiado.

      DEBES RECHAZAR la imagen si y solo si contiene:
      1. Material pornográfico, contenido sexual explícito o desnudez.
      2. Pedofilia o abuso infantil.
      3. Violencia extrema, mutilación, sangre o maltrato animal gráfico.
      4. Drogas ilegales o armas de fuego.

      Cualquier otra imagen que no pertenezca a las categorías anteriores (como carteles de "se busca", fotos con texto, capturas de pantalla, mascotas, personas, paisajes, etc.) es completamente válida y segura para la plataforma.

      Responde usando este esquema JSON:
      {
        "isSafe": boolean, // false si contiene material prohibido según las reglas anteriores, true en cualquier otro caso
        "reason": "Justificación de la decisión"
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
    const text = result.response.text();
    
    try {
        const parsed = JSON.parse(text);
        return {
            isSafe: !!parsed.isSafe,
            reason: parsed.reason || 'Sin razón especificada'
        };
    } catch (parseError) {
         console.warn("La respuesta de Gemini no incluyó un JSON válido:", text);
         return { isSafe: true, reason: 'Falló el parseo de la moderación. Omitiendo.' };
    }
  } catch (error) {
    console.error("Error en la moderación con Gemini:", error);
    // Para evitar bloquear la app entera por caída de Google o error de API Key,
    // permitimos que la imagen se guarde para no arruinar la experiencia del usuario.
    return { isSafe: true, reason: 'Error en el servicio de moderación. Omitiendo.' };
  }
}
