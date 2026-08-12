/**
 * Optimiza y comprime una imagen usando Canvas de HTML5.
 * @param file El archivo de imagen original (File)
 * @param maxWidth Ancho máximo permitido (px)
 * @param maxHeight Alto máximo permitido (px)
 * @param quality Calidad de compresión (0.0 a 1.0)
 * @returns Una promesa que resuelve al archivo optimizado (File)
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // 1. Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo no es una imagen.'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 2. Calcular nuevas dimensiones manteniendo la proporción
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // 3. Crear canvas y dibujar la imagen redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo inicializar Canvas.'));
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // 4. Exportar a Blob (usamos WebP o JPEG)
        // Preferimos WebP si el navegador lo soporta, o caemos a JPEG
        const outputType = 'image/webp'; 
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Error al comprimir la imagen.'));
            }
            // 5. Convertir el Blob de nuevo a File
            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Error al leer la imagen.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Error al cargar el archivo.'));
    };
  });
}
