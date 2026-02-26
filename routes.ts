import { z } from 'zod';
import { insertProductSchema, insertUserSchema, users, products, orders, orderItems, notifications } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: { 200: z.object({ success: z.boolean() }) }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      responses: { 200: z.array(z.custom<typeof products.$inferSelect & { family?: typeof users.$inferSelect }>()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: { 200: z.custom<typeof products.$inferSelect>() }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: { 201: z.custom<typeof products.$inferSelect>() }
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: { 200: z.array(z.any()) } // OrderWithDetails
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        familyId: z.number(),
        totalAmount: z.string(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.string()
        }))
      }),
      responses: { 201: z.custom<typeof orders.$inferSelect>() }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: { 200: z.custom<typeof orders.$inferSelect>() }
    }
  },
  notifications: {
    list: {
      method: 'GET' as const,
      path: '/api/notifications' as const,
      responses: { 200: z.array(z.custom<typeof notifications.$inferSelect>()) }
    },
    markRead: {
      method: 'POST' as const,
      path: '/api/notifications/:id/read' as const,
      responses: { 200: z.custom<typeof notifications.$inferSelect>() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
