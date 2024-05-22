# JumboCode Vite Template

This template provides a minimal setup to get React working in Vite with:

- TypeScript
- ESLint
- TailwindCSS
- Wouter
- Vercel Serverless Functions (see [here](https://vercel.com/docs/functions/quickstart), selecting "Other frameworks")
- Vitest

To get the template up and running:

1. Install [Node.js](https://nodejs.org/en) (v20 or later) and npm.
2. Install the Vercel CLI (`npm install --global vercel`).
3. Copy this repo as a template and clone it onto your local machine.
4. Install all required packages by running `npm install`.
5. Start the dev server with `vercel dev` (log in with your Vercel account and create a linked project as required).

- Why not `npm run dev`? `vercel dev` runs the [Vercel Serverless Functions](https://vercel.com/docs/functions/quickstart) in `api/` as the backend.

Vitest tests are included in the `test` folder. You can run them with `npm run test` and generate a test coverage report with `npm run coverage`.

The template configured to run tests only on files ending in `.ts` (only the backend files). You can run tests on the frontend by deleting `extension: ".ts"` in `vite.config.ts`.