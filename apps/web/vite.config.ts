import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-assets',
      writeBundle() {
        // Copy GLTF and texture assets to dist
        const assetsDir = join(process.cwd(), 'dist', 'assets');
        const texturesDir = join(assetsDir, 'Textures');
        
        // Create directories
        if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true });
        if (!existsSync(texturesDir)) mkdirSync(texturesDir, { recursive: true });
        
        // Copy GLTF files from root
        const rootDir = join(process.cwd(), '..', '..');
        try {
          copyFileSync(join(rootDir, 'TheSect.gltf'), join(assetsDir, 'TheSect.gltf'));
          copyFileSync(join(rootDir, 'TheSect.bin'), join(assetsDir, 'TheSect.bin'));
          
          // Copy texture files
          const sourceTexturesDir = join(rootDir, 'Textures');
          const textures = [
            'Chandelier_BaseColor.png',
            'Chandelier_Emissive.png', 
            'Chandelier_Normal.png',
            'Chandelier_Metallic-Chandelier_Roughness.png',
            'Gargoyle_BaseColor.png',
            'Gargoyle_Normal1.png',
            'Gargoyle_Metallic-Gargoyle_Roughness.png',
            'Map__2_Normal_Bump.png',
            'Metal053A_2K-PNG_Color.png',
            'Metal053A_2K-PNG_NormalGL.png',
            'Metal053A_2K-PNG_Metalness-Metal053A_2K-PNG_Roughness.png',
            'OD204.png',
            'OD204-Sp.png',
            'Roman Pillar_BaseColor.png',
            'Roman Pillar_Normal1k.png',
            'Roman Pillar_Metallic.png-Roman Pillar_Roughness.png.png',
            'Teeth_BaseColor.png',
            'Teeth_Normal1.png',
            'Teeth_Metallic.png-Teeth_Roughness.png.png'
          ];
          
          textures.forEach(texture => {
            try {
              copyFileSync(join(sourceTexturesDir, texture), join(texturesDir, texture));
              console.log(`Copied texture: ${texture}`);
            } catch (err) {
              console.warn(`Could not copy texture ${texture}:`, err.message);
            }
          });
          
          // Handle textures with spaces in filenames (URL encoded in GLTF)
          const texturesWithSpaces = [
            { source: 'Roman Pillar_BaseColor.png', dest: 'Roman%20Pillar_BaseColor.png' },
            { source: 'Roman Pillar_Normal1k.png', dest: 'Roman%20Pillar_Normal1k.png' },
            { source: 'Roman Pillar_Metallic.png-Roman Pillar_Roughness.png.png', dest: 'Roman%20Pillar_Metallic.png-Roman%20Pillar_Roughness.png.png' }
          ];
          
          texturesWithSpaces.forEach(({ source, dest }) => {
            try {
              copyFileSync(join(sourceTexturesDir, source), join(texturesDir, dest));
              console.log(`Copied texture with space: ${source} -> ${dest}`);
            } catch (err) {
              console.warn(`Could not copy texture ${source}:`, err.message);
            }
          });
          
        } catch (err) {
          console.warn('Could not copy some assets:', err.message);
        }
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});