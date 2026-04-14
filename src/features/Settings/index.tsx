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
      <div className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white/95 dark:bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.16)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl p-8">
        <h2 className="text-3xl font-semibold mb-4">{t("settings.title")}</h2>
        <p className="text-sm text-(--text-muted) mb-6">
          {t("settings.subtitle") ||
            "Fine-tune the cockpit, language, and profile details."}
        </p>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.04)] dark:bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">
              {t("settings.language")}
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleLanguageChange(Language.English)}
                className={`rounded-2xl border border-[rgba(15,23,42,0.08)] px-4 py-3 text-sm font-semibold transition duration-200 ${
                  settingsStore.language === Language.English
                    ? "bg-(--accent) text-white shadow-[0_8px_24px_rgba(79,93,255,0.18)]"
                    : "bg-[rgba(15,23,42,0.06)] dark:bg-white/5 text-(--text) hover:bg-[rgba(15,23,42,0.08)] dark:hover:bg-white/10"
                }`}>
                {t("settings.english")}
              </button>
              <button
                onClick={() => handleLanguageChange(Language.Vietnamese)}
                className={`rounded-2xl border border-[rgba(15,23,42,0.08)] px-4 py-3 text-sm font-semibold transition duration-200 ${
                  settingsStore.language === Language.Vietnamese
                    ? "bg-(--accent) text-white shadow-[0_8px_24px_rgba(79,93,255,0.18)]"
                    : "bg-[rgba(15,23,42,0.06)] dark:bg-white/5 text-(--text) hover:bg-[rgba(15,23,42,0.08)] dark:hover:bg-white/10"
                }`}>
                {t("settings.vietnamese")}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.04)] dark:bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">
              {t("settings.theme")}
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleThemeChange(Theme.Light)}
                className={`rounded-2xl border border-[rgba(15,23,42,0.08)] px-4 py-3 text-sm font-semibold transition duration-200 ${
                  settingsStore.theme === Theme.Light
                    ? "bg-(--accent) text-white shadow-[0_8px_24px_rgba(79,93,255,0.18)]"
                    : "bg-[rgba(15,23,42,0.06)] dark:bg-white/5 text-(--text) hover:bg-[rgba(15,23,42,0.08)] dark:hover:bg-white/10"
                }`}>
                ☀️ {t("settings.light")}
              </button>
              <button
                onClick={() => handleThemeChange(Theme.Dark)}
                className={`rounded-2xl border border-(--border) px-4 py-3 text-sm font-semibold transition duration-200 ${
                  settingsStore.theme === Theme.Dark
                    ? "bg-(--accent) text-white shadow-[0_8px_24px_rgba(79,93,255,0.18)]"
                    : "bg-[rgba(15,23,42,0.06)] dark:bg-white/5 text-(--text) hover:bg-[rgba(15,23,42,0.08)] dark:hover:bg-white/10"
                }`}>
                🌙 {t("settings.dark")}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.04)] dark:bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">
              {t("settings.avatar")}
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[rgba(15,23,42,0.05)] dark:bg-white/5 flex items-center justify-center overflow-hidden border border-[rgba(15,23,42,0.08)]">
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
              <label className="rounded-2xl border border-(--accent-border) bg-(--accent) px-4 py-3 text-sm font-semibold text-white cursor-pointer transition duration-200 hover:opacity-90">
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
