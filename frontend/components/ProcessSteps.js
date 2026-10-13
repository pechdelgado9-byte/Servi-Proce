import { processSteps, pick } from '@/lib/services-data';

// "¿Cómo trabajamos?" — 5 pasos.
export default function ProcessSteps({ lang }) {
  return (
    <ol className="steps">
      {processSteps.map((step, i) => (
        <li key={step.id} className={`steps__item fade-in-up delay-${(i % 3) + 1}`}>
          <span className="steps__num" aria-hidden="true">{i + 1}</span>
          <h3 className="steps__title">{pick(step.title, lang)}</h3>
          <p className="text-text-muted text-sm">{pick(step.desc, lang)}</p>
        </li>
      ))}
    </ol>
  );
}
