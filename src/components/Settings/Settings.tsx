import { observer } from 'mobx';
import { useTranslation } from 'react-i18next';
import { settingsStore, Language, Theme } from '../../stores';

const Settings = observer(function Settings() {
  const { t, i18n } = useTranslation();
  
  const handleLanguageChange = (lang: Language) => {
    settingsStore.setLanguage(lang);
    i18n.changeLanguage(lang);
  };
  
  const handleThemeChange = (theme: Theme) => {
    settingsStore.setTheme(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        settingsStore.setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-6">{t('settings.title')}</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">{t('settings.language')}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-4 py-2 rounded transition ${
                settingsStore.language === 'en' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('vi')}
              className={`px-4 py-2 rounded transition ${
                settingsStore.language === 'vi' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Tiếng Việt
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">{t('settings.theme')}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`px-4 py-2 rounded transition ${
                settingsStore.theme === 'light' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              ☀️ {t('settings.light')}
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`px-4 py-2 rounded transition ${
                settingsStore.theme === 'dark' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              🌙 {t('settings.dark')}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">{t('settings.avatar')}</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {settingsStore.avatar ? (
                <img src={settingsStore.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <label className="px-4 py-2 bg-blue-600 rounded cursor-pointer hover:bg-blue-700 transition">
              {t('settings.uploadAvatar')}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Settings;