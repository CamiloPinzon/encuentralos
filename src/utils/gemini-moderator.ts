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
      Actúa como un moderador de contenido estricto para una plataforma dedicada a reportar mascotas perdidas y encontradas.
      Analiza esta imagen y determina si es apropiada para la plataforma. 
      
      DEBES RECHAZAR la imagen si contiene algo de lo siguiente:
      1. Pornografía, desnudez o contenido sexual explícito.
      2. Violencia, sangre, maltrato animal/infantil o contenido gráfico.
      3. Contenido ilegal, armas o pedofilia.
      4. Intención de venta o compra de cualquier producto o servicio.
      5. Contenido irrelevante tipo "troll" (ej. memes puros sin contexto de búsqueda, capturas de pantalla de chistes).
      
      DEBES ACEPTAR la imagen si muestra a una mascota (perro, gato, ave, etc.) o a una PERSONA (niño, adulto, anciano) que podría estar perdido o encontrado. Es una app de búsqueda de mascotas Y PERSONAS perdidas.
      
      Responde usando este esquema JSON:
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
