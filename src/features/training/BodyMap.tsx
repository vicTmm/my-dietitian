import geometry from "./body-geometry.json";
const map: Record<string, string> = {
  forearm: "forearms",
  hamstring: "hamstrings",
  abs: "abdominals",
  obliques: "abdominals",
  deltoids: "shoulders",
  quads: "quadriceps",
  trapezius: "traps",
  "lower-back": "lower back",
  "upper-back": "middle back",
  gluteal: "glutes",
};
export default function BodyMap({
  counts,
}: {
  counts: Record<string, number>;
}) {
  return (
    <div className="body-map-diagram">
      {(["front", "back"] as const).map((side) => (
        <figure key={side}>
          <svg
            viewBox={geometry[side].vb}
            role="img"
            aria-label={`Mapa muscular: ${side === "front" ? "frente" : "costas"}. Grupos treinados destacados; contagens na lista abaixo.`}
          >
            {Object.entries(geometry[side].p).map(([part, paths]) => (
              <g
                key={part}
                fill={
                  (counts[map[part] || part] || 0) > 0
                    ? "var(--emerald)"
                    : "#e3e4dc"
                }
                stroke="var(--paper)"
                strokeWidth="2"
              >
                {paths.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
            ))}
          </svg>
          <figcaption>{side === "front" ? "Frente" : "Costas"}</figcaption>
        </figure>
      ))}
    </div>
  );
}
