import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
  preset: "vercel",
  output: {
    dir: ".vercel/output",
    serverDir: ".vercel/output/functions/__server.func",
    publicDir: ".vercel/output/static",
  },
  // @ts-expect-error - externals is a valid Nitro option but missing from this wrapper's types
  externals: {
    inline: ["tslib"],
  },
  rolldownConfig: {
    experimental: {
      chunkOptimization: false,
    },
  },
},
});