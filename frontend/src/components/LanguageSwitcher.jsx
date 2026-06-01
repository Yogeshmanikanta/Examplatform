import { useTranslation } from 'react-i18next';

const FONT = "'Plus Jakarta Sans', sans-serif";

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'te', label: 'తె' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2);

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          style={{
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: current === code ? '#bfdbfe' : '#e2e8f0',
            background: current === code ? '#eff6ff' : '#f8fafc',
            color: current === code ? '#2563eb' : '#64748b',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: FONT,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}