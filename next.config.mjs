import path from 'path';
import { fileURLToPath } from 'url';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
export default function nextConfig(phase) {
    return {
        output: 'standalone',
        distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
        webpack: (config) => {
            config.resolve.alias['@'] = path.resolve(__dirname);
            return config;
        },
    };
}
