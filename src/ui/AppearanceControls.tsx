import { tx } from "./i18n.js";
import type { Language } from "./labels.js";

export type ColorTheme = "light" | "dark";

/**
 * The site uses one clinical visual language. This component only changes
 * color theme; appearance presets (Journal/Compact) were retired in P6.5.
 */
export function AppearanceControls({
  language,
  colorTheme,
  onColorThemeChange,
}: {
  language: Language;
  colorTheme: ColorTheme;
  onColorThemeChange: (theme: ColorTheme) => void;
}) {
  return (
    <div className="appearance-controls">
      <button
        type="button"
        className="theme-toggle"
        onClick={() =>
          onColorThemeChange(colorTheme === "dark" ? "light" : "dark")
        }
        aria-label={tx(
          language,
          colorTheme === "dark" ? "Включить светлую тему" : "Включить тёмную тему",
          colorTheme === "dark" ? "Use light theme" : "Use dark theme",
        )}
        title={tx(
          language,
          colorTheme === "dark" ? "Светлая тема" : "Тёмная тема",
          colorTheme === "dark" ? "Light theme" : "Dark theme",
        )}
      >
        {colorTheme === "dark" ? "☀" : "◐"}
      </button>
    </div>
  );
}
