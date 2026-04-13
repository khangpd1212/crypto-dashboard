import { makeAutoObservable } from "mobx";
import { Language, Theme } from "@/types/common";

class SettingsState {
  language: Language = Language.English;
  theme: Theme = Theme.Light;
  avatar: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  setLanguage(lang: Language) {
    this.language = lang;
    localStorage.setItem("crypto-dashboard-lang", lang);
  }

  setTheme(t: Theme) {
    this.theme = t;
    localStorage.setItem("crypto-dashboard-theme", t);
  }

  setAvatar(data: string | null) {
    this.avatar = data;
  }

  private loadFromStorage() {
    const lang = localStorage.getItem("crypto-dashboard-lang") as Language;
    const theme = localStorage.getItem("crypto-dashboard-theme") as Theme;
    const avatar = localStorage.getItem("crypto-dashboard-avatar");

    if (lang) this.language = lang;
    if (theme) this.theme = theme;
    if (avatar) this.avatar = avatar;
  }
}

export const settingsStore = new SettingsState();
