/**
 * Mock version of the Gemini service for testing
 */

/**
 * Simplifies legal text using mock Gemini
 * @param {string} text - The legal text to simplify
 * @returns {Promise<string>} - Simplified text
 */
export async function simplifyLegalText(text) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Extract key sections from the text
  const sections = extractSections(text);
  
  // Create a simplified version based on the actual content
  let simplified = "# Simplified Terms\n\n";
  
  // Add simplified sections based on the extracted content
  Object.keys(sections).forEach(sectionTitle => {
    simplified += `## ${sectionTitle}\n`;
    
    // Add bullet points with simplified explanations
    const sectionText = sections[sectionTitle];
    const bullets = simplifySection(sectionTitle, sectionText);
    
    bullets.forEach(bullet => {
      simplified += `- ${bullet}\n`;
    });
    
    simplified += "\n";
  });
  
  return simplified;
}

/**
 * Identifies risky clauses in legal text
 * @param {string} text - The legal text to analyze
 * @returns {Promise<Array>} - Array of risky clauses with explanations
 */
export async function identifyRiskyClauses(text) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract key sections from the text
  const sections = extractSections(text);
  
  // Identify risky clauses based on the actual content
  const riskyClauses = [];
  
  // Check for common risky terms
  const riskTerms = [
    { term: "terminate", category: "Account Termination", riskLevel: "Medium" },
    { term: "liability", category: "Liability Limitation", riskLevel: "High" },
    { term: "warranty", category: "Warranty Disclaimer", riskLevel: "Medium" },
    { term: "privacy", category: "Privacy", riskLevel: "Medium" },
    { term: "arbitration", category: "Dispute Resolution", riskLevel: "High" },
    { term: "class action", category: "Legal Rights", riskLevel: "High" },
    { term: "modify", category: "Terms Changes", riskLevel: "Medium" },
    { term: "data", category: "Data Usage", riskLevel: "Medium" },
    { term: "consent", category: "Consent", riskLevel: "Medium" },
    { term: "third party", category: "Third Party Sharing", riskLevel: "Medium" }
  ];
  
  // Search for risky terms in each section
  Object.keys(sections).forEach(sectionTitle => {
    const sectionText = sections[sectionTitle];
    
    riskTerms.forEach(({ term, category, riskLevel }) => {
      if (sectionText.toLowerCase().includes(term.toLowerCase())) {
        // Find the sentence containing the term
        const sentences = sectionText.split(/[.!?]+/);
        const relevantSentences = sentences.filter(sentence => 
          sentence.toLowerCase().includes(term.toLowerCase())
        );
        
        if (relevantSentences.length > 0) {
          const clause = relevantSentences[0].trim();
          
          // Add to risky clauses if not already added
          const alreadyAdded = riskyClauses.some(existing => 
            existing.clause === clause || existing.category === category
          );
          
          if (!alreadyAdded && clause.length > 10) {
            riskyClauses.push({
              clause: clause,
              explanation: generateExplanation(category, term),
              riskLevel: riskLevel,
              category: category
            });
          }
        }
      }
    });
  });
  
  // If no risky clauses were found, add a generic one
  if (riskyClauses.length === 0) {
    riskyClauses.push({
      clause: "This document contains standard legal terms.",
      explanation: "No specific high-risk clauses were identified, but you should still read the full document carefully.",
      riskLevel: "Low",
      category: "General"
    });
  }
  
  return riskyClauses;
}

/**
 * Summarizes the key points of a legal document
 * @param {string} text - The legal text to summarize
 * @returns {Promise<string>} - Summary of key points
 */
export async function summarizeLegalDocument(text) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Extract key sections from the text
  const sections = extractSections(text);
  
  // Create a summary based on the actual content
  let summary = "## Key Points Summary\n\n";
  
  // Determine document type
  let documentType = "Terms of Service";
  if (text.toLowerCase().includes("privacy policy")) {
    documentType = "Privacy Policy";
  } else if (text.toLowerCase().includes("end user license")) {
    documentType = "End User License Agreement";
  }
  
  summary += `• This is a ${documentType} document that outlines the rules for using the service.\n`;
  
  // Add key points based on the sections found
  if (Object.keys(sections).includes("ACCEPTANCE OF TERMS") || 
      text.toLowerCase().includes("accept") || 
      text.toLowerCase().includes("agree")) {
    summary += "• You must accept these terms to use the service.\n";
  }
  
  if (Object.keys(sections).includes("TERMINATION") || 
      text.toLowerCase().includes("terminate") || 
      text.toLowerCase().includes("suspension")) {
    summary += "• The service provider can terminate your account under certain conditions.\n";
  }
  
  if (Object.keys(sections).includes("PRIVACY POLICY") || 
      text.toLowerCase().includes("privacy") || 
      text.toLowerCase().includes("data")) {
    summary += "• Your personal information is collected and used according to the privacy policy.\n";
  }
  
  if (Object.keys(sections).includes("LIMITATION OF LIABILITY") || 
      text.toLowerCase().includes("liability") || 
      text.toLowerCase().includes("damages")) {
    summary += "• The service provider limits their liability for damages related to using the service.\n";
  }
  
  if (Object.keys(sections).includes("INTELLECTUAL PROPERTY") || 
      text.toLowerCase().includes("copyright") || 
      text.toLowerCase().includes("property")) {
    summary += "• The content on the service is protected by intellectual property rights.\n";
  }
  
  if (Object.keys(sections).includes("CHANGES TO TERMS") || 
      text.toLowerCase().includes("modify") || 
      text.toLowerCase().includes("update terms")) {
    summary += "• The terms may be updated at any time, and continued use means you accept the changes.\n";
  }
  
  return summary;
}

/**
 * Fallback function to handle PDF binary data
 * @param {string} fileName - The name of the file
 * @returns {Object} - Mock document data
 */
export function createMockDocumentFromBinaryPDF(fileName) {
  return {
    fileName: fileName,
    originalText: "This document appears to be a scanned or encrypted PDF that couldn't be processed.",
    simplifiedText: "We couldn't extract text from this PDF file. It may be a scanned document or encrypted.",
    riskyClauses: [
      {
        "clause": "Unable to analyze document",
        "explanation": "We couldn't extract text from this PDF to analyze it. Consider uploading a text-based PDF or typing/pasting the text manually.",
        "riskLevel": "Unknown",
        "category": "Processing Error"
      }
    ],
    summary: "This document couldn't be processed automatically. You can try uploading a text-based PDF or manually entering the text."
  };
}

/**
 * Process a PDF file using mock data
 * @param {File} file - The PDF file to process
 * @returns {Object} - Mock document data for the PDF
 */
export function processPDFWithMockData(file) {
  // Generate mock data based on the file name
  return {
    fileName: file.name,
    originalText: `This is sample content extracted from ${file.name}. In a real application, this would be the actual text extracted from the PDF file.`,
    simplifiedText: `
# Simplified Terms of Service

## What You're Agreeing To
- You're using a service provided by the company
- You must follow these rules to use the service
- If you don't agree, you can't use the service

## Your Account
- You need to create an account with accurate information
- You're responsible for keeping your password secure
- Use strong passwords for better security

## Your Content
- You keep ownership of your files
- You give the company permission to host and display your content
- Don't upload illegal or harmful content

## Privacy
- The company collects your personal information
- They track how you use the service
- See their Privacy Policy for details
    `,
    riskyClauses: [
      {
        clause: "The company may access, store, and scan your content.",
        explanation: "This gives the company broad rights to access your data.",
        riskLevel: "High",
        category: "Privacy"
      },
      {
        clause: "The company can terminate your account at any time without notice.",
        explanation: "You could lose access to your account without warning.",
        riskLevel: "Medium",
        category: "Account Termination"
      },
      {
        clause: "You agree to indemnify the company against any claims related to your use of the service.",
        explanation: "You may be responsible for legal costs if someone sues the company because of your actions.",
        riskLevel: "Medium",
        category: "Liability"
      }
    ],
    summary: `This is a standard Terms of Service agreement for a cloud storage service. It covers account creation, content ownership, privacy, and acceptable use. There are some clauses that give the company broad rights to access your data and terminate your account without notice.`
  };
}

// Helper function to extract sections from text
function extractSections(text) {
  const sections = {};
  
  // Try to identify numbered or capitalized sections
  const sectionRegex = /(\d+\.\s+[A-Z][A-Z\s]+|[A-Z][A-Z\s]+)\s*\n/g;
  let lastSectionTitle = "GENERAL TERMS";
  let lastIndex = 0;
  
  // Find all section headers
  const matches = [...text.matchAll(sectionRegex)];
  
  if (matches.length > 0) {
    matches.forEach((match, index) => {
      const sectionTitle = match[1].trim();
      const startIndex = match.index;
      
      // Add the previous section
      if (index > 0) {
        const prevSection = text.substring(lastIndex, startIndex).trim();
        sections[lastSectionTitle] = prevSection;
      } else if (startIndex > 0) {
        // Add text before the first section
        const introText = text.substring(0, startIndex).trim();
        if (introText.length > 50) {
          sections["INTRODUCTION"] = introText;
        }
      }
      
      lastSectionTitle = sectionTitle;
      lastIndex = startIndex + match[0].length;
    });
    
    // Add the last section
    const lastSection = text.substring(lastIndex).trim();
    if (lastSection.length > 0) {
      sections[lastSectionTitle] = lastSection;
    }
  } else {
    // If no sections found, treat the whole text as one section
    sections["GENERAL TERMS"] = text;
  }
  
  return sections;
}

// Helper function to simplify a section
function simplifySection(title, text) {
  const bullets = [];
  
  // Generate simplified bullets based on section title
  switch (title.toUpperCase()) {
    case "ACCEPTANCE OF TERMS":
    case "TERMS ACCEPTANCE":
      bullets.push("You must agree to these terms to use the service");
      bullets.push("By using the service, you accept these terms");
      break;
    case "DESCRIPTION OF SERVICE":
    case "SERVICES":
      bullets.push("The service provides features and content as described on the website");
      bullets.push("The company may update or change the service features");
      break;
    case "USER CONDUCT":
    case "ACCEPTABLE USE":
      bullets.push("You must use the service legally and responsibly");
      bullets.push("Don't misuse the service or harm others");
      break;
    case "INTELLECTUAL PROPERTY":
    case "COPYRIGHT":
      bullets.push("The company owns the content and software on the service");
      bullets.push("You can't copy or modify the service without permission");
      break;
    case "PRIVACY POLICY":
    case "PRIVACY":
      bullets.push("The company collects and uses your information");
      bullets.push("See the Privacy Policy for details on data handling");
      break;
    case "TERMINATION":
    case "ACCOUNT TERMINATION":
      bullets.push("The company can end your access at any time");
      bullets.push("Your account may be terminated if you break the rules");
      break;
    case "DISCLAIMER OF WARRANTIES":
    case "WARRANTIES":
      bullets.push("The service is provided 'as is' without guarantees");
      bullets.push("The company doesn't promise the service will be perfect");
      break;
    case "LIMITATION OF LIABILITY":
    case "LIABILITY":
      bullets.push("The company isn't responsible for most damages");
      bullets.push("There are limits on what you can claim from the company");
      break;
    case "GOVERNING LAW":
    case "APPLICABLE LAW":
      bullets.push("Legal disputes will be handled under specific laws");
      bullets.push("You may need to resolve issues in a particular location");
      break;
    case "CHANGES TO TERMS":
    case "MODIFICATIONS":
      bullets.push("These terms can change at any time");
      bullets.push("Continued use means you accept any changes");
      break;
    default:
      // Extract key sentences for other sections
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const keyPoints = sentences.slice(0, Math.min(2, sentences.length));
      
      keyPoints.forEach(point => {
        const simplified = point.trim()
          .replace(/shall/g, "will")
          .replace(/pursuant to/g, "according to")
          .replace(/in accordance with/g, "following")
          .replace(/herein/g, "in this document")
          .replace(/therein/g, "in that")
          .replace(/heretofore/g, "previously")
          .replace(/hereinafter/g, "from now on");
        
        bullets.push(simplified);
      });
  }
  
  return bullets;
}

// Helper function to generate explanations for risky clauses
function generateExplanation(category, term) {
  switch (category) {
    case "Account Termination":
      return "The company can shut down your account, potentially without warning you first.";
    case "Liability Limitation":
      return "The company limits their responsibility for damages, even if something goes wrong with their service.";
    case "Warranty Disclaimer":
      return "The service is provided 'as is' with no guarantees about quality or reliability.";
    case "Privacy":
      return "This explains how your personal information is collected and used.";
    case "Dispute Resolution":
      return "You may be required to use arbitration instead of going to court if you have a dispute.";
    case "Legal Rights":
      return "You may be giving up certain legal rights, such as the ability to join a class action lawsuit.";
    case "Terms Changes":
      return "The company can change the rules at any time, often without directly notifying you.";
    case "Data Usage":
      return "This explains how the company can use data they collect from you.";
    case "Consent":
      return "By agreeing to these terms, you're giving permission for certain actions.";
    case "Third Party Sharing":
      return "Your information may be shared with other companies or services.";
    default:
      return "This clause may affect your rights or obligations when using the service.";
  }
}


