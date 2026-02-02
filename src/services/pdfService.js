/**
 * Extract text from a PDF file using PDF.js
 * 
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} - The extracted text
 */
export const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if file is valid
      if (!file || !(file instanceof Blob)) {
        console.error('Invalid file object:', file);
        reject(new Error('Invalid file object. Expected a PDF file.'));
        return;
      }
      
      // For text-based PDFs, we can use FileReader
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          
          // Load PDF.js dynamically
          try {
            // Try to load PDF.js from CDN
            const pdfjsLib = await loadPDFJS();
            
            // Use PDF.js to extract text
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;
            
            let extractedText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');
              extractedText += pageText + '\n\n';
            }
            
            resolve(extractedText);
          } catch (pdfjsError) {
            console.error('Error loading or using PDF.js:', pdfjsError);
            
            // Fallback to simple text extraction
            const textDecoder = new TextDecoder('utf-8');
            const text = textDecoder.decode(arrayBuffer);
            
            // Check if it looks like a binary PDF
            if (text.startsWith('%PDF')) {
              // This is a binary PDF, we can't extract text without PDF.js
              console.warn('Binary PDF detected but PDF.js failed to load');
              resolve("This appears to be a binary PDF. For better text extraction, please ensure PDF.js is properly loaded.");
            } else {
              resolve(text);
            }
          }
        } catch (error) {
          console.error('Error processing PDF:', error);
          reject(new Error('Failed to extract text from PDF: ' + (error.message || 'Unknown error')));
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Error reading PDF file: ' + (error.message || 'Unknown error')));
      };
      
      // Read the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Unexpected error in extractTextFromPDF:', error);
      reject(new Error('Unexpected error processing PDF: ' + (error.message || 'Unknown error')));
    }
  });
};

/**
 * Dynamically load PDF.js from CDN
 * @returns {Promise<Object>} - The PDF.js library
 */
async function loadPDFJS() {
  return new Promise((resolve, reject) => {
    // Check if PDF.js is already loaded
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    
    // Load PDF.js from CDN
    const version = '3.11.174'; // Use a specific version
    const scriptUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.min.js`;
    const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = () => {
      // Set the worker source
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => {
      reject(new Error('Failed to load PDF.js from CDN'));
    };
    
    document.head.appendChild(script);
  });
}


