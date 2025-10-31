// config/swagger.ts
import env from '#start/env'
import path from 'node:path'
import url from 'node:url'

export default {
  // for AdonisJS v6
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',

  // legacy top-level keys (kept for backward compat in the lib)
  title: env.get('APP_NAME'),
  version: '1.0.0',
  description: 'AdonisJS 6 boilerplate',

  /**
   * info: canonical OpenAPI info block
   */
  info: {
    title: 'Boilerplate API',
    version: '1.0.0',
    description: 'AdonisJS 6 boilerplate',
  },

  /**
   * How routes are grouped into tags
   */
  tagIndex: 2,

  /**
   * Env name that means "treat as production".
   * The README sets "production" literally.
   */
  productionEnv: 'production',

  /**
   * If true => extra debug in console, can help see where it crashes.
   * Laisse false pour l’instant, on veut pas polluer.
   */
  debug: false,

  /**
   * Snake-case schemas in output or not.
   * true => { first_name, last_name }
   * false => { firstName, lastName }
   */
  snakeCase: true,

  /**
   * Don't include swagger's own endpoints in the doc.
   * Attention: nous on expose /v1/swagger et /v1/docs,
   * donc on les met aussi ici pour éviter les boucles.
   */
  ignore: ['/swagger', '/docs', '/v1/swagger', '/v1/docs'],

  /**
   * If both PUT and PATCH exist for same resource,
   * which one is considered canonical.
   */
  preferredPutPatch: 'PUT',

  /**
   * Common reusable params/headers you want injected.
   * (tu peux laisser vide pour l’instant)
   */
  common: {
    parameters: {},
    headers: {},
  },

  /**
   * Security config:
   * - securitySchemes appear in the final OpenAPI under "components.securitySchemes"
   * - authMiddlewares: tells autoswagger which middlewares mean "this route is protected"
   * - defaultSecurityScheme: which scheme to apply to those routes by default
   * - persistAuthorization: keep bearer token in UI after reload
   */
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },

  authMiddlewares: ['auth', 'auth:api'],
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true,

  /**
   * showFullPath = false → summaries look cleaner
   */
  showFullPath: false,
}
