import { Zip } from "zip-lib";
import { resolve } from "path";

async function main() {
  const root = resolve(import.meta.dir);
  const zipPath = resolve(root, "public/Veritas-Source-Code.zip");
  const archive = new Zip();

  archive.addFile(resolve(root, "src/convex/analyzeNews.ts"), "Veritas-Source-Code/backend/analyzeNews.ts");
  archive.addFile(resolve(root, "src/convex/analyses.ts"), "Veritas-Source-Code/backend/analyses.ts");
  archive.addFile(resolve(root, "src/convex/schema.ts"), "Veritas-Source-Code/backend/schema.ts");
  archive.addFile(resolve(root, "src/pages/Landing.tsx"), "Veritas-Source-Code/frontend/pages/Landing.tsx");
  archive.addFile(resolve(root, "src/pages/Dashboard.tsx"), "Veritas-Source-Code/frontend/pages/Dashboard.tsx");
  archive.addFile(resolve(root, "src/components/CredibilityGauge.tsx"), "Veritas-Source-Code/frontend/components/CredibilityGauge.tsx");
  archive.addFile(resolve(root, "src/components/StatsView.tsx"), "Veritas-Source-Code/frontend/components/StatsView.tsx");
  archive.addFile(resolve(root, "src/components/MethodologyView.tsx"), "Veritas-Source-Code/frontend/components/MethodologyView.tsx");
  archive.addFile(resolve(root, "src/components/ThemeProvider.tsx"), "Veritas-Source-Code/frontend/components/ThemeProvider.tsx");
  archive.addFile(resolve(root, "src/main.tsx"), "Veritas-Source-Code/config/main.tsx");
  archive.addFile(resolve(root, "src/index.css"), "Veritas-Source-Code/config/index.css");
  archive.addFile(resolve(root, "index.html"), "Veritas-Source-Code/config/index.html");

  await archive.archive(zipPath);
  console.log("ZIP updated!");
}

main().catch(console.error);
