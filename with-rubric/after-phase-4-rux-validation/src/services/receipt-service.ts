import { validateReceiptFile } from '../utils/validation';

export async function processReceiptFile(file: File): Promise<{
  base64: string;
  fileName: string;
  fileSize: number;
}> {
  const validationError = validateReceiptFile(file);
  if (validationError) {
    throw new Error(validationError);
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve({
        base64,
        fileName: file.name,
        fileSize: file.size,
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

export function createThumbnail(base64: string, maxWidth: number, maxHeight: number): string {
  // For now, return the original base64. In a real app, you might want to 
  // actually resize the image using canvas
  return base64;
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot + 1).toLowerCase();
} 