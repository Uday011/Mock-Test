import mammoth from 'mammoth';

/**
 * Extracts text from various file formats (Buffer or Uint8Array).
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<{ text: string; error?: string }> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  try {
    // 1. Plain text
    if (ext === 'txt' || mimeType?.includes('text/plain')) {
      const text = fileBuffer.toString('utf-8');
      return { text };
    }

    // 2. Word documents (.docx)
    if (ext === 'docx' || mimeType?.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return { text: result.value || '' };
    }

    // 3. PDF documents (.pdf)
    if (ext === 'pdf' || mimeType?.includes('pdf')) {
      try {
        // Dynamically import pdf-parse to avoid SSR bundling issues
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(fileBuffer);
        return { text: data.text || '' };
      } catch (pdfErr: any) {
        console.warn('pdf-parse fallback extraction:', pdfErr?.message);
        // Fallback: extract ASCII string streams from raw buffer
        const rawString = fileBuffer.toString('latin1');
        const textBlocks: string[] = [];
        const regex = /BT[\s\S]*?ET/g;
        let match;
        while ((match = regex.exec(rawString)) !== null) {
          const block = match[0].replace(/[\\()]/g, ' ');
          textBlocks.push(block);
        }
        if (textBlocks.length > 0) {
          return { text: textBlocks.join('\n') };
        }
        return { text: '', error: 'Failed to extract text from PDF: ' + (pdfErr?.message || 'Unknown error') };
      }
    }

    // 4. Fallback for other formats
    const fallbackText = fileBuffer.toString('utf-8');
    // Check if it's printable text
    if (/[\x20-\x7E\s]{20,}/.test(fallbackText)) {
      return { text: fallbackText };
    }

    return {
      text: '',
      error: `Unsupported file format: .${ext}. Please upload a PDF, DOCX, or TXT file.`,
    };
  } catch (err: any) {
    return {
      text: '',
      error: `Error processing file ${filename}: ${err?.message || 'Unknown error'}`,
    };
  }
}
