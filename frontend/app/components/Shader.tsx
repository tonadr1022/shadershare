import type { Route } from "./renderer/+types/Shader";
import ShaderRenderer from "./renderer/ShaderRenderer";

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.shaderId;
  return { id };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const id = loaderData.id || "noid";
  return (
    <div>
      <h1>{id}</h1>
      <ShaderRenderer shaderId={id} />
    </div>
  );
}

// export default function ShaderRenderer() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.fillStyle = "green";
//         ctx.fillRect(10, 10, 100, 100);
//       }
//     }
//   }, []);
//
//   return <canvas ref={canvasRef}></canvas>;
// }
