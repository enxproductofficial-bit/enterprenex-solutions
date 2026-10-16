export type Language =
  | 'en'
  | 'hi'
  | 'mr'
  | 'te'
  | 'ta'
  | 'kn'
  | 'bn'
  | 'gu'
  | 'es'
  | 'de';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English (Official)' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी (Maharashtra)' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ (Kannada)' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা (Bengali)' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી (Gujarati)' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español (Global)' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch (Corporate)' }
];
