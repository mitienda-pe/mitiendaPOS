# Backlog — MiTienda POS

Tareas pendientes de mejora técnica y de producto.

## Calidad / Tooling

- [ ] **Implementar test runner y linter**
  - Actualmente el proyecto no tiene runner de pruebas ni linter configurado.
  - Sugerido: Vitest + Vue Test Utils para tests unitarios/componentes; ESLint + Prettier (con `eslint-plugin-vue`) para linting.
  - Agregar scripts a `package.json` (`test`, `lint`) e integrarlos al workflow de GitHub Actions antes del build/deploy.
