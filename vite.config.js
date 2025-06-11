import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['axios'], // Явно указываем Axios как внешнюю зависимость
      output: {
        manualChunks: {
          axios: ['axios'], // Создаем отдельный бандл для Axios
        },
      },
    },
  },
  optimizeDeps: {
    include: ['axios'], // Добавляем Axios в оптимизацию зависимостей
  },
});
