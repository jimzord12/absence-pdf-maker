/**
 * Triggers a file download by creating a temporary link element.
 *
 * @param filename - The name of the file to download
 * @param content - The content to include in the file
 * @param type - The MIME type of the file (defaults to 'application/json')
 * @throws Error if filename or content is empty
 */
export const downloadFile = (
  filename: string,
  content: string,
  type = 'application/json'
): void => {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename must be a non-empty string');
  }

  if (content === undefined || content === null) {
    throw new Error('Content cannot be undefined or null');
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Reads a file as text and returns the content as a promise.
 *
 * @param file - The file to read
 * @returns Promise that resolves with the file content as text
 * @throws Error if file is not provided or read fails
 */
export const readFileAsText = (file: File): Promise<string> => {
  if (!file || !(file instanceof File)) {
    return Promise.reject(new Error('File must be a valid File object'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

