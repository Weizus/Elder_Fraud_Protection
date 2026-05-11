# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Running Locally

To run the website locally, you can run 

                npm run dev

## Clerk Auth Setup

The frontend now uses Clerk through custom sign-up and login pages.

Create a `.env` file in `./website` with:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_BASE_URL=http://localhost:8000
```

The Flask backend should also define these environment variables (for token verification):

```
CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json
# Optional but recommended:
CLERK_ISSUER=https://your-clerk-domain
CLERK_AUDIENCE=your_api_audience
```

You can validate backend auth parsing by calling:

- `GET /api/auth/context` without an `Authorization` header (should return `is_authenticated: false`)
- `GET /api/auth/context` with a Clerk bearer token (should return `is_authenticated: true` when verification succeeds)
