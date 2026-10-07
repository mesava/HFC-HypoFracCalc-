import { tx } from "./i18n.js";
import type { Language } from "./labels.js";
import type { SitePage } from "./SiteHome.js";

const calculators: Array<{
  page: SitePage;
  titleRu: string;
  titleEn: string;
  textRu: string;
  textEn: string;
  tag: string;
}> = [
  {
    page: "quick",
    titleRu: "Быстрый BED / EQD₂",
    titleEn: "Quick BED / EQD₂",
    textRu: "Базовый расчёт BED/EQD₂ с endpoint-specific α/β и происхождением параметра.",
    textEn: "Core BED/EQD₂ calculation with endpoint-specific alpha/beta provenance.",
    tag: "LQ",
  },
  {
    page: "compare",
    titleRu: "Сравнение режимов",
    titleEn: "Compare regimens",
    textRu: "Сравнение 2–5 схем для опухолевого исхода и органов риска.",
    textEn: "Compare 2–5 regimens for tumour and OAR endpoints.",
    tag: "ΔEQD₂",
  },
  {
    page: "target-eqd",
    titleRu: "Подбор режима по EQD₂",
    titleEn: "Target EQD₂ solver",
    textRu: "Автоматически подобрать число фракций или дозу за фракцию для заданного EQD₂.",
    textEn: "Solve fraction count or dose per fraction for a target EQD₂.",
    tag: "solve",
  },
  {
    page: "course-correction",
    titleRu: "Коррекция курса / ошибки дозы",
    titleEn: "Course / dose correction",
    textRu: "Что делать с оставшимися фракциями, если часть курса уже доставлена иначе, чем планировалось.",
    textEn: "Solve the remaining fraction dose after a delivered-course deviation.",
    tag: "course",
  },
  {
    page: "calendar",
    titleRu: "Интерактивный календарь",
    titleEn: "Interactive calendar",
    textRu: "Свободно добавлять и удалять фракции по дням, моделировать BID/TID и видеть изменение BED/EQD₂.",
    textEn: "Freely edit treatment days, model BID/TID, and see BED/EQD₂ change.",
    tag: "calendar",
  },
  {
    page: "gap",
    titleRu: "Перерывы в лечении",
    titleEn: "Treatment gaps",
    textRu: "Календарный перерыв, Dprolif/Tk, выходные, BID и радиобиологическая компенсация.",
    textEn: "Treatment interruption, Dprolif/Tk, weekends, BID, and dose compensation.",
    tag: "OTT",
  },
  {
    page: "reirradiation",
    titleRu: "Повторное облучение",
    titleEn: "Reirradiation",
    textRu: "Кумулятивные BED/EQD₂, восстановление как явное допущение и guidance для повторного облучения.",
    textEn: "Cumulative BED/EQD₂, explicit recovery assumptions, and reirradiation guidance.",
    tag: "re-RT",
  },
];

export function CalculatorsHubView({
  language,
  onNavigate,
}: {
  language: Language;
  onNavigate: (page: SitePage) => void;
}) {
  return (
    <main className="calculators-page">
      <section className="panel calculators-hero">
        <span className="eyebrow">{tx(language, "калькуляторы", "calculators")}</span>
        <h2>{tx(language, "Все расчётные инструменты HFC", "All HFC calculation tools")}</h2>
        <p>
          {tx(
            language,
            "Выберите задачу. Простые расчёты отделены от сценариев изменения курса и повторного облучения, чтобы не смешивать разные клинические допущения.",
            "Choose the task. Basic calculations are separated from treatment-course modification and reirradiation so their assumptions remain explicit.",
          )}
        </p>
      </section>

      <section className="calculator-card-grid">
        {calculators.map((item) => (
          <button
            type="button"
            className="calculator-card panel"
            key={item.page}
            aria-label={tx(language, item.titleRu, item.titleEn)}
            onClick={() => onNavigate(item.page)}
          >
            <span className="calculator-tag">{item.tag}</span>
            <h3>{tx(language, item.titleRu, item.titleEn)}</h3>
            <p>{tx(language, item.textRu, item.textEn)}</p>
            <span className="calculator-open">
              {tx(language, "Открыть →", "Open →")}
            </span>
          </button>
        ))}
      </section>
    </main>
  );
}
