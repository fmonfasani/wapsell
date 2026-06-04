// Two-column comparison table. Wapsell column gets an amber left-border to
// visually anchor it as "the answer" without being aggressive.

const ROWS = [
  {
    feature: "Costo mensual",
    sdr: "$80-120k ARS + comisiones",
    wapsell: "Plan fijo, sin comisiones",
  },
  {
    feature: "Tiempo de onboarding",
    sdr: "90 días",
    wapsell: "1 día",
  },
  {
    feature: "Leads respondidos por hora",
    sdr: "4-6",
    wapsell: "Ilimitados",
  },
  {
    feature: "Disponibilidad",
    sdr: "Lunes a viernes, 9-18h",
    wapsell: "24/7, todos los días",
  },
  {
    feature: "Tiempo de respuesta",
    sdr: "30+ minutos",
    wapsell: "Menos de 5 segundos",
  },
  {
    feature: "Vacaciones / rotación",
    sdr: "Sí",
    wapsell: "No aplica",
  },
];

export function Comparison() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="section">
        <div className="text-center mb-12">
          <p className="eyebrow mb-4">Comparativa</p>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight max-w-2xl mx-auto">
            Wapsell vs contratar más SDRs
          </h2>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-cream-300">
                <th className="text-left py-4 font-semibold text-ink">
                  Característica
                </th>
                <th className="text-left py-4 px-4 font-semibold text-ink-muted">
                  SDR humano
                </th>
                <th className="text-left py-4 px-4 font-semibold text-ink border-l-2 border-amber bg-amber-soft/30">
                  Wapsell
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.feature} className="border-b border-cream-300">
                  <td className="py-4 font-medium text-ink">{r.feature}</td>
                  <td className="py-4 px-4 text-ink-muted">{r.sdr}</td>
                  <td className="py-4 px-4 text-ink border-l-2 border-amber bg-amber-soft/30 font-medium">
                    {r.wapsell}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
