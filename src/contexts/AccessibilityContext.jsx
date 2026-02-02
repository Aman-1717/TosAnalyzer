import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  // Text Customization States
  const [fontSize, setFontSize] = useState('text-base');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [lineSpacing, setLineSpacing] = useState('leading-normal');
  const [letterSpacing, setLetterSpacing] = useState('tracking-normal');
  
  // Contrast States
  const [theme, setTheme] = useState('dark'); // Default to dark since app uses dark theme
  const [contrastMode, setContrastMode] = useState('normal');
  
  // Audio and Speech States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [highlightReading, setHighlightReading] = useState(true);
  const [currentReadingIndex, setCurrentReadingIndex] = useState(-1);
  
  // Language and Accessibility States
  const [language, setLanguage] = useState('en');
  const [magnificationEnabled, setMagnificationEnabled] = useState(false);
  const [onScreenKeyboard, setOnScreenKeyboard] = useState(false);
  const [guidedReading, setGuidedReading] = useState(false);
  const [animationsDisabled, setAnimationsDisabled] = useState(false);
  
  // Settings Management
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Load saved settings from localStorage
  const loadSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('accessibilitySettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setFontSize(settings.fontSize || 'text-base');
        setFontFamily(settings.fontFamily || 'font-sans');
        setLineSpacing(settings.lineSpacing || 'leading-normal');
        setLetterSpacing(settings.letterSpacing || 'tracking-normal');
        setTheme(settings.theme || 'dark');
        setContrastMode(settings.contrastMode || 'normal');
        setSpeechRate(settings.speechRate || 1);
        setHighlightReading(settings.highlightReading !== false);
        setLanguage(settings.language || 'en');
        setMagnificationEnabled(settings.magnificationEnabled || false);
        setGuidedReading(settings.guidedReading || false);
        setAnimationsDisabled(settings.animationsDisabled || false);
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      const settings = {
        fontSize, fontFamily, lineSpacing, letterSpacing,
        theme, contrastMode,
        speechRate, highlightReading, language, magnificationEnabled,
        guidedReading, animationsDisabled
      };
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  // Reset settings to default
  const resetSettings = () => {
    setFontSize('text-base');
    setFontFamily('font-sans');
    setLineSpacing('leading-normal');
    setLetterSpacing('tracking-normal');
    setTheme('dark');
    setContrastMode('normal');
    setSpeechRate(1);
    setHighlightReading(true);
    setLanguage('en');
    setMagnificationEnabled(false);
    setGuidedReading(false);
    setAnimationsDisabled(false);
    localStorage.removeItem('accessibilitySettings');
  };

  // Get contrast classes based on current settings
  const getContrastClasses = () => {
    let classes = '';
    
    if (contrastMode === 'high-contrast') {
      classes = 'bg-black text-white border-white';
    } else if (contrastMode === 'low-contrast') {
      classes = 'bg-gray-100 text-gray-700 border-gray-300';
    } else {
      classes = theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-200';
    }
    
    return classes;
  };

  // Get theme classes
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return 'bg-gray-900 text-white';
    } else if (theme === 'light') {
      return 'bg-white text-gray-800';
    }
    return 'bg-gray-900 text-white'; // Default to dark
  };

  // Get text styling classes
  const getTextClasses = () => {
    return `${fontSize} ${fontFamily} ${lineSpacing} ${letterSpacing}`;
  };

  // Get animation classes
  const getAnimationClasses = () => {
    return animationsDisabled ? 'motion-reduce:transition-none motion-reduce:animate-none' : '';
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System theme - check user preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [theme]);

  // Apply contrast mode to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('high-contrast', 'low-contrast');
    if (contrastMode !== 'normal') {
      root.classList.add(contrastMode);
    }
  }, [contrastMode]);

  // Apply animations setting
  useEffect(() => {
    const root = document.documentElement;
    if (animationsDisabled) {
      root.classList.add('motion-reduce');
    } else {
      root.classList.remove('motion-reduce');
    }
  }, [animationsDisabled]);

  // Load settings on mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'ar', name: 'العربية' }
  ];

  // Translation function
  const translations = {
    en: {
      accessibilityCenter: 'Accessibility Center',
      uploadDocument: 'Upload Your TOS Document',
      textCustomization: 'Text Customization',
      contrast: 'Contrast',
      audioSpeech: 'Audio & Speech',
      languageTools: 'Language & Tools',
      advanced: 'Advanced',
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      lineSpacing: 'Line Spacing',
      letterSpacing: 'Letter Spacing',
      theme: 'Theme',
      contrastMode: 'Contrast Mode',
      speechRate: 'Speech Rate',
      interfaceLanguage: 'Interface Language',
      enableMagnification: 'Enable text magnification on hover',
      accessibilityFeedback: 'Accessibility Feedback',
      sendFeedback: 'Send Feedback',
      viewGuide: 'View Guide',
      voiceSupport: 'Voice Support',
      saveSettings: 'Save Settings',
      resetToDefault: 'Reset to Default',
      readText: 'Read Text',
      stopReading: 'Stop Reading',
      livePreview: 'Live Preview',
      uploadedDocument: 'Uploaded Document',
      noDocument: 'No Document',
      pleaseUpload: 'Please Upload',
      dragDropDocument: 'Drag & drop your TOS document here',
      clickToBrowse: 'or click to browse files',
      supportedFiles: 'Supports PDF, TXT, DOC, DOCX files (max 10MB)',
      processingDocument: 'Processing document...',
      documentUploaded: 'Document uploaded • Ready for accessibility features',
      noDocumentUploaded: 'No document uploaded',
      uploadDocumentAbove: 'Upload your TOS document above to see it here with accessibility features applied',
      languageChangedTo: 'Language changed to'
    },
    es: {
      accessibilityCenter: 'Centro de Accesibilidad',
      uploadDocument: 'Subir su Documento de Términos',
      textCustomization: 'Personalización de Texto',
      contrast: 'Contraste',
      audioSpeech: 'Audio y Voz',
      languageTools: 'Idioma y Herramientas',
      advanced: 'Avanzado',
      fontSize: 'Tamaño de Fuente',
      fontFamily: 'Familia de Fuente',
      lineSpacing: 'Espaciado de Línea',
      letterSpacing: 'Espaciado de Letras',
      theme: 'Tema',
      contrastMode: 'Modo de Contraste',
      speechRate: 'Velocidad de Voz',
      interfaceLanguage: 'Idioma de la Interfaz',
      enableMagnification: 'Habilitar ampliación de texto al pasar el cursor',
      accessibilityFeedback: 'Comentarios de Accesibilidad',
      sendFeedback: 'Enviar Comentarios',
      viewGuide: 'Ver Guía',
      voiceSupport: 'Soporte de Voz',
      saveSettings: 'Guardar Configuración',
      resetToDefault: 'Restablecer por Defecto',
      readText: 'Leer Texto',
      stopReading: 'Detener Lectura',
      livePreview: 'Vista Previa en Vivo',
      uploadedDocument: 'Documento Subido',
      noDocument: 'Sin Documento',
      pleaseUpload: 'Por Favor Subir',
      dragDropDocument: 'Arrastra y suelta tu documento de términos aquí',
      clickToBrowse: 'o haz clic para explorar archivos',
      supportedFiles: 'Soporta archivos PDF, TXT, DOC, DOCX (máx 10MB)',
      processingDocument: 'Procesando documento...',
      documentUploaded: 'Documento subido • Listo para funciones de accesibilidad',
      noDocumentUploaded: 'Ningún documento subido',
      uploadDocumentAbove: 'Sube tu documento de términos arriba para verlo aquí con funciones de accesibilidad aplicadas',
      languageChangedTo: 'Idioma cambiado a'
    },
    it: {
      accessibilityCenter: 'Centro di Accessibilità',
      uploadDocument: 'Carica il Tuo Documento dei Termini',
      textCustomization: 'Personalizzazione del Testo',
      contrast: 'Contrasto',
      audioSpeech: 'Audio e Voce',
      languageTools: 'Lingua e Strumenti',
      advanced: 'Avanzato',
      fontSize: 'Dimensione del Font',
      fontFamily: 'Famiglia del Font',
      lineSpacing: 'Spaziatura delle Righe',
      letterSpacing: 'Spaziatura delle Lettere',
      theme: 'Tema',
      contrastMode: 'Modalità Contrasto',
      speechRate: 'Velocità di Lettura',
      interfaceLanguage: 'Lingua dell\'Interfaccia',
      enableMagnification: 'Abilita ingrandimento del testo al passaggio del mouse',
      accessibilityFeedback: 'Feedback di Accessibilità',
      sendFeedback: 'Invia Feedback',
      viewGuide: 'Visualizza Guida',
      voiceSupport: 'Supporto Vocale',
      saveSettings: 'Salva Impostazioni',
      resetToDefault: 'Ripristina Predefinito',
      readText: 'Leggi Testo',
      stopReading: 'Ferma Lettura',
      livePreview: 'Anteprima dal Vivo',
      uploadedDocument: 'Documento Caricato',
      noDocument: 'Nessun Documento',
      pleaseUpload: 'Si Prega di Caricare',
      dragDropDocument: 'Trascina e rilascia il tuo documento dei termini qui',
      clickToBrowse: 'o clicca per sfogliare i file',
      supportedFiles: 'Supporta file PDF, TXT, DOC, DOCX (max 10MB)',
      processingDocument: 'Elaborazione documento...',
      documentUploaded: 'Documento caricato • Pronto per le funzioni di accessibilità',
      noDocumentUploaded: 'Nessun documento caricato',
      uploadDocumentAbove: 'Carica il tuo documento dei termini sopra per vederlo qui con le funzioni di accessibilità applicate',
      languageChangedTo: 'Lingua cambiata in'
    },
    fr: {
      accessibilityCenter: 'Centre d\'Accessibilité',
      uploadDocument: 'Télécharger Votre Document de Conditions',
      textCustomization: 'Personnalisation du Texte',
      contrast: 'Contraste',
      audioSpeech: 'Audio et Parole',
      languageTools: 'Langue et Outils',
      advanced: 'Avancé',
      fontSize: 'Taille de Police',
      fontFamily: 'Famille de Police',
      lineSpacing: 'Espacement des Lignes',
      letterSpacing: 'Espacement des Lettres',
      theme: 'Thème',
      contrastMode: 'Mode de Contraste',
      speechRate: 'Vitesse de Parole',
      interfaceLanguage: 'Langue de l\'Interface',
      enableMagnification: 'Activer l\'agrandissement du texte au survol',
      accessibilityFeedback: 'Commentaires d\'Accessibilité',
      sendFeedback: 'Envoyer des Commentaires',
      viewGuide: 'Voir le Guide',
      voiceSupport: 'Support Vocal',
      saveSettings: 'Sauvegarder les Paramètres',
      resetToDefault: 'Réinitialiser par Défaut',
      readText: 'Lire le Texte',
      stopReading: 'Arrêter la Lecture',
      livePreview: 'Aperçu en Direct',
      uploadedDocument: 'Document Téléchargé',
      noDocument: 'Aucun Document',
      pleaseUpload: 'Veuillez Télécharger',
      dragDropDocument: 'Glissez-déposez votre document de conditions ici',
      clickToBrowse: 'ou cliquez pour parcourir les fichiers',
      supportedFiles: 'Supporte les fichiers PDF, TXT, DOC, DOCX (max 10MB)',
      processingDocument: 'Traitement du document...',
      documentUploaded: 'Document téléchargé • Prêt pour les fonctions d\'accessibilité',
      noDocumentUploaded: 'Aucun document téléchargé',
      uploadDocumentAbove: 'Téléchargez votre document de conditions ci-dessus pour le voir ici avec les fonctions d\'accessibilité appliquées',
      languageChangedTo: 'Langue changée en'
    },
    de: {
      accessibilityCenter: 'Barrierefreiheitszentrum',
      uploadDocument: 'Ihr AGB-Dokument Hochladen',
      textCustomization: 'Text-Anpassung',
      contrast: 'Kontrast',
      audioSpeech: 'Audio und Sprache',
      languageTools: 'Sprache und Tools',
      advanced: 'Erweitert',
      fontSize: 'Schriftgröße',
      fontFamily: 'Schriftfamilie',
      lineSpacing: 'Zeilenabstand',
      letterSpacing: 'Buchstabenabstand',
      theme: 'Design',
      contrastMode: 'Kontrast-Modus',
      speechRate: 'Sprechgeschwindigkeit',
      interfaceLanguage: 'Oberflächensprache',
      enableMagnification: 'Text-Vergrößerung beim Überfahren aktivieren',
      accessibilityFeedback: 'Barrierefreiheits-Feedback',
      sendFeedback: 'Feedback Senden',
      viewGuide: 'Anleitung Anzeigen',
      voiceSupport: 'Sprachunterstützung',
      saveSettings: 'Einstellungen Speichern',
      resetToDefault: 'Auf Standard Zurücksetzen',
      readText: 'Text Vorlesen',
      stopReading: 'Vorlesen Stoppen',
      livePreview: 'Live-Vorschau',
      uploadedDocument: 'Hochgeladenes Dokument',
      noDocument: 'Kein Dokument',
      pleaseUpload: 'Bitte Hochladen',
      dragDropDocument: 'Ziehen Sie Ihr AGB-Dokument hierher',
      clickToBrowse: 'oder klicken Sie zum Durchsuchen',
      supportedFiles: 'Unterstützt PDF, TXT, DOC, DOCX Dateien (max 10MB)',
      processingDocument: 'Dokument wird verarbeitet...',
      documentUploaded: 'Dokument hochgeladen • Bereit für Barrierefreiheitsfunktionen',
      noDocumentUploaded: 'Kein Dokument hochgeladen',
      uploadDocumentAbove: 'Laden Sie Ihr AGB-Dokument oben hoch, um es hier mit angewendeten Barrierefreiheitsfunktionen zu sehen',
      languageChangedTo: 'Sprache geändert zu'
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  // Font family options
  const fontFamilies = [
    { value: 'font-sans', name: 'Sans Serif (Default)' },
    { value: 'font-serif', name: 'Serif' },
    { value: 'font-mono', name: 'Monospace' },
    { value: 'font-dyslexic', name: 'Dyslexia Friendly' }
  ];

  const value = {
    // States
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    lineSpacing, setLineSpacing,
    letterSpacing, setLetterSpacing,
    theme, setTheme,
    contrastMode, setContrastMode,
    isSpeaking, setIsSpeaking,
    speechRate, setSpeechRate,
    highlightReading, setHighlightReading,
    currentReadingIndex, setCurrentReadingIndex,
    language, setLanguage,
    magnificationEnabled, setMagnificationEnabled,
    onScreenKeyboard, setOnScreenKeyboard,
    guidedReading, setGuidedReading,
    animationsDisabled, setAnimationsDisabled,
    settingsSaved,
    
    // Functions
    saveSettings,
    resetSettings,
    getContrastClasses,
    getThemeClasses,
    getTextClasses,
    getAnimationClasses,

    // Data arrays
    languages,
    fontFamilies,

    // Translation function
    t
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
