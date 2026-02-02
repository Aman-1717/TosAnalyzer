// Dictionary of legal terms and their simplified equivalents
const legalTerms = {
  "aforementioned": "previously mentioned",
  "pursuant to": "according to",
  "hereinafter": "from now on",
  "notwithstanding": "despite",
  "in accordance with": "following",
  "in the event that": "if",
  "prior to": "before",
  "subsequent to": "after",
  "with respect to": "about",
  "in lieu of": "instead of",
  "deemed to be": "considered",
  "for the purpose of": "to",
  "in the absence of": "without",
  "in connection with": "related to",
  "shall be entitled to": "can",
  "shall not be entitled to": "cannot",
  "at the discretion of": "decided by",
  "in excess of": "more than",
  "in the amount of": "for",
  "on the grounds that": "because",
  "for the duration of": "during",
  "in the course of": "during",
  "subject to": "depending on",
  "in relation to": "about",
  "in the vicinity of": "near",
  "in perpetuity": "forever",
  "terminate": "end",
  "remuneration": "payment",
  "endeavor": "try",
  "utilize": "use",
  "commence": "begin",
  "constitute": "form",
  "pursuant": "according",
  "hereunder": "in this document",
  "herein": "in this document",
  "therein": "in that",
  "thereof": "of that",
  "thereto": "to that",
  "therewith": "with that",
  "whereby": "by which",
  "wherein": "in which",
  "whereof": "of which",
  "arbitration": "dispute resolution process",
  "indemnify": "compensate",
  "liability": "legal responsibility",
  "jurisdiction": "legal authority",
  "waiver": "giving up a right",
  "covenant": "promise",
  "severability": "independence of terms",
  "force majeure": "unforeseeable circumstances",
  // Add more common terms
  "terms and conditions": "rules",
  "privacy policy": "privacy rules",
  "third party": "other companies",
  "third parties": "other companies",
  "intellectual property": "creative work",
  "proprietary": "owned",
  "confidential information": "private information",
  "at our sole discretion": "as we decide",
  "without prior notice": "without telling you first",
  "may from time to time": "sometimes",
  "shall remain in effect": "will continue",
  "you acknowledge and agree": "you accept",
  "we reserve the right": "we can choose",
  "you represent and warrant": "you promise",
  "for any reason whatsoever": "for any reason",
  "to the extent permitted by law": "when legally allowed"
};

// Phrases that often introduce important clauses
const importantPhrases = [
  "you agree to",
  "you acknowledge",
  "you consent to",
  "you represent and warrant",
  "you understand",
  "you accept",
  "you will not",
  "you must",
  "you shall",
  "we reserve the right",
  "we may",
  "we can",
  "we are not responsible",
  "we are not liable",
  "without limitation",
  "at our sole discretion",
  "privacy",
  "data",
  "information",
  "collect",
  "share",
  "third party",
  "cancel",
  "terminate",
  "refund",
  "payment",
  "subscription",
  "automatically renew"
];

/**
 * Simplifies text by replacing complex terms and improving readability
 * @param {string} text - The text to simplify
 * @returns {string} - The simplified text
 */
function simplifyText(text) {
  // If text is very short or doesn't seem like a legal document, add explanatory note
  if (text.length < 500 || !containsLegalLanguage(text)) {
    return addSimplificationNote(text);
  }
  
  let simplifiedText = text;
  
  // Replace legal terms with simpler alternatives
  Object.entries(legalTerms).forEach(([term, simple]) => {
    // Create a regex that matches the term as a whole word, case insensitive
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    simplifiedText = simplifiedText.replace(regex, simple);
  });
  
  // Simplify common sentence structures
  simplifiedText = simplifiedText
    // Replace "party of the first part" type phrases
    .replace(/party of the (first|second) part/gi, 'the $1 party')
    // Simplify "shall" to "will" or "must"
    .replace(/\b(shall)\b/gi, 'will')
    // Simplify "such" used as a determiner
    .replace(/\bsuch\s+(\w+)\b/gi, 'this $1')
    // Simplify double negatives
    .replace(/\bnot\s+invalid\b/gi, 'valid')
    .replace(/\bnot\s+insignificant\b/gi, 'significant')
    // Break up long sentences at semicolons
    .replace(/;/g, '.\n');
  
  // Simplify long sentences (more than 30 words)
  const sentences = simplifiedText.match(/[^.!?]+[.!?]+/g) || [];
  simplifiedText = sentences.map(sentence => {
    const words = sentence.trim().split(/\s+/);
    if (words.length > 30) {
      // Try to break at conjunctions or commas
      return breakLongSentence(sentence);
    }
    return sentence;
  }).join(' ');
  
  // Add paragraph breaks for readability (after periods followed by spaces)
  simplifiedText = simplifiedText.replace(/\.\s+/g, '.\n\n');
  
  // Add summary at the beginning
  simplifiedText = addSummary(text) + "\n\n" + simplifiedText;
  
  return simplifiedText;
}

/**
 * Checks if text contains legal language
 * @param {string} text - The text to check
 * @returns {boolean} - Whether the text contains legal language
 */
function containsLegalLanguage(text) {
  const legalIndicators = [
    "terms", "conditions", "agreement", "privacy", "policy",
    "rights", "obligations", "liability", "warranty", "disclaims",
    "consent", "authorize", "legal", "law", "jurisdiction",
    "arbitration", "dispute", "termination", "intellectual property"
  ];
  
  const lowerText = text.toLowerCase();
  return legalIndicators.some(term => lowerText.includes(term));
}

/**
 * Adds a note for non-legal documents
 * @param {string} text - The original text
 * @returns {string} - Text with explanatory note
 */
function addSimplificationNote(text) {
  return "NOTE: This doesn't appear to be a standard legal document, so minimal simplification was applied.\n\n" + text;
}

/**
 * Breaks a long sentence into smaller parts
 * @param {string} sentence - The long sentence
 * @returns {string} - Broken up sentence
 */
function breakLongSentence(sentence) {
  // Try to break at conjunctions or commas
  return sentence
    .replace(/,\s+and\s+/g, '.\n')
    .replace(/,\s+but\s+/g, '.\n')
    .replace(/,\s+however\s+/g, '.\n')
    .replace(/,\s+therefore\s+/g, '.\n')
    .replace(/,\s+consequently\s+/g, '.\n')
    .replace(/,\s+nevertheless\s+/g, '.\n')
    .replace(/,\s+moreover\s+/g, '.\n')
    .replace(/,\s+furthermore\s+/g, '.\n')
    .replace(/,\s+additionally\s+/g, '.\n');
}

/**
 * Creates a brief summary of the document
 * @param {string} text - The original text
 * @returns {string} - A summary
 */
function addSummary(text) {
  // Create a simple summary based on document type detection
  let summary = "SIMPLIFIED SUMMARY:\n";
  
  if (text.toLowerCase().includes("privacy policy")) {
    summary += "This is a Privacy Policy that explains how your data is collected and used.";
  } else if (text.toLowerCase().includes("terms of service") || text.toLowerCase().includes("terms and conditions")) {
    summary += "This is a Terms of Service document that outlines the rules for using a service.";
  } else if (text.toLowerCase().includes("end user license agreement") || text.toLowerCase().includes("eula")) {
    summary += "This is an End User License Agreement that explains how you can use the software.";
  } else if (text.toLowerCase().includes("cookie policy")) {
    summary += "This is a Cookie Policy that explains how cookies are used on a website.";
  } else {
    summary += "This document contains legal terms that may affect your rights.";
  }
  
  return summary;
}

/**
 * Identifies potentially risky clauses in text
 * @param {string} text - The text to analyze
 * @returns {Array} - Array of objects containing risky clauses
 */
function identifyRiskyClauses(text) {
  // If text is very short, return a note about insufficient content
  if (text.length < 500) {
    return [{
      type: "Insufficient Content",
      explanation: "The document is too short to perform a meaningful risk analysis.",
      text: "Please provide a complete Terms of Service document for proper analysis."
    }];
  }
  
  const riskyClauses = [];
  
  // Define patterns for different types of risky clauses
  const riskPatterns = [
    {
      type: "Data Collection",
      patterns: [
        /collect.*personal.*data/i,
        /collect.*information/i,
        /track.*usage/i,
        /monitor.*activity/i,
        /use.*cookies/i,
        /share.*information/i,
        /sell.*data/i,
        /personal information/i,
        /data.*processing/i,
        /information.*gather/i
      ],
      explanation: "This clause allows the company to collect and possibly share your personal data."
    },
    {
      type: "Arbitration Clause",
      patterns: [
        /arbitration/i,
        /waive.*right.*sue/i,
        /waive.*class action/i,
        /dispute.*resolution/i,
        /binding.*arbitration/i,
        /resolve disputes/i,
        /settle.*disagreements/i
      ],
      explanation: "You waive your right to sue in court and participate in class actions."
    },
    {
      type: "Unilateral Changes",
      patterns: [
        /change.*terms/i,
        /modify.*agreement/i,
        /update.*policy/i,
        /sole discretion/i,
        /without notice/i,
        /reserves the right/i,
        /may amend/i,
        /may revise/i
      ],
      explanation: "The company can change the terms at any time, possibly without notifying you."
    },
    {
      type: "Limitation of Liability",
      patterns: [
        /not liable/i,
        /no liability/i,
        /limit.*liability/i,
        /not responsible/i,
        /disclaim.*warranty/i,
        /as is/i,
        /no warranty/i,
        /without warranty/i,
        /no guarantee/i
      ],
      explanation: "The company limits its liability for damages, even if caused by their product or service."
    },
    {
      type: "Auto-Renewal",
      patterns: [
        /automatic.*renew/i,
        /auto.*renew/i,
        /continue.*billing/i,
        /subscription.*renew/i,
        /recurring.*payment/i,
        /charged.*automatically/i
      ],
      explanation: "Your subscription will automatically renew and you'll be charged unless you cancel."
    },
    {
      type: "Content License",
      patterns: [
        /license.*content/i,
        /right.*use.*content/i,
        /intellectual property/i,
        /perpetual license/i,
        /irrevocable license/i,
        /royalty-free/i,
        /worldwide license/i,
        /right to use/i
      ],
      explanation: "You grant the company extensive rights to use content you create or upload."
    },
    {
      type: "Termination Rights",
      patterns: [
        /terminate.*account/i,
        /suspend.*service/i,
        /cancel.*any time/i,
        /discontinue.*service/i,
        /end.*service/i,
        /delete.*account/i,
        /remove.*content/i
      ],
      explanation: "The company can terminate your account or access to the service at their discretion."
    },
    {
      type: "Third-Party Sharing",
      patterns: [
        /third part(y|ies)/i,
        /share.*with partners/i,
        /disclose.*information/i,
        /transfer.*data/i,
        /provide.*information to/i,
        /affiliates/i
      ],
      explanation: "Your information may be shared with other companies or organizations."
    }
  ];
  
  // Add a generic risk for any document to ensure we return something
  if (containsLegalLanguage(text)) {
    riskyClauses.push({
      type: "Legal Document",
      explanation: "This appears to be a legal document that may contain terms affecting your rights.",
      text: "It's recommended to read the full document carefully before agreeing to its terms."
    });
  }
  
  // Check each paragraph for risky patterns
  const paragraphs = text.split(/\n\s*\n/);
  
  paragraphs.forEach(paragraph => {
    // Skip very short paragraphs
    if (paragraph.trim().length < 20) return;
    
    riskPatterns.forEach(risk => {
      // Check if any pattern matches
      const matches = risk.patterns.some(pattern => pattern.test(paragraph));
      
      if (matches) {
        // Add to risky clauses if not already added with same type
        const alreadyAdded = riskyClauses.some(clause => 
          clause.type === risk.type && clause.text === paragraph.trim()
        );
        
        if (!alreadyAdded) {
          riskyClauses.push({
            type: risk.type,
            explanation: risk.explanation,
            text: paragraph.trim()
          });
        }
      }
    });
    
    // Also check for important phrases
    importantPhrases.forEach(phrase => {
      if (paragraph.toLowerCase().includes(phrase.toLowerCase())) {
        // Add as a general important clause
        const alreadyAdded = riskyClauses.some(clause => 
          clause.text === paragraph.trim()
        );
        
        if (!alreadyAdded) {
          riskyClauses.push({
            type: "Important Clause",
            explanation: "This clause contains important terms you should review carefully.",
            text: paragraph.trim()
          });
        }
      }
    });
  });
  
  // If no specific risks were found (beyond the generic one), add a note
  if (riskyClauses.length <= 1) {
    riskyClauses.push({
      type: "Analysis Note",
      explanation: "No specific high-risk clauses were identified, but this doesn't guarantee the document is risk-free.",
      text: "Always read legal documents carefully before agreeing to them."
    });
  }
  
  return riskyClauses;
}

module.exports = {
  simplifyText,
  identifyRiskyClauses
};
