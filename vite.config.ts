import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" にすることで、ビルド物(dist/)をサーバーなしで
// file:// から直接開ける（タブレット配布・Dropbox配布のため）。
export default defineConfig({
  plugins: [react()],
  base: "./",
});
