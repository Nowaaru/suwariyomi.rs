// import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { swcReactRefresh } from "vite-plugin-swc-react-refresh";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [/*react()*/ tsconfigPaths(), swcReactRefresh()],
});
