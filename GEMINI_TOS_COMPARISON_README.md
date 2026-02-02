# 🤖 Gemini AI-Powered TOS Comparison Module

A complete Terms of Service comparison system using Google's Gemini AI for intelligent analysis and recommendations.

## ✨ Features

### 🧠 AI-Powered Analysis
- **Intelligent Comparison**: Uses Gemini AI to understand context and legal implications
- **Risk Assessment**: Identifies potentially risky clauses with severity levels
- **User-Friendly Summaries**: Plain English explanations of complex legal terms
- **Smart Recommendations**: AI suggests which document is better for users

### 📄 Document Support
- **PDF Files**: Automatic text extraction from PDF documents
- **TXT Files**: Direct text file processing
- **File Validation**: Size limits (10MB) and type checking

### 🎨 Rich UI Components
- **Drag & Drop Upload**: Intuitive file upload interface
- **Real-time Analysis**: Loading states and progress indicators
- **Structured Results**: Organized display of AI analysis
- **Risk Visualization**: Color-coded risk levels and warnings

## 🚀 How to Run

### 1. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies (if needed)
cd ..
npm install
```

### 2. Environment Setup

Your `.env` file should contain:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5000
```

### 3. Start the Servers

**Backend (Terminal 1):**
```bash
cd server
npm start
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

### 4. Test the Module

1. Open `http://localhost:5173/compare`
2. Upload two TOS documents (PDF or TXT)
3. Click "Analyze with Gemini AI"
4. Review the comprehensive AI analysis

## 📋 API Endpoints

### POST `/api/compare-gemini`
Gemini AI-powered TOS comparison

**Request:**
- `file1`: First TOS document (PDF/TXT)
- `file2`: Second TOS document (PDF/TXT)

**Response:**
```json
{
  "success": true,
  "file1Name": "tos-v1.pdf",
  "file2Name": "tos-v2.pdf",
  "analysis": {
    "summary": {
      "document1": "Brief summary of first document",
      "document2": "Brief summary of second document"
    },
    "keyDifferences": [
      {
        "section": "Privacy Policy",
        "document1": "What first doc says",
        "document2": "What second doc says",
        "difference": "Key difference",
        "riskLevel": "high|medium|low",
        "userImpact": "How this affects users"
      }
    ],
    "riskAnalysis": {
      "document1Risks": [...],
      "document2Risks": [...]
    },
    "recommendation": {
      "betterForUsers": "document1|document2|neither",
      "reasoning": "Why one is better",
      "keyWarnings": ["Warning 1", "Warning 2"]
    },
    "overallAssessment": "Summary of comparison"
  }
}
```

## 🧪 Testing with Sample Files

Use the provided sample files:
- `sample-tos-v1.txt` - Original version
- `sample-tos-v2.txt` - Updated version with changes

These files demonstrate:
- Added clauses (age requirement, commercial use restrictions)
- Modified clauses (liability limits, privacy policy changes)
- New sections (user responsibilities, termination)

## 🔧 Technical Implementation

### Backend Components
- **`server/geminiService.js`**: Gemini AI integration service
- **`server/index.js`**: Express routes and file handling
- **Dependencies**: `@google/generative-ai`, `pdf-parse`, `multer`

### Frontend Components
- **`src/components/GeminiTOSComparison/`**: Main comparison component
- **`src/pages/ComparePage.jsx`**: Updated page integration
- **Features**: File upload, AI analysis display, error handling

### Key Features
- **Smart Prompting**: Structured prompts for consistent AI responses
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **File Management**: Automatic cleanup of uploaded files
- **Response Parsing**: JSON validation and fallback handling

## 🎯 What the AI Analyzes

### Document Summaries
- Main terms and conditions
- Key policies and restrictions
- Overall document structure

### Risk Assessment
- Privacy and data collection risks
- Liability and responsibility clauses
- User rights and restrictions
- Termination conditions

### Comparative Analysis
- Section-by-section differences
- Legal implications of changes
- User impact assessment
- Recommendations for users

## 🔒 Security & Privacy

- **File Cleanup**: Uploaded files are automatically deleted after processing
- **API Key Security**: Gemini API key stored in environment variables
- **Input Validation**: File type and size validation
- **Error Handling**: No sensitive data exposed in error messages

## 🚨 Troubleshooting

### Common Issues

**"Gemini API key not configured"**
- Check that `VITE_GEMINI_API_KEY` is set in `.env`
- Restart the backend server after adding the key

**"Failed to fetch"**
- Ensure backend server is running on port 5000
- Check that `VITE_API_URL` is correctly set

**"File upload failed"**
- Verify file is PDF or TXT format
- Check file size is under 10MB
- Ensure both files are selected

**AI analysis incomplete**
- Check Gemini API quota and billing
- Review server logs for detailed error messages
- Try with smaller documents if hitting token limits

## 📈 Future Enhancements

- Support for more file formats (DOCX, RTF)
- Batch comparison of multiple documents
- Export analysis results to PDF/Word
- Integration with legal databases
- Custom analysis templates
- Multi-language support
