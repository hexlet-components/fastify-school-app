// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: "dist",
    // Точка входа это css, а не js: своего кода на клиенте у приложения нет,
    // формы отправляет браузер. Клиентский бандл существовал только ради
    // javascript Bootstrap и ушёл вместе с ним.
    //
    // Имя без хеша: шаблон просит файл по имени (`assetPath('main.css')`), а
    // хеш заставил бы читать manifest.json.
    rollupOptions: {
      input: "src/styles.css",
      output: {
        assetFileNames: "main[extname]",
      },
    },
  },
});
