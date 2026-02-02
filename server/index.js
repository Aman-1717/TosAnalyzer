// Load environment variables
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const path = require('path');
const fs = require('fs');
const { simplifyText, identifyRiskyClauses, generateSummary } = require('./textSimplifier');
const { PDFDocument } = require('pdf-lib');
const tesseract = require('node-tesseract-ocr');
const diff = require('diff');
const GeminiService = require('./geminiService');
const AdvancedTextAnalysis = require('./advancedTextAnalysis');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Separate multer config for TOS comparison (accepts PDF and TXT)
const uploadComparison = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'), false);
    }
  }
});

// Configure OCR options
const ocrConfig = {
  lang: 'eng',
  oem: 1,
  psm: 3,
};

// Enhanced PDF upload and processing endpoint
app.post('/api/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfFile = fs.readFileSync(req.file.path);
    let extractedText = '';
    let isPDFBinary = false;
    
    // First try standard PDF text extraction
    try {
      const pdfData = await pdfParse(pdfFile);
      extractedText = pdfData.text;
    } catch (error) {
      console.error('Standard PDF extraction failed:', error);
      isPDFBinary = true;
    }
    
    // If standard extraction failed or returned binary data, try OCR
    if (!extractedText || extractedText.startsWith('%PDF') || extractedText.length < 100) {
      isPDFBinary = true;
      
      // For now, we'll just return an error since OCR might not be set up
      return res.status(400).json({ 
        error: 'Could not extract readable text from this PDF. The file may be scanned, encrypted, or corrupted.',
        isPDFBinary: true
      });
      
      // OCR implementation would go here if properly set up
    }
    
    // Process the extracted text
    const simplifiedText = simplifyText(extractedText);
    const riskyClauses = identifyRiskyClauses(extractedText);
    const summary = generateSummary(extractedText);
    
    // Return all processed data
    res.json({
      success: true,
      fileName: req.file.originalname,
      originalText: extractedText,
      simplifiedText: simplifiedText,
      riskyClauses: riskyClauses,
      summary: summary
    });
    
    // Clean up - delete the uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    // Ensure we always return a valid JSON response
    res.status(500).json({ 
      error: 'Failed to process PDF file', 
      message: error.message || 'Unknown error'
    });
  }
});

/**
 * TOS Comparison endpoint
 * Accepts two files (PDF or TXT) and returns a detailed comparison
 */
app.post('/api/compare', uploadComparison.fields([
  { name: 'file1', maxCount: 1 },
  { name: 'file2', maxCount: 1 }
]), async (req, res) => {
  try {
    // Check if both files are uploaded
    if (!req.files || !req.files.file1 || !req.files.file2) {
      return res.status(400).json({
        error: 'Both files are required for comparison'
      });
    }

    const file1 = req.files.file1[0];
    const file2 = req.files.file2[0];

    // Extract text from both files
    const text1 = await extractTextFromFile(file1);
    const text2 = await extractTextFromFile(file2);

    // Perform the comparison using diff library
    const comparison = performTextComparison(text1, text2);

    // Clean up uploaded files
    try {
      fs.unlinkSync(file1.path);
      fs.unlinkSync(file2.path);
    } catch (unlinkError) {
      console.error('Error deleting temporary files:', unlinkError);
    }

    // Return comparison results
    res.json({
      success: true,
      file1Name: file1.originalname,
      file2Name: file2.originalname,
      comparison: comparison,
      metadata: {
        file1Length: text1.length,
        file2Length: text2.length,
        comparisonDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error comparing files:', error);

    // Clean up files in case of error
    try {
      if (req.files?.file1?.[0]?.path) fs.unlinkSync(req.files.file1[0].path);
      if (req.files?.file2?.[0]?.path) fs.unlinkSync(req.files.file2[0].path);
    } catch (unlinkError) {
      console.error('Error deleting temporary files after error:', unlinkError);
    }

    res.status(500).json({
      error: 'Failed to compare files',
      message: error.message || 'Unknown error'
    });
  }
});

/**
 * Extract text from uploaded file (PDF or TXT)
 */
async function extractTextFromFile(file) {
  try {
    if (file.mimetype === 'text/plain') {
      // Read text file directly
      return fs.readFileSync(file.path, 'utf8');
    } else if (file.mimetype === 'application/pdf') {
      // Extract text from PDF
      const pdfBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(pdfBuffer);
      return pdfData.text;
    } else {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }
  } catch (error) {
    throw new Error(`Failed to extract text from ${file.originalname}: ${error.message}`);
  }
}

/**
 * Perform detailed text comparison using diff library
 */
function performTextComparison(text1, text2) {
  // Normalize texts (remove extra whitespace, normalize line endings)
  const normalizedText1 = normalizeText(text1);
  const normalizedText2 = normalizeText(text2);

  // Perform line-by-line comparison
  const lineDiff = diff.diffLines(normalizedText1, normalizedText2);

  // Perform word-level comparison for more granular changes
  const wordDiff = diff.diffWords(normalizedText1, normalizedText2);

  // Process the diff results
  const processedDiff = processDiffResults(lineDiff);
  const statistics = calculateDiffStatistics(lineDiff);

  return {
    lineDiff: processedDiff,
    wordDiff: processWordDiff(wordDiff),
    statistics: statistics,
    summary: generateComparisonSummary(statistics)
  };
}

/**
 * Normalize text for better comparison
 */
function normalizeText(text) {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')   // Handle old Mac line endings
    .replace(/\s+$/gm, '')  // Remove trailing whitespace from lines
    .trim();                // Remove leading/trailing whitespace
}

/**
 * Process diff results into a more usable format
 */
function processDiffResults(diffResults) {
  const processed = [];
  let lineNumber1 = 1;
  let lineNumber2 = 1;

  diffResults.forEach((part) => {
    const lines = part.value.split('\n').filter(line => line.length > 0 || part.value.endsWith('\n'));

    if (part.added) {
      // Lines added in text2
      lines.forEach((line, index) => {
        if (line.trim() || index < lines.length - 1) {
          processed.push({
            type: 'added',
            content: line,
            lineNumber1: null,
            lineNumber2: lineNumber2++
          });
        }
      });
    } else if (part.removed) {
      // Lines removed from text1
      lines.forEach((line, index) => {
        if (line.trim() || index < lines.length - 1) {
          processed.push({
            type: 'removed',
            content: line,
            lineNumber1: lineNumber1++,
            lineNumber2: null
          });
        }
      });
    } else {
      // Unchanged lines
      lines.forEach((line, index) => {
        if (line.trim() || index < lines.length - 1) {
          processed.push({
            type: 'unchanged',
            content: line,
            lineNumber1: lineNumber1++,
            lineNumber2: lineNumber2++
          });
        }
      });
    }
  });

  return processed;
}

/**
 * Process word-level diff for inline changes
 */
function processWordDiff(wordDiff) {
  return wordDiff.map(part => ({
    type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
    content: part.value
  }));
}

/**
 * Calculate statistics about the differences
 */
function calculateDiffStatistics(diffResults) {
  let addedLines = 0;
  let removedLines = 0;
  let unchangedLines = 0;

  diffResults.forEach(part => {
    const lineCount = part.value.split('\n').filter(line => line.length > 0).length;

    if (part.added) {
      addedLines += lineCount;
    } else if (part.removed) {
      removedLines += lineCount;
    } else {
      unchangedLines += lineCount;
    }
  });

  const totalLines = addedLines + removedLines + unchangedLines;
  const changePercentage = totalLines > 0 ? ((addedLines + removedLines) / totalLines * 100).toFixed(2) : 0;

  return {
    addedLines,
    removedLines,
    unchangedLines,
    totalLines,
    changePercentage: parseFloat(changePercentage)
  };
}

/**
 * Generate a human-readable summary of the comparison
 */
function generateComparisonSummary(statistics) {
  const { addedLines, removedLines, changePercentage } = statistics;

  if (addedLines === 0 && removedLines === 0) {
    return "The documents are identical.";
  }

  let summary = `${changePercentage}% of the document has changed. `;

  if (addedLines > 0 && removedLines > 0) {
    summary += `${addedLines} lines were added and ${removedLines} lines were removed.`;
  } else if (addedLines > 0) {
    summary += `${addedLines} lines were added.`;
  } else if (removedLines > 0) {
    summary += `${removedLines} lines were removed.`;
  }

  return summary;
}

/**
 * Gemini-powered TOS Comparison endpoint
 * Uses AI to provide intelligent analysis of TOS differences
 */
app.post('/api/compare-gemini', uploadComparison.fields([
  { name: 'file1', maxCount: 1 },
  { name: 'file2', maxCount: 1 }
]), async (req, res) => {
  try {
    // Check if both files are uploaded
    if (!req.files || !req.files.file1 || !req.files.file2) {
      return res.status(400).json({
        error: 'Both files are required for comparison'
      });
    }

    const file1 = req.files.file1[0];
    const file2 = req.files.file2[0];

    console.log(`Starting Gemini comparison: ${file1.originalname} vs ${file2.originalname}`);

    // Extract text from both files
    const text1 = await extractTextFromFile(file1);
    const text2 = await extractTextFromFile(file2);

    console.log(`Extracted text lengths: ${text1.length} vs ${text2.length} characters`);

    // Initialize Gemini service
    const geminiService = new GeminiService();

    // Get AI-powered comparison
    const geminiAnalysis = await geminiService.compareTOS(
      text1,
      text2,
      file1.originalname,
      file2.originalname
    );

    // Clean up uploaded files
    try {
      fs.unlinkSync(file1.path);
      fs.unlinkSync(file2.path);
    } catch (unlinkError) {
      console.error('Error deleting temporary files:', unlinkError);
    }

    // Return comprehensive analysis
    res.json({
      success: true,
      file1Name: file1.originalname,
      file2Name: file2.originalname,
      analysis: geminiAnalysis,
      metadata: {
        file1Length: text1.length,
        file2Length: text2.length,
        comparisonDate: new Date().toISOString(),
        analysisType: 'gemini-ai'
      }
    });

  } catch (error) {
    console.error('Error in Gemini comparison:', error);

    // Clean up files in case of error
    try {
      if (req.files?.file1?.[0]?.path) fs.unlinkSync(req.files.file1[0].path);
      if (req.files?.file2?.[0]?.path) fs.unlinkSync(req.files.file2[0].path);
    } catch (unlinkError) {
      console.error('Error deleting temporary files after error:', unlinkError);
    }

    // Return appropriate error message
    let errorMessage = 'Failed to compare files';
    if (error.message.includes('VITE_GEMINI_API_KEY')) {
      errorMessage = 'Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.';
    } else if (error.message.includes('Gemini API error')) {
      errorMessage = 'AI analysis service temporarily unavailable. Please try again later.';
    }

    res.status(500).json({
      error: errorMessage,
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Comprehensive TOS Comparison endpoint
 * Performs detailed analysis including content matching, risk assessment, readability, etc.
 */
app.post('/api/compare-comprehensive', uploadComparison.fields([
  { name: 'file1', maxCount: 1 },
  { name: 'file2', maxCount: 1 }
]), async (req, res) => {
  try {
    // Check if both files are uploaded
    if (!req.files || !req.files.file1 || !req.files.file2) {
      return res.status(400).json({
        error: 'Both files are required for comparison'
      });
    }

    const file1 = req.files.file1[0];
    const file2 = req.files.file2[0];

    console.log(`Starting comprehensive comparison: ${file1.originalname} vs ${file2.originalname}`);

    // Extract text from both files
    const text1 = await extractTextFromFile(file1);
    const text2 = await extractTextFromFile(file2);

    console.log(`Extracted text lengths: ${text1.length} vs ${text2.length} characters`);

    // Initialize analysis services
    const advancedAnalysis = new AdvancedTextAnalysis();

    // Perform comprehensive analysis
    const comprehensiveAnalysis = advancedAnalysis.performComprehensiveAnalysis(
      text1, text2, file1.originalname, file2.originalname
    );

    // Get AI-powered insights (optional, can be disabled if Gemini fails)
    let aiInsights = null;
    try {
      // Only initialize Gemini service if API key is available
      if (process.env.GEMINI_API_KEY) {
        const geminiService = new GeminiService();
        aiInsights = await geminiService.compareTOS(
          text1, text2, file1.originalname, file2.originalname
        );
      } else {
        console.log('Gemini API key not found, skipping AI analysis');
        aiInsights = {
          summary: {
            document1: "AI analysis not available - please configure Gemini API key for enhanced insights",
            document2: "AI analysis not available - please configure Gemini API key for enhanced insights"
          },
          keyDifferences: ["AI-powered difference detection requires Gemini API key"],
          riskAssessment: {
            document1: { level: "unknown", factors: ["API key required for AI risk assessment"] },
            document2: { level: "unknown", factors: ["API key required for AI risk assessment"] }
          }
        };
      }
    } catch (aiError) {
      console.warn('AI analysis failed, continuing with comprehensive analysis:', aiError.message);
      aiInsights = {
        summary: {
          document1: "AI analysis failed - using basic analysis only",
          document2: "AI analysis failed - using basic analysis only"
        },
        keyDifferences: ["AI analysis unavailable due to error: " + aiError.message],
        riskAssessment: {
          document1: { level: "unknown", factors: ["AI analysis failed"] },
          document2: { level: "unknown", factors: ["AI analysis failed"] }
        }
      };
    }

    // Clean up uploaded files
    try {
      fs.unlinkSync(file1.path);
      fs.unlinkSync(file2.path);
    } catch (unlinkError) {
      console.error('Error deleting temporary files:', unlinkError);
    }

    // Return comprehensive analysis
    res.json({
      success: true,
      file1Name: file1.originalname,
      file2Name: file2.originalname,
      comprehensiveAnalysis,
      aiInsights,
      metadata: {
        file1Length: text1.length,
        file2Length: text2.length,
        file1Text: text1, // Include the actual text for accessibility features
        file2Text: text2, // Include the actual text for accessibility features
        comparisonDate: new Date().toISOString(),
        analysisType: 'comprehensive-advanced',
        hasAiInsights: !!aiInsights
      }
    });

  } catch (error) {
    console.error('Error in comprehensive comparison:', error);

    // Clean up files in case of error
    try {
      if (req.files?.file1?.[0]?.path) fs.unlinkSync(req.files.file1[0].path);
      if (req.files?.file2?.[0]?.path) fs.unlinkSync(req.files.file2[0].path);
    } catch (unlinkError) {
      console.error('Error deleting temporary files after error:', unlinkError);
    }

    res.status(500).json({
      error: 'Failed to perform comprehensive comparison',
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to convert PDF page to image (implementation depends on your environment)
async function convertPDFPageToImage(pdfBuffer, pageNum, outputPath) {
  // This is a placeholder - you would implement this using a library like pdf2pic, pdf-poppler, etc.
  // Example implementation would go here
  console.log(`Converting page ${pageNum} to image at ${outputPath}`);
}



// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  });
});

// Simple test endpoint for debugging
app.post('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend connection working!',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});






