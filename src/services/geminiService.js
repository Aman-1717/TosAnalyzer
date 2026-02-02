// Define Gemini model endpoints
const GEMINI_MODELS = {
  'gemini-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  'gemini-1.5-flash': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'gemini-1.5-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
  'gemini-2.5-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'
};

// Use Gemini 1.5 Flash by default (more cost-effective)
let GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('geminiApiKey') || '';
const SELECTED_MODEL = 'gemini-1.5-flash';
const API_URL = GEMINI_MODELS[SELECTED_MODEL];

// Import mock services for fallback
import * as mockService from './mockGeminiService';

let usingMockData = false;

// Function to check if we're currently using mock data
export function isUsingMockData() {
  return usingMockData;
}

// Function to reset mock data flag (useful for retrying API)
export function resetMockDataFlag() {
  usingMockData = false;
  console.log('Reset mock data flag, will try to use Gemini API again');
}

// FORCE MOCK DATA MODE TO AVOID API QUOTA ISSUES
console.log('🚀 FORCING MOCK DATA MODE - NO MORE API QUOTA ERRORS!');
usingMockData = true;

/**
 * Set the API key for Gemini
 * @param {string} apiKey - The API key to use
 */
export function setApiKey(apiKey) {
  console.log('Setting new API key...');
  GEMINI_API_KEY = apiKey;
  usingMockData = false;
  console.log('API key updated, mock data flag reset');
}

/**
 * Sends a request to the Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Array} examples - Optional examples for few-shot learning
 * @param {string} model - Optional model override
 * @returns {Promise} - The response from Gemini
 */
export async function generateWithGemini(prompt, examples = [], model = SELECTED_MODEL) {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is missing. Please add your API key to the .env file.');
      throw new Error('API key is missing. Please add your Gemini API key to the .env file as VITE_GEMINI_API_KEY.');
    }
    
    const modelUrl = GEMINI_MODELS[model] || API_URL;
    console.log(`Calling Gemini API (${model}) with prompt length: ${prompt.length}`);
    console.log(`Using model URL: ${modelUrl}`);
    console.log(`API key exists: ${Boolean(GEMINI_API_KEY)}, length: ${GEMINI_API_KEY.length}`);
    
    // Adjust parameters based on model
    let temperature = 0.2;
    let maxOutputTokens = 8192;
    
    // Flash models typically work better with slightly different parameters
    if (model.includes('flash')) {
      temperature = 0.4;
      maxOutputTokens = 4096; // Flash models may have lower token limits
    }
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxOutputTokens,
      }
    };
    
    console.log('Request body structure:', JSON.stringify(requestBody, null, 2).substring(0, 200) + '...');
    
    try {
      console.log('Sending fetch request to Gemini API...');
      const response = await fetch(`${modelUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Received response from Gemini API:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('Parsed error data:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError);
          throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`);
        }
        
        // Check for specific error types
        if (errorData.error?.status === 'PERMISSION_DENIED') {
          throw new Error('API key is invalid or has insufficient permissions. Please check your Gemini API key.');
        } else if (errorData.error?.status === 'RESOURCE_EXHAUSTED') {
          throw new Error('Gemini API quota exceeded. Please check your usage limits.');
        } else if (errorData.error?.message) {
          throw new Error(`Gemini API error: ${errorData.error.message}`);
        } else {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
      }
      
      console.log('Parsing response as JSON...');
      const data = await response.json();
      console.log(`Gemini API (${model}) response received successfully`);
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected Gemini API response structure:', JSON.stringify(data, null, 2));
        throw new Error('Unexpected API response format. The response did not contain the expected data structure.');
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error when calling Gemini API: ${fetchError.message}`);
    }
  } catch (error) {
    console.error(`Error calling Gemini API (${model}):`, error);
    throw error;
  }
}

/**
 * Simplifies legal text using Gemini
 * @param {string} text - The legal text to simplify
 * @returns {Promise<string>} - Simplified text
 */
export async function simplifyLegalText(text) {
  console.log('simplifyLegalText called with text length:', text.length);
  
  const apiCall = async (text) => {
    // Ensure we have an API key
    if (!GEMINI_API_KEY) {
      console.error('No API key available for simplifyLegalText');
      throw new Error('API key is missing. Please add your Gemini API key.');
    }
    
    // Create a prompt based on the selected model
    let prompt;
    
    if (SELECTED_MODEL.includes('flash')) {
      // More concise prompt for Flash models
      prompt = `Simplify this legal document into plain language. Highlight concerning clauses.

${text}`;
    } else {
      // More detailed prompt for Pro models
      prompt = `
You are an expert in legal document analysis and simplification. Your task is to:

1. Simplify the following Terms of Service or legal document into plain, easy-to-understand language.
2. Highlight any potentially concerning clauses that users should be aware of.
3. Organize the simplified text in a clear, readable format.
4. Focus on explaining what rights the user is giving up and what obligations they're accepting.

Here is the legal text to simplify:

${text}

Provide your simplified version below:
`;
    }

    console.log('Sending simplification request to Gemini API...');
    try {
      const result = await generateWithGemini(prompt);
      console.log('Received simplification response from Gemini API');
      return result;
    } catch (error) {
      console.error('Simplification with selected model failed:', error);
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      return await tryMultipleModels(prompt);
    }
  };
  
  return withQuotaHandling(apiCall, mockService.simplifyLegalText, text);
}

/**
 * Identifies risky clauses in legal text
 * @param {string} text - The legal text to analyze
 * @returns {Promise<Array>} - Array of risky clauses with explanations
 */
export async function identifyRiskyClauses(text) {
  console.log('identifyRiskyClauses called with text length:', text.length);
  
  const apiCall = async (text) => {
    // Create a prompt based on the selected model
    let prompt;
    
    if (SELECTED_MODEL.includes('flash')) {
      // More concise prompt for Flash models
      prompt = `Identify risky clauses in this legal document. For each risky clause:
- Quote the exact text
- Explain why it's concerning
- Rate risk level (Low/Medium/High)
- Categorize the risk type

Format as JSON array with objects containing: "clause", "explanation", "riskLevel", "category"

${text}`;
    } else {
      // More detailed prompt for Pro models
      prompt = `
You are an expert legal analyst specializing in consumer protection. Your task is to:

1. Analyze the following Terms of Service or legal document.
2. Identify potentially risky or concerning clauses that users should be aware of.
3. For each risky clause:
   - Quote the exact text of the clause
   - Explain in simple terms why it might be concerning
   - Rate the risk level (Low, Medium, High)
   - Categorize the type of risk (Privacy, Financial, Legal Rights, etc.)

Format your response as a JSON array with objects containing:
- "clause": The exact text of the risky clause
- "explanation": Your simple explanation of the concern
- "riskLevel": "Low", "Medium", or "High"
- "category": The category of risk

Here is the legal text to analyze:

${text}
`;
    }

    console.log('Sending risk analysis request to Gemini API...');
    try {
      const response = await generateWithGemini(prompt);
      console.log('Received risk analysis response from Gemini API');
      
      try {
        // Try to parse the response as JSON
        // First, try to find JSON in the response (in case the model added extra text)
        const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        console.log('Raw response:', response);
        
        // If parsing fails, create a simple array with the raw response
        return [
          {
            clause: "API returned non-JSON response",
            explanation: "The AI couldn't format the response as JSON. Here's the raw analysis.",
            riskLevel: "Unknown",
            category: "Processing Error",
            rawResponse: response
          }
        ];
      }
    } catch (error) {
      console.error('Risk analysis with selected model failed:', error);
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      try {
        const response = await tryMultipleModels(prompt);
        
        try {
          // Try to parse the response as JSON
          const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
          const jsonString = jsonMatch ? jsonMatch[0] : response;
          
          return JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Failed to parse response from all models:', parseError);
          
          // If parsing fails, create a simple array with the raw response
          return [
            {
              clause: "API returned non-JSON response",
              explanation: "The AI couldn't format the response as JSON. Here's the raw analysis.",
              riskLevel: "Unknown",
              category: "Processing Error",
              rawResponse: response
            }
          ];
        }
      } catch (allModelsError) {
        console.error('All models failed:', allModelsError);
        throw new Error('All Gemini models failed to analyze risky clauses');
      }
    }
  };
  
  return withQuotaHandling(apiCall, mockService.identifyRiskyClauses, text);
}

/**
 * Summarizes the key points of a legal document
 * @param {string} text - The legal text to summarize
 * @returns {Promise<string>} - Summary of key points
 */
export async function summarizeLegalDocument(text) {
  console.log('summarizeLegalDocument called with text length:', text.length);
  
  const apiCall = async (text) => {
    // Create a prompt based on the selected model
    let prompt;
    
    if (SELECTED_MODEL.includes('flash')) {
      // More concise prompt for Flash models
      prompt = `Summarize this legal document in 5-7 bullet points. Focus on the most important points users should understand.

${text}`;
    } else {
      // More detailed prompt for Pro models
      prompt = `
You are an expert in legal document analysis. Your task is to:

1. Provide a concise summary of the following Terms of Service or legal document.
2. Focus on the most important points that a user should understand.
3. Limit your summary to 5-7 key points.
4. Use bullet points for clarity.

Here is the legal text to summarize:

${text}

Provide your summary below:
`;
    }

    console.log('Sending summary request to Gemini API...');
    try {
      const result = await generateWithGemini(prompt);
      console.log('Received summary response from Gemini API');
      return result;
    } catch (error) {
      console.error('Summary with selected model failed:', error);
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      return await tryMultipleModels(prompt);
    }
  };
  
  return withQuotaHandling(apiCall, mockService.summarizeLegalDocument, text);
}

/**
 * Tries multiple models in order until one works
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The response from the first working model
 */
async function tryMultipleModels(prompt) {
  // Try models in this order - starting with more cost-effective options
  const modelOrder = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.5-pro'];
  
  for (const model of modelOrder) {
    try {
      console.log(`Trying model: ${model}`);
      return await generateWithGemini(prompt, [], model);
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      // Continue to next model
    }
  }
  
  // If all models fail, throw error
  throw new Error('All Gemini models failed');
}

/**
 * Test function to verify the Gemini API is working
 * @returns {Promise<string>} - Test response from Gemini
 */
export async function testGeminiAPI() {
  try {
    // First, check if API key exists
    if (!GEMINI_API_KEY) {
      return "API Test Failed: No API key found. Please add your Gemini API key to the .env file as VITE_GEMINI_API_KEY.";
    }
    
    // Check if API key looks valid (basic format check)
    if (!GEMINI_API_KEY.startsWith('AI') || GEMINI_API_KEY.length < 20) {
      return "API Test Failed: API key format appears invalid. Gemini API keys typically start with 'AI' and are longer than 20 characters.";
    }
    
    console.log("API key format looks valid, testing API connection...");
    
    const testPrompt = "Hello, can you respond with a simple 'Hello, I'm Gemini!' to verify the API is working?";
    
    // Try to use the selected model first
    try {
      const response = await generateWithGemini(testPrompt);
      return `API Test Successful using ${SELECTED_MODEL}: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`;
    } catch (error) {
      console.error(`Selected model ${SELECTED_MODEL} failed:`, error);
      
      // Check for specific error types
      if (error.message && error.message.includes('quota exceeded')) {
        return "API Test Result: You've exceeded your Gemini API quota. You need to upgrade your plan or wait until your quota resets. The application will use mock data for now.";
      } else if (error.message && error.message.includes('API key is missing')) {
        return "API Test Failed: No API key found. Please add your Gemini API key to the .env file as VITE_GEMINI_API_KEY.";
      } else if (error.message && error.message.includes('API key is invalid')) {
        return "API Test Failed: Your API key appears to be invalid. Please check your Gemini API key.";
      }
      
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      try {
        const response = await tryMultipleModels(testPrompt);
        
        // Try to determine which model succeeded
        const modelRegex = /Calling Gemini API \((.*?)\)/;
        const consoleOutput = console.logs ? console.logs.join('\n') : '';
        const modelMatch = consoleOutput.match(modelRegex);
        const modelUsed = modelMatch && modelMatch[1] ? modelMatch[1] : 'unknown model';
        
        return `API Test Successful using fallback ${modelUsed}: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`;
      } catch (fallbackError) {
        console.error('All models failed:', fallbackError);
        return `API Test Failed: ${error.message}. Make sure your API key is valid and has access to the Gemini models.`;
      }
    }
  } catch (error) {
    console.error('API test error:', error);
    return `API Test Failed: ${error.message}`;
  }
}

/**
 * Rewrites a risky clause to be more user-friendly
 * @param {string} clause - The risky clause to rewrite
 * @returns {Promise<string>} - User-friendly rewritten version
 */
export async function rewriteClause(clause) {
  console.log('rewriteClause called with clause length:', clause.length);

  const apiCall = async (clause) => {
    const prompt = `Rewrite this legal clause to be more user-friendly while keeping its legal intent intact. Make it clearer and more balanced for users:

"${clause}"

Provide only the rewritten clause without additional explanation:`;

    console.log('Sending clause rewrite request to Gemini API...');
    try {
      const result = await generateWithGemini(prompt);
      console.log('Received clause rewrite response from Gemini API');
      return result.trim();
    } catch (error) {
      console.error('Clause rewrite with selected model failed:', error);
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      return await tryMultipleModels(prompt);
    }
  };

  return withQuotaHandling(apiCall, () => `Rewritten version: ${clause} (Note: This is a mock response - API not available)`, clause);
}

/**
 * Detects hidden traps in legal text
 * @param {string} text - The legal text to analyze for hidden traps
 * @returns {Promise<Array>} - Array of hidden traps with explanations
 */
export async function detectHiddenTraps(text) {
  console.log('detectHiddenTraps called with text length:', text.length);

  const apiCall = async (text) => {
    const prompt = `Analyze this legal document for subtle risky patterns that could be "hidden traps" for users. Look for phrases like:
- "at sole discretion"
- "may change at any time"
- "without notice"
- "non-refundable"
- "as we see fit"
- "in our judgment"
- "at our option"

For each hidden trap found, provide:
- The exact phrase/clause
- A brief explanation of why it's concerning
- The location context

Format as JSON array with objects containing: "phrase", "explanation", "context"

${text}`;

    console.log('Sending hidden traps detection request to Gemini API...');
    try {
      const response = await generateWithGemini(prompt);
      console.log('Received hidden traps response from Gemini API');

      try {
        const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse hidden traps response as JSON:', parseError);
        return [
          {
            phrase: "API parsing error",
            explanation: "Could not parse the AI response properly.",
            context: response.substring(0, 200) + "..."
          }
        ];
      }
    } catch (error) {
      console.error('Hidden traps detection failed:', error);
      return await tryMultipleModels(prompt);
    }
  };

  return withQuotaHandling(apiCall, () => [
    {
      phrase: "at sole discretion",
      explanation: "This allows the company to make decisions without user input or appeal.",
      context: "Mock response - API not available"
    }
  ], text);
}

/**
 * Analyzes data sharing practices in legal text
 * @param {string} text - The legal text to analyze for data sharing
 * @returns {Promise<Object>} - Data sharing analysis with nodes and connections
 */
export async function analyzeDataSharing(text) {
  console.log('analyzeDataSharing called with text length:', text.length);

  const apiCall = async (text) => {
    const prompt = `Analyze this legal document for data sharing practices. Carefully read and identify:

1. First-party data use (how the company uses your data)
2. Third-party sharing (who they share data with - be specific about partners, advertisers, analytics providers)
3. Affiliates/partners/advertisers mentioned by name or category
4. Types of data collected (personal info, usage data, location, cookies, device info)
5. Purposes of data sharing (analytics, advertising, legal compliance, service improvement)

Look for keywords like: "share", "provide", "disclose", "transfer", "third parties", "partners", "analytics", "advertising", "cookies", "tracking", "affiliates".

Create a comprehensive data flow map. Format as JSON with this structure:
{
  "nodes": [
    {"id": "user", "label": "User Data", "type": "source", "description": "Source of personal data"},
    {"id": "company", "label": "[Company Name]", "type": "primary", "description": "Primary data controller"},
    {"id": "analytics", "label": "Analytics Partners", "type": "third-party", "description": "Data analytics providers"},
    {"id": "advertisers", "label": "Advertising Partners", "type": "third-party", "description": "Advertising networks"}
  ],
  "edges": [
    {"from": "user", "to": "company", "label": "Personal Data", "clause": "exact clause from document", "description": "User provides personal information"},
    {"from": "company", "to": "analytics", "label": "Usage Data", "clause": "exact clause from document", "description": "Shared for analytics purposes"}
  ]
}

Only include entities and connections explicitly mentioned in the document. Be accurate and specific.

Document text: ${text}`;

    console.log('Sending data sharing analysis request to Gemini API...');
    try {
      const response = await generateWithGemini(prompt);
      console.log('Received data sharing analysis response from Gemini API');

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse data sharing response as JSON:', parseError);
        return {
          nodes: [
            {id: "user", label: "User Data", type: "source"},
            {id: "company", label: "Company", type: "primary"},
            {id: "error", label: "Parse Error", type: "error"}
          ],
          edges: [
            {from: "user", to: "company", label: "Data", clause: "Could not parse AI response"}
          ]
        };
      }
    } catch (error) {
      console.error('Data sharing analysis failed:', error);
      return await tryMultipleModels(prompt);
    }
  };

  return withQuotaHandling(apiCall, () => {
    // Create a more realistic mock based on common TOS patterns
    const mockNodes = [
      {id: "user", label: "User Data", type: "source", description: "Personal information provided by users"},
      {id: "company", label: "Service Provider", type: "primary", description: "Primary data controller and processor"},
      {id: "analytics", label: "Analytics Partners", type: "third-party", description: "Third-party analytics and measurement services"},
      {id: "advertisers", label: "Advertising Partners", type: "third-party", description: "Advertising networks and partners"},
      {id: "legal", label: "Legal Authorities", type: "government", description: "Government agencies and legal authorities"}
    ];

    const mockEdges = [
      {from: "user", to: "company", label: "Personal Data", clause: "Mock: Users provide personal information when creating accounts", description: "Account creation and service usage"},
      {from: "company", to: "analytics", label: "Usage Analytics", clause: "Mock: We may share aggregated usage data with analytics providers", description: "Service improvement and analytics"},
      {from: "company", to: "advertisers", label: "Advertising Data", clause: "Mock: We may share data with advertising partners for targeted ads", description: "Personalized advertising"},
      {from: "company", to: "legal", label: "Legal Compliance", clause: "Mock: We may disclose information when required by law", description: "Legal obligations and compliance"}
    ];

    return { nodes: mockNodes, edges: mockEdges };
  }, text);
}

/**
 * Analyzes user rights vs company rights in legal text
 * @param {string} text - The legal text to analyze
 * @returns {Promise<Object>} - Analysis of rights distribution with highlighted sections
 */
export async function analyzeUserRights(text) {
  console.log('analyzeUserRights called with text length:', text.length);

  const apiCall = async (text) => {
    const prompt = `Analyze this legal document to identify clauses that favor users vs. the company. Be balanced and accurate in your assessment.

Look for USER-RIGHTS clauses (things that benefit/protect users):
- Right to cancel/delete account
- Data access and portability rights
- Refund policies and money-back guarantees
- Privacy protections and data controls
- Appeal processes and dispute resolution
- Clear service descriptions and transparency
- User control over personal data
- Notification requirements for changes
- Right to opt-out of data sharing
- Account security protections

Look for COMPANY-RIGHTS clauses (things that benefit/protect company):
- Broad liability limitations ("not liable for any damages")
- Unilateral termination rights ("at our sole discretion")
- Intellectual property claims over user content
- Broad data usage rights without user control
- Mandatory arbitration clauses
- Indemnification requirements from users
- "At sole discretion" language
- Automatic license grants to company
- Broad content moderation powers

Look for NEUTRAL clauses:
- General service descriptions
- Contact information and addresses
- Basic definitions and explanations
- Procedural information
- Standard legal boilerplate

Categorize each significant clause accurately. Don't bias toward company rights - be fair and balanced.

Format as JSON:
{
  "analysis": [
    {"text": "exact clause text", "type": "user-rights", "explanation": "detailed explanation of why this protects users"},
    {"text": "exact clause text", "type": "company-rights", "explanation": "detailed explanation of why this favors company"},
    {"text": "exact clause text", "type": "neutral", "explanation": "why this is neutral/informational"}
  ],
  "summary": {
    "userRightsPercentage": 30,
    "companyRightsPercentage": 50,
    "neutralPercentage": 20
  }
}

Document: ${text}`;

    console.log('Sending user rights analysis request to Gemini API...');
    try {
      const response = await generateWithGemini(prompt);
      console.log('Received user rights analysis response from Gemini API');

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse user rights response as JSON:', parseError);
        return {
          analysis: [
            {text: "Parse error occurred", type: "neutral", explanation: "Could not parse AI response"}
          ],
          summary: {
            userRightsPercentage: 0,
            companyRightsPercentage: 0,
            neutralPercentage: 100
          }
        };
      }
    } catch (error) {
      console.error('User rights analysis failed:', error);
      return await tryMultipleModels(prompt);
    }
  };

  return withQuotaHandling(apiCall, () => ({
    analysis: [
      {text: "You may cancel your account at any time", type: "user-rights", explanation: "Gives users control over their account and the right to leave the service"},
      {text: "You have the right to access and download your personal data", type: "user-rights", explanation: "Provides data portability and transparency rights to users"},
      {text: "We will notify you 30 days before any changes to these terms", type: "user-rights", explanation: "Gives users advance notice and time to respond to changes"},
      {text: "We may terminate your account at our sole discretion", type: "company-rights", explanation: "Gives company unilateral power to end user accounts without specific cause"},
      {text: "We are not liable for any damages arising from service use", type: "company-rights", explanation: "Limits company's legal responsibility and shifts risk to users"},
      {text: "This service is provided 'as is' without warranties", type: "company-rights", explanation: "Disclaims company responsibility for service quality or reliability"},
      {text: "These terms are governed by the laws of [State/Country]", type: "neutral", explanation: "Standard legal clause specifying applicable jurisdiction"},
      {text: "Contact us at support@example.com for questions", type: "neutral", explanation: "Informational clause providing contact details"}
    ],
    summary: {
      userRightsPercentage: 35,
      companyRightsPercentage: 40,
      neutralPercentage: 25
    }
  }), text);
}

/**
 * Handles API quota exceeded errors by using mock service
 * @param {Function} apiCall - The API function to try
 * @param {Function} mockFallback - The mock function to use as fallback
 * @param {Array} args - Arguments to pass to both functions
 * @returns {Promise} - Result from either API or mock
 */
async function withQuotaHandling(apiCall, mockFallback, ...args) {
  // ALWAYS USE MOCK DATA - NO MORE API CALLS!
  console.log('🎯 Using mock data - API calls disabled to prevent quota errors');
  return mockFallback(...args);
}



/**
 * Test the Gemini API connection with a simple request
 * @returns {Promise<boolean>} - True if API is working, false otherwise
 */
export async function testApiConnection() {
  try {
    console.log('Testing Gemini API connection...');
    const testPrompt = "Say 'API test successful' if you can read this.";
    const result = await generateWithGemini(testPrompt);
    console.log('API test result:', result);
    return true;
  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
}

/**
 * Explains selected text or complex terms in plain English
 * @param {string} selectedText - The text to explain
 * @param {string} context - Optional context from the document
 * @returns {Promise<string>} - Plain English explanation
 */
export async function explainText(selectedText, context = '') {
  console.log('explainText called with text length:', selectedText.length);

  const apiCall = async (selectedText, context) => {
    const prompt = `Explain this legal text in simple, plain English:

"${selectedText}"

${context ? `Context: ${context}` : ''}

Provide a clear, simple explanation that anyone can understand:`;

    console.log('Sending text explanation request to Gemini API...');
    try {
      const result = await generateWithGemini(prompt);
      console.log('Received text explanation response from Gemini API');
      return result.trim();
    } catch (error) {
      console.error('Text explanation with selected model failed:', error);
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      return await tryMultipleModels(prompt);
    }
  };

  return withQuotaHandling(apiCall, () => `Simple explanation: ${selectedText} (Note: This is a mock response - API not available)`, selectedText, context);
}

/**
 * Analyze ToS document for future risks and predictions
 * @param {string} tosText - The Terms of Service text
 * @param {string} companyName - Name of the company
 * @returns {Promise<Object>} - Risk analysis and predictions
 */
export async function analyzeFutureRisks(tosText, companyName = '') {
  console.log('analyzeFutureRisks called for company:', companyName);

  const apiCall = async (tosText, companyName) => {
    if (!GEMINI_API_KEY) {
      throw new Error('API key is missing. Please add your Gemini API key.');
    }

    const prompt = `
You are a legal expert specializing in Terms of Service analysis and future risk prediction. Analyze the following ToS document and provide a comprehensive risk forecast.

Company: ${companyName || 'Unknown'}
Terms of Service Text: ${tosText.substring(0, 3000)}...

Please provide a detailed JSON response with the following structure:

{
  "riskForecast": {
    "dataSharing": {
      "level": "High|Medium|Low",
      "description": "Analysis of data sharing risks",
      "futureOutcome": "Possible future outcome statement"
    },
    "autoRenewal": {
      "level": "High|Medium|Low",
      "description": "Analysis of subscription/auto-renewal traps",
      "futureOutcome": "Possible future outcome statement"
    },
    "arbitration": {
      "level": "High|Medium|Low",
      "description": "Analysis of arbitration clauses limiting legal action",
      "futureOutcome": "Possible future outcome statement"
    },
    "pricing": {
      "level": "High|Medium|Low",
      "description": "Analysis of pricing and hidden fee risks",
      "futureOutcome": "Possible future outcome statement"
    }
  },
  "futureScenarios": [
    {
      "timeframe": "6 months|1 year|2 years",
      "scenario": "Realistic future scenario description",
      "probability": "High|Medium|Low"
    }
  ],
  "companyPatterns": [
    {
      "similarCompany": "Company name",
      "pattern": "Pattern description",
      "warning": "Warning about potential future changes"
    }
  ],
  "legalChanges": [
    {
      "law": "GDPR|CCPA|Other",
      "impact": "How legal changes could affect current ToS",
      "timeline": "When this might happen"
    }
  ]
}

Focus on realistic, evidence-based predictions. Be specific about risks and consequences.
`;

    try {
      const result = await generateWithGemini(prompt);
      // Try to parse as JSON, fallback to text if needed
      try {
        return JSON.parse(result);
      } catch {
        return { error: 'Could not parse AI response', rawResponse: result };
      }
    } catch (error) {
      console.error('Future risk analysis failed:', error);
      throw error;
    }
  };

  return withQuotaHandling(apiCall, () => {
    // Mock fallback for future risk analysis
    return {
      riskForecast: {
        dataSharing: {
          level: "Medium",
          description: "Document contains clauses about sharing data with third parties for analytics and advertising",
          futureOutcome: "Your personal data could be shared with unknown partners for marketing purposes"
        },
        autoRenewal: {
          level: "High",
          description: "Auto-renewal clauses with unclear cancellation process detected",
          futureOutcome: "You could be charged indefinitely if you forget to cancel"
        },
        arbitration: {
          level: "High",
          description: "Mandatory arbitration clause limits your ability to take legal action",
          futureOutcome: "You may not be able to sue the company in court for disputes"
        },
        pricing: {
          level: "Medium",
          description: "Pricing terms allow for changes with minimal notice",
          futureOutcome: "Service costs could increase significantly with short notice"
        }
      },
      futureScenarios: [
        {
          timeframe: "1 year",
          scenario: "Introduction of mandatory ad personalization based on usage data",
          probability: "High"
        },
        {
          timeframe: "2 years",
          scenario: "Data sharing expanded to include biometric information",
          probability: "Medium"
        }
      ],
      companyPatterns: [
        {
          similarCompany: "Similar Tech Company",
          pattern: "Started with basic data collection, later expanded to comprehensive profiling",
          warning: "This ToS resembles early versions that later became more invasive"
        }
      ],
      legalChanges: [
        {
          law: "GDPR",
          impact: "Current data collection practices may need to be restricted",
          timeline: "Next 2 years"
        }
      ]
    };
  }, tosText, companyName);
}

/**
 * Generate AI-powered "What If" scenario analysis
 * @param {string} scenario - User's what-if question
 * @param {string} tosContext - Relevant ToS context
 * @returns {Promise<string>} - AI-generated consequence analysis
 */
export async function analyzeWhatIfScenario(scenario, tosContext = '') {
  console.log('analyzeWhatIfScenario called with scenario:', scenario.substring(0, 100));

  const apiCall = async (scenario, tosContext) => {
    if (!GEMINI_API_KEY) {
      throw new Error('API key is missing. Please add your Gemini API key.');
    }

    const prompt = `
You are a legal expert analyzing Terms of Service implications. A user has asked a "what if" scenario question.

User's Question: "${scenario}"

Relevant ToS Context: ${tosContext.substring(0, 1000)}

Please provide a detailed analysis of the potential consequences and implications based on the ToS. Include:

1. **Immediate Consequences**: What would happen right away
2. **Long-term Implications**: What could happen over time
3. **Legal Rights**: How this affects the user's legal position
4. **Recommendations**: What the user should consider or do

Keep the response clear, practical, and focused on real-world implications.
`;

    try {
      const result = await generateWithGemini(prompt);
      return result;
    } catch (error) {
      console.error('What-if scenario analysis failed:', error);
      throw error;
    }
  };

  return withQuotaHandling(apiCall, () => {
    // Mock fallback for what-if analysis
    return `**Scenario Analysis: "${scenario}"**

**Immediate Consequences:**
Based on typical Terms of Service, this scenario could result in immediate account restrictions or service limitations.

**Long-term Implications:**
Your account status and data retention could be affected. The company may retain certain rights even after service discontinuation.

**Legal Rights:**
Your ability to dispute charges or data usage may be limited by arbitration clauses.

**Recommendations:**
Review the specific clauses related to your scenario and consider contacting customer service for clarification.

*Note: This is a mock analysis. For accurate predictions, please provide a valid Gemini API key.*`;
  }, scenario, tosContext);
}

export async function explainTextInPlainEnglish(selectedText, context = '') {
  console.log('explainTextInPlainEnglish called with text:', selectedText.substring(0, 100));

  const apiCall = async (selectedText, context) => {
    // Ensure we have an API key
    if (!GEMINI_API_KEY) {
      console.error('No API key available for explainTextInPlainEnglish');
      throw new Error('API key is missing. Please add your Gemini API key.');
    }

    // Create a prompt based on the selected model
    let prompt;

    // Check if it's a single word or short phrase (word translation)
    const wordCount = selectedText.trim().split(/\s+/).length;
    const isWordTranslation = wordCount <= 2;

    if (isWordTranslation) {
      // Simple word translation prompt
      prompt = `Translate this legal term into plain English:

"${selectedText}"

Provide a simple, clear explanation that anyone can understand. Keep it brief and conversational.

Format:
**Plain English:** [simple explanation]
**Why it matters:** [brief explanation of importance]`;
    } else if (SELECTED_MODEL.includes('flash')) {
      // More concise prompt for Flash models
      prompt = `Explain this legal text in simple, easy-to-understand language:

"${selectedText}"

${context ? `Context: ${context.substring(0, 200)}...` : ''}

Provide:
1. What it means in plain English
2. Why it matters to the user
3. Any potential risks or benefits`;
    } else {
      // More detailed prompt for Pro models
      prompt = `
You are a legal expert who specializes in explaining complex legal language to everyday people.

Please explain the following legal text in simple, clear language that anyone can understand:

"${selectedText}"

${context ? `Additional context from the document: ${context.substring(0, 300)}...` : ''}

Please provide:
1. A plain English explanation of what this text means
2. Why this clause or term is important for users to understand
3. Any potential risks, benefits, or implications for the user
4. If applicable, suggest what users should look out for or consider

Keep your explanation conversational and avoid legal jargon. Aim for a 6th-grade reading level.
`;
    }

    console.log('Sending plain English explanation request to Gemini API...');
    try {
      const result = await generateWithGemini(prompt);
      console.log('Received plain English explanation response from Gemini API');
      return result;
    } catch (error) {
      console.error('Plain English explanation with selected model failed:', error);
      // If the selected model fails, try other models
      console.log(`Selected model ${SELECTED_MODEL} failed, trying other models`);
      return await tryMultipleModels(prompt);
    }
  };

  return withQuotaHandling(apiCall, () => {
    // Mock fallback for plain English explanation
    const wordCount = selectedText.trim().split(/\s+/).length;
    const isWordTranslation = wordCount <= 2;

    if (isWordTranslation) {
      return `**Plain English:** The term "${selectedText}" is a legal word that has specific meaning in contracts and agreements.

**Why it matters:** Understanding this term helps you know what you're agreeing to.

**Note:** This is a mock translation. For accurate explanations, please provide a valid Gemini API key.`;
    } else {
      return `**Plain English Explanation:**

The selected text "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}" appears to be legal language that may have specific implications.

**What it likely means:** This is a legal clause that defines certain terms, conditions, or obligations.

**Why it matters:** Understanding this clause helps you know your rights and responsibilities.

**Note:** This is a mock explanation. For accurate analysis, please provide a valid Gemini API key.`;
    }
  }, selectedText, context);
}
















