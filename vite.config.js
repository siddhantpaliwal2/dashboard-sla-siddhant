import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  resolve: {
    alias: {
      'vue': '@vue/compat'
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2 // This can be customized as needed for your migration
          }
        }
      }
    }),
  ],
  // ... any other configurations you need
});



