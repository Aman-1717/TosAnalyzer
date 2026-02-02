/**
 * Advanced Text Analysis Service for TOS Comparison
 * Implements comprehensive comparison features including content matching,
 * key terms analysis, clause categorization, risk assessment, and readability
 */

const diff = require('diff');

class AdvancedTextAnalysis {
  constructor() {
    // Predefined legal terms for analysis
    this.legalTerms = [
      'liability', 'indemnification', 'arbitration', 'data sharing', 'privacy',
      'termination', 'jurisdiction', 'governing law', 'dispute resolution',
      'intellectual property', 'copyright', 'trademark', 'confidentiality',
      'warranty', 'disclaimer', 'limitation', 'damages', 'breach', 'force majeure',
      'modification', 'amendment', 'severability', 'entire agreement',
      'personal data', 'cookies', 'tracking', 'third party', 'user content',
      'subscription', 'payment', 'refund', 'cancellation', 'suspension'
    ];

    // Risk patterns for assessment
    this.riskPatterns = [
      { pattern: /unlimited liability|no limitation.*liability/i, risk: 'high', type: 'Unlimited Liability' },
      { pattern: /arbitration.*mandatory|binding arbitration/i, risk: 'medium', type: 'Mandatory Arbitration' },
      { pattern: /may.*terminate.*any time|terminate.*without notice/i, risk: 'high', type: 'Arbitrary Termination' },
      { pattern: /share.*data.*third.*party|sell.*information/i, risk: 'high', type: 'Data Sharing' },
      { pattern: /no warranty|as is.*basis|disclaim.*warranties/i, risk: 'medium', type: 'No Warranty' },
      { pattern: /modify.*terms.*any time|change.*agreement.*notice/i, risk: 'medium', type: 'Unilateral Changes' },
      { pattern: /retain.*rights.*content|license.*perpetual/i, risk: 'medium', type: 'Content Rights' },
      { pattern: /class action.*waiver|waive.*right.*class/i, risk: 'high', type: 'Class Action Waiver' }
    ];

    // Clause categories for classification
    this.clauseCategories = {
      'Privacy & Data': [
        /privacy.*policy/i, /data.*collection/i, /personal.*information/i,
        /cookies/i, /tracking/i, /analytics/i, /third.*party.*sharing/i
      ],
      'Liability & Risk': [
        /liability/i, /indemnification/i, /damages/i, /limitation.*liability/i,
        /disclaimer/i, /warranty/i, /force.*majeure/i
      ],
      'Dispute Resolution': [
        /arbitration/i, /jurisdiction/i, /governing.*law/i, /dispute.*resolution/i,
        /class.*action/i, /litigation/i, /court/i
      ],
      'Termination': [
        /termination/i, /suspension/i, /cancellation/i, /end.*service/i,
        /account.*closure/i, /breach/i
      ],
      'Intellectual Property': [
        /intellectual.*property/i, /copyright/i, /trademark/i, /patent/i,
        /user.*content/i, /license/i, /ownership/i
      ],
      'Payment & Billing': [
        /payment/i, /billing/i, /subscription/i, /fee/i, /refund/i,
        /charge/i, /price/i, /cost/i
      ],
      'Service Terms': [
        /service.*availability/i, /uptime/i, /maintenance/i, /modification/i,
        /update/i, /feature/i, /functionality/i
      ]
    };
  }

  /**
   * Perform comprehensive comparison of two TOS documents
   */
  performComprehensiveAnalysis(text1, text2, file1Name, file2Name) {
    const analysis = {
      contentMatching: this.analyzeContentMatching(text1, text2),
      keyTermsAnalysis: this.analyzeKeyTerms(text1, text2),
      clauseCategories: this.analyzeClauses(text1, text2),
      riskAssessment: this.assessRisks(text1, text2),
      readabilityAnalysis: this.analyzeReadability(text1, text2),
      structuralAnalysis: this.analyzeStructure(text1, text2),
      metadata: {
        file1Name,
        file2Name,
        analysisDate: new Date().toISOString(),
        analysisType: 'comprehensive'
      }
    };

    return analysis;
  }

  /**
   * Analyze content matching between documents
   */
  analyzeContentMatching(text1, text2) {
    // Split into sentences for granular comparison
    const sentences1 = this.splitIntoSentences(text1);
    const sentences2 = this.splitIntoSentences(text2);

    const exactMatches = [];
    const partialMatches = [];
    const uniqueToDoc1 = [];
    const uniqueToDoc2 = [];

    // Find exact matches
    sentences1.forEach((sentence1, index1) => {
      const exactMatch = sentences2.find((sentence2, index2) => 
        this.normalizeText(sentence1) === this.normalizeText(sentence2)
      );
      
      if (exactMatch) {
        exactMatches.push({
          text: sentence1,
          doc1Index: index1,
          doc2Index: sentences2.indexOf(exactMatch)
        });
      } else {
        // Check for partial matches
        const partialMatch = this.findBestPartialMatch(sentence1, sentences2);
        if (partialMatch.similarity > 0.7) {
          partialMatches.push({
            doc1Text: sentence1,
            doc2Text: partialMatch.text,
            similarity: partialMatch.similarity,
            doc1Index: index1,
            doc2Index: partialMatch.index
          });
        } else {
          uniqueToDoc1.push({ text: sentence1, index: index1 });
        }
      }
    });

    // Find sentences unique to document 2
    sentences2.forEach((sentence2, index2) => {
      const hasMatch = exactMatches.some(match => match.doc2Index === index2) ||
                      partialMatches.some(match => match.doc2Index === index2);
      
      if (!hasMatch) {
        uniqueToDoc2.push({ text: sentence2, index: index2 });
      }
    });

    return {
      exactMatches: exactMatches.length,
      partialMatches: partialMatches.length,
      uniqueToDoc1: uniqueToDoc1.length,
      uniqueToDoc2: uniqueToDoc2.length,
      matchDetails: {
        exact: exactMatches.slice(0, 10), // Limit for performance
        partial: partialMatches.slice(0, 10),
        unique1: uniqueToDoc1.slice(0, 10),
        unique2: uniqueToDoc2.slice(0, 10)
      },
      overallSimilarity: this.calculateOverallSimilarity(text1, text2)
    };
  }

  /**
   * Analyze key terms frequency and distribution
   */
  analyzeKeyTerms(text1, text2) {
    const terms1 = this.extractTermFrequency(text1);
    const terms2 = this.extractTermFrequency(text2);

    const comparison = {};
    const allTerms = new Set([...Object.keys(terms1), ...Object.keys(terms2)]);

    allTerms.forEach(term => {
      comparison[term] = {
        doc1Count: terms1[term] || 0,
        doc2Count: terms2[term] || 0,
        difference: (terms2[term] || 0) - (terms1[term] || 0),
        significance: this.calculateTermSignificance(term, terms1[term] || 0, terms2[term] || 0)
      };
    });

    return {
      termComparison: comparison,
      doc1TopTerms: this.getTopTerms(terms1, 10),
      doc2TopTerms: this.getTopTerms(terms2, 10),
      significantDifferences: this.getSignificantDifferences(comparison)
    };
  }

  /**
   * Analyze and categorize clauses
   */
  analyzeClauses(text1, text2) {
    const clauses1 = this.categorizeClauses(text1);
    const clauses2 = this.categorizeClauses(text2);

    const comparison = {};
    Object.keys(this.clauseCategories).forEach(category => {
      comparison[category] = {
        doc1Count: clauses1[category]?.length || 0,
        doc2Count: clauses2[category]?.length || 0,
        doc1Clauses: clauses1[category] || [],
        doc2Clauses: clauses2[category] || [],
        difference: (clauses2[category]?.length || 0) - (clauses1[category]?.length || 0)
      };
    });

    return comparison;
  }

  /**
   * Assess risks in both documents
   */
  assessRisks(text1, text2) {
    const risks1 = this.identifyRisks(text1);
    const risks2 = this.identifyRisks(text2);

    return {
      doc1Risks: risks1,
      doc2Risks: risks2,
      riskComparison: this.compareRisks(risks1, risks2),
      overallRiskLevel: {
        doc1: this.calculateOverallRisk(risks1),
        doc2: this.calculateOverallRisk(risks2)
      }
    };
  }

  /**
   * Analyze readability of documents
   */
  analyzeReadability(text1, text2) {
    return {
      doc1: this.calculateReadabilityMetrics(text1),
      doc2: this.calculateReadabilityMetrics(text2),
      comparison: this.compareReadability(text1, text2)
    };
  }

  /**
   * Analyze document structure and length
   */
  analyzeStructure(text1, text2) {
    return {
      doc1: this.getStructuralMetrics(text1),
      doc2: this.getStructuralMetrics(text2),
      comparison: this.compareStructure(text1, text2)
    };
  }

  // Helper methods
  splitIntoSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  }

  normalizeText(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  findBestPartialMatch(sentence, sentences) {
    let bestMatch = { text: '', similarity: 0, index: -1 };
    
    sentences.forEach((candidate, index) => {
      const similarity = this.calculateSimilarity(sentence, candidate);
      if (similarity > bestMatch.similarity) {
        bestMatch = { text: candidate, similarity, index };
      }
    });

    return bestMatch;
  }

  calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  calculateOverallSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return Math.round((intersection.size / union.size) * 100);
  }

  extractTermFrequency(text) {
    const frequency = {};
    const words = text.toLowerCase().split(/\s+/);
    
    this.legalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        frequency[term] = matches.length;
      }
    });

    return frequency;
  }

  getTopTerms(termFreq, limit) {
    return Object.entries(termFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([term, count]) => ({ term, count }));
  }

  calculateTermSignificance(term, count1, count2) {
    const totalMentions = count1 + count2;
    const difference = Math.abs(count1 - count2);
    return totalMentions > 0 ? (difference / totalMentions) : 0;
  }

  getSignificantDifferences(comparison) {
    return Object.entries(comparison)
      .filter(([term, data]) => data.significance > 0.5)
      .sort(([,a], [,b]) => b.significance - a.significance)
      .slice(0, 10);
  }

  categorizeClauses(text) {
    const categorized = {};
    const sentences = this.splitIntoSentences(text);

    Object.entries(this.clauseCategories).forEach(([category, patterns]) => {
      categorized[category] = sentences.filter(sentence => 
        patterns.some(pattern => pattern.test(sentence))
      );
    });

    return categorized;
  }

  identifyRisks(text) {
    const risks = [];
    
    this.riskPatterns.forEach(({ pattern, risk, type }) => {
      const matches = text.match(pattern);
      if (matches) {
        risks.push({
          type,
          riskLevel: risk,
          matches: matches.length,
          description: `Found ${matches.length} instance(s) of ${type.toLowerCase()}`
        });
      }
    });

    return risks;
  }

  compareRisks(risks1, risks2) {
    const allRiskTypes = new Set([
      ...risks1.map(r => r.type),
      ...risks2.map(r => r.type)
    ]);

    const comparison = {};
    allRiskTypes.forEach(type => {
      const risk1 = risks1.find(r => r.type === type);
      const risk2 = risks2.find(r => r.type === type);
      
      comparison[type] = {
        doc1: risk1 ? risk1.riskLevel : 'none',
        doc2: risk2 ? risk2.riskLevel : 'none',
        change: this.determineRiskChange(risk1?.riskLevel, risk2?.riskLevel)
      };
    });

    return comparison;
  }

  calculateOverallRisk(risks) {
    if (risks.length === 0) return 'low';
    
    const highRisks = risks.filter(r => r.riskLevel === 'high').length;
    const mediumRisks = risks.filter(r => r.riskLevel === 'medium').length;
    
    if (highRisks > 2) return 'high';
    if (highRisks > 0 || mediumRisks > 3) return 'medium';
    return 'low';
  }

  determineRiskChange(risk1, risk2) {
    const riskLevels = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 };
    const level1 = riskLevels[risk1] || 0;
    const level2 = riskLevels[risk2] || 0;
    
    if (level2 > level1) return 'increased';
    if (level2 < level1) return 'decreased';
    return 'unchanged';
  }

  calculateReadabilityMetrics(text) {
    const sentences = this.splitIntoSentences(text);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);
    
    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      syllableCount: syllables,
      averageWordsPerSentence: Math.round(words.length / sentences.length),
      averageSyllablesPerWord: Math.round((syllables / words.length) * 100) / 100,
      fleschScore: Math.round(fleschScore),
      readingLevel: this.getReadingLevel(fleschScore)
    };
  }

  countSyllables(text) {
    // Simple syllable counting algorithm
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;
    
    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;
      
      const vowels = word.match(/[aeiouy]+/g);
      syllableCount += vowels ? vowels.length : 1;
      
      // Adjust for silent e
      if (word.endsWith('e')) syllableCount--;
      if (syllableCount === 0) syllableCount = 1;
    });
    
    return syllableCount;
  }

  getReadingLevel(fleschScore) {
    if (fleschScore >= 90) return 'Very Easy';
    if (fleschScore >= 80) return 'Easy';
    if (fleschScore >= 70) return 'Fairly Easy';
    if (fleschScore >= 60) return 'Standard';
    if (fleschScore >= 50) return 'Fairly Difficult';
    if (fleschScore >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  compareReadability(text1, text2) {
    const metrics1 = this.calculateReadabilityMetrics(text1);
    const metrics2 = this.calculateReadabilityMetrics(text2);
    
    return {
      fleschScoreDifference: metrics2.fleschScore - metrics1.fleschScore,
      wordCountDifference: metrics2.wordCount - metrics1.wordCount,
      complexityChange: metrics2.fleschScore > metrics1.fleschScore ? 'simpler' : 'more complex',
      recommendation: this.getReadabilityRecommendation(metrics1, metrics2)
    };
  }

  getReadabilityRecommendation(metrics1, metrics2) {
    if (metrics2.fleschScore > metrics1.fleschScore + 10) {
      return 'Document 2 is significantly easier to read';
    } else if (metrics1.fleschScore > metrics2.fleschScore + 10) {
      return 'Document 1 is significantly easier to read';
    }
    return 'Both documents have similar readability levels';
  }

  getStructuralMetrics(text) {
    const sentences = this.splitIntoSentences(text);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      averageWordsPerSentence: Math.round(words.length / sentences.length),
      averageSentencesPerParagraph: Math.round(sentences.length / paragraphs.length),
      characterCount: text.length
    };
  }

  compareStructure(text1, text2) {
    const struct1 = this.getStructuralMetrics(text1);
    const struct2 = this.getStructuralMetrics(text2);
    
    return {
      wordCountChange: struct2.wordCount - struct1.wordCount,
      sentenceCountChange: struct2.sentenceCount - struct1.sentenceCount,
      paragraphCountChange: struct2.paragraphCount - struct1.paragraphCount,
      lengthChangePercentage: Math.round(((struct2.wordCount - struct1.wordCount) / struct1.wordCount) * 100),
      structuralComplexityChange: this.determineComplexityChange(struct1, struct2)
    };
  }

  determineComplexityChange(struct1, struct2) {
    const complexity1 = struct1.averageWordsPerSentence + struct1.averageSentencesPerParagraph;
    const complexity2 = struct2.averageWordsPerSentence + struct2.averageSentencesPerParagraph;
    
    if (complexity2 > complexity1 + 5) return 'more complex';
    if (complexity1 > complexity2 + 5) return 'less complex';
    return 'similar complexity';
  }
}

module.exports = AdvancedTextAnalysis;
