import { PDFDocument } from 'pdf-lib';

export const splitPdfPages = async (pdfBuffer: ArrayBuffer): Promise<Uint8Array[]> => {
  try {
    // Validate input
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      throw new Error('Invalid PDF data received');
    }

    // Load the PDF document with robust options
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
      parseSpeed: 50 // Slower but more reliable parsing
    }).catch(error => {
      throw new Error(`Failed to load PDF: ${error.message}`);
    });
    
    const pageCount = pdfDoc.getPageCount();
    if (pageCount === 0) {
      throw new Error('PDF document has no pages');
    }
    
    // Split into individual pages
    const pages: Uint8Array[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      try {
        // Create a new document for this page
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
        
        // Save with optimized options
        const pdfBytes = await newPdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
          preservePDFForm: true,
          objectsPerTick: 50
        });
        
        pages.push(pdfBytes);
      } catch (pageError: any) {
        console.error(`Error processing page ${i + 1}:`, pageError);
        throw new Error(`Failed to process page ${i + 1}: ${pageError.message}`);
      }
    }
    
    if (pages.length === 0) {
      throw new Error('No pages were successfully processed');
    }
    
    return pages;
  } catch (error: any) {
    console.error('Error splitting PDF:', error);
    throw new Error(`Failed to split PDF: ${error.message}`);
  }
};