import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        alias: {
            '@core': path.resolve(__dirname, './src'),
            '@': path.resolve(__dirname, './web/src')
        },
        // Increase timeout for db ops if needed
        testTimeout: 10000
    }
});
