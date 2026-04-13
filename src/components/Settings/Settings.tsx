import { useStore } from "@/stores";
import { Language, Theme } from "@/types/common";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

const Settings = observer(function Settings() {
  const { settingsStore } = useStore();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: Language) => {
    settingsStore.setLanguage(lang);
    i18n.changeLanguage(lang as unknown as string);
  };

  const handleThemeChange = (theme: Theme) => {
    settingsStore.setTheme(theme);
    document.documentElement.classList.toggle("dark", theme === Theme.Dark);
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
    <div className="max-w-xl space-y-6">
      <div className="panel glass-panel">
        <h2 className="text-3xl font-semibold mb-4">{t("settings.title")}</h2>
        <p className="text-sm text-white/65 mb-6">
          {t("settings.subtitle") || 'Fine-tune the cockpit, language, and profile details.'}
        </p>

        <div className="space-y-6">
          <div className="glass-panel p-5 border border-white/10">
            <h3 className="text-lg font-semibold mb-3">{t("settings.language")}</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleLanguageChange(Language.English)}
                className={`btn ${settingsStore.language === Language.English ? 'btn-accent' : ''}`}>
                English
              </button>
              <button
                onClick={() => handleLanguageChange(Language.Vietnamese)}
                className={`btn ${settingsStore.language === Language.Vietnamese ? 'btn-accent' : ''}`}>
                Tiếng Việt
              </button>
            </div>
          </div>

          <div className="glass-panel p-5 border border-white/10">
            <h3 className="text-lg font-semibold mb-3">{t("settings.theme")}</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleThemeChange(Theme.Light)}
                className={`btn ${settingsStore.theme === Theme.Light ? 'btn-accent' : ''}`}>
                ☀️ {t("settings.light")}
              </button>
              <button
                onClick={() => handleThemeChange(Theme.Dark)}
                className={`btn ${settingsStore.theme === Theme.Dark ? 'btn-accent' : ''}`}>
                🌙 {t("settings.dark")}
              </button>
            </div>
          </div>

          <div className="glass-panel p-5 border border-white/10">
            <h3 className="text-lg font-semibold mb-3">{t("settings.avatar")}</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                {settingsStore.avatar ? (
                  <img
                    src={settingsStore.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <label className="btn btn-accent cursor-pointer">
                {t("settings.uploadAvatar")}
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
    </div>
  );
});

export default Settings;
