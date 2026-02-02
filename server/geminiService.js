/**
 * Gemini AI Service for TOS Comparison
 * Handles all interactions with Google's Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Compare two Terms of Service documents using Gemini AI
   * @param {string} tos1 - First TOS document text
   * @param {string} tos2 - Second TOS document text
   * @param {string} file1Name - Name of first file
   * @param {string} file2Name - Name of second file
   * @returns {Promise<Object>} Comparison analysis from Gemini
   */
  async compareTOS(tos1, tos2, file1Name, file2Name) {
    try {
      const prompt = this.buildComparisonPrompt(tos1, tos2, file1Name, file2Name);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the structured response
      return this.parseGeminiResponse(text, file1Name, file2Name);
      
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Build a comprehensive prompt for TOS comparison
   */
  buildComparisonPrompt(tos1, tos2, file1Name, file2Name) {
    return `
You are a legal expert analyzing Terms of Service documents. Compare these two TOS documents and provide a comprehensive analysis.

DOCUMENT 1 (${file1Name}):
${tos1}

DOCUMENT 2 (${file2Name}):
${tos2}

Please provide your analysis in the following JSON format:

{
  "summary": {
    "document1": "Brief summary of ${file1Name} in 2-3 sentences",
    "document2": "Brief summary of ${file2Name} in 2-3 sentences"
  },
  "keyDifferences": [
    {
      "section": "Section name (e.g., Privacy, Liability, etc.)",
      "document1": "What ${file1Name} states about this",
      "document2": "What ${file2Name} states about this",
      "difference": "Key difference between them",
      "riskLevel": "low|medium|high",
      "userImpact": "How this affects users"
    }
  ],
  "riskAnalysis": {
    "document1Risks": [
      {
        "risk": "Description of risky clause",
        "severity": "low|medium|high",
        "explanation": "Why this is concerning"
      }
    ],
    "document2Risks": [
      {
        "risk": "Description of risky clause", 
        "severity": "low|medium|high",
        "explanation": "Why this is concerning"
      }
    ]
  },
  "recommendation": {
    "betterForUsers": "document1|document2|neither",
    "reasoning": "Explanation of why one is better",
    "keyWarnings": ["Warning 1", "Warning 2", "Warning 3"]
  },
  "overallAssessment": "Overall comparison summary in 3-4 sentences"
}

Focus on:
- Privacy and data collection differences
- Liability and responsibility clauses
- User rights and restrictions
- Termination conditions
- Dispute resolution methods
- Content ownership and licensing
- Service availability and changes

Provide practical, user-focused analysis that helps people understand the legal implications.
`;
  }

  /**
   * Parse and validate Gemini's JSON response
   */
  parseGeminiResponse(text, file1Name, file2Name) {
    try {
      // Extract JSON from the response (Gemini sometimes adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      this.validateResponse(parsed);
      
      // Add metadata
      return {
        ...parsed,
        metadata: {
          file1Name,
          file2Name,
          analysisDate: new Date().toISOString(),
          model: 'gemini-1.5-flash'
        }
      };
      
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', text);
      
      // Return a fallback response
      return this.createFallbackResponse(text, file1Name, file2Name);
    }
  }

  /**
   * Validate the structure of Gemini's response
   */
  validateResponse(response) {
    const required = ['summary', 'keyDifferences', 'riskAnalysis', 'recommendation', 'overallAssessment'];
    
    for (const field of required) {
      if (!response[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * Create a fallback response if JSON parsing fails
   */
  createFallbackResponse(rawText, file1Name, file2Name) {
    return {
      summary: {
        document1: `Analysis of ${file1Name} - see full analysis below`,
        document2: `Analysis of ${file2Name} - see full analysis below`
      },
      keyDifferences: [{
        section: "General Analysis",
        document1: "See full analysis",
        document2: "See full analysis", 
        difference: "Detailed comparison provided below",
        riskLevel: "medium",
        userImpact: "Review full analysis for details"
      }],
      riskAnalysis: {
        document1Risks: [{
          risk: "Review full analysis",
          severity: "medium",
          explanation: "See detailed analysis below"
        }],
        document2Risks: [{
          risk: "Review full analysis", 
          severity: "medium",
          explanation: "See detailed analysis below"
        }]
      },
      recommendation: {
        betterForUsers: "neither",
        reasoning: "See full analysis below",
        keyWarnings: ["Review the full analysis", "Consult legal advice", "Read both documents carefully"]
      },
      overallAssessment: rawText.substring(0, 500) + "...",
      rawAnalysis: rawText,
      metadata: {
        file1Name,
        file2Name,
        analysisDate: new Date().toISOString(),
        model: 'gemini-1.5-flash',
        fallback: true
      }
    };
  }

  /**
   * Generate a simple summary of a single TOS document
   */
  async summarizeTOS(tosText, fileName) {
    try {
      const prompt = `
Analyze this Terms of Service document and provide a brief, user-friendly summary.

DOCUMENT (${fileName}):
${tosText}

Provide a JSON response with:
{
  "summary": "2-3 sentence summary of the main terms",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "riskLevel": "low|medium|high",
  "mainConcerns": ["Concern 1", "Concern 2"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        summary: text.substring(0, 200) + "...",
        keyPoints: ["See full analysis"],
        riskLevel: "medium", 
        mainConcerns: ["Review document carefully"]
      };
      
    } catch (error) {
      console.error('Error summarizing TOS:', error);
      throw error;
    }
  }
}

module.exports = GeminiService;
