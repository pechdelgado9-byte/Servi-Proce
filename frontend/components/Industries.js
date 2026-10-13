import { industries, pick } from '@/lib/services-data';

// "Industrias que atendemos"
export default function Industries({ lang }) {
  return (
    <ul className="chips" role="list">
      {industries.map((ind) => (
        <li key={ind.id} className="chip">{pick(ind.label, lang)}</li>
      ))}
    </ul>
  );
}
