import { tx } from "./i18n.js";
import type { Language } from "./labels.js";

export type ColorTheme = "light" | "dark";
export type DesignStyle = "clinical" | "journal" | "compact";

export function AppearanceControls({
  language,
  colorTheme,
  designStyle,
  onColorThemeChange,
  onDesignStyleChange,
}: {
  language: Language;
  colorTheme: ColorTheme;
  designStyle: DesignStyle;
  onColorThemeChange: (theme: ColorTheme) => void;
  onDesignStyleChange: (style: DesignStyle) => void;
}) {
  return (
    <div className="appearance-controls">
      <label className="appearance-style">
        <span className="sr-only">{tx(language, "Стиль сайта", "Site style")}</span>
        <select
          value={designStyle}
          onChange={(event) =>
            onDesignStyleChange(event.target.value as DesignStyle)
          }
          aria-label={tx(language, "Вариант дизайна", "Design variant")}
        >
          <option value="clinical">
            {tx(language, "Клинический", "Clinical")}
          </option>
          <option value="journal">
            {tx(language, "Журнальный", "Journal")}
          </option>
          <option value="compact">
            {tx(language, "Компактный", "Compact")}
          </option>
        </select>
      </label>

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
