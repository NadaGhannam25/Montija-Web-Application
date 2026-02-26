import { users, products, orders, orderItems, notifications } from "@shared/schema";
import type { User, InsertUser, Product, InsertProduct, Order, OrderItem, Notification, OrderWithDetails } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<(Product & { family?: User })[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  getOrders(userId: number, role: string): Promise<OrderWithDetails[]>;
  createOrder(order: any): Promise<Order>;
  updateOrderStatus(orderId: number, status: string): Promise<Order>;
  
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(userId: number, message: string): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(): Promise<(Product & { family?: User })[]> {
    const allProducts = await db.select().from(products);
    const allUsers = await db.select().from(users);
    
    return allProducts.map(p => ({
      ...p,
      family: allUsers.find(u => u.id === p.familyId)
    }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getOrders(userId: number, role: string): Promise<OrderWithDetails[]> {
    const query = role === 'customer' 
      ? eq(orders.customerId, userId)
      : eq(orders.familyId, userId);
      
    const allOrders = await db.select().from(orders).where(query);
    const items = await db.select().from(orderItems);
    const prods = await db.select().from(products);
    const allUsers = await db.select().from(users);

    return allOrders.map(o => ({
      ...o,
      items: items.filter(i => i.orderId === o.id).map(i => ({
        ...i,
        product: prods.find(p => p.id === i.productId)!
      })),
      customer: allUsers.find(u => u.id === o.customerId)!,
      family: allUsers.find(u => u.id === o.familyId)!
    }));
  }

  async createOrder(orderData: any): Promise<Order> {
    const [order] = await db.insert(orders).values({
      customerId: orderData.customerId,
      familyId: orderData.familyId,
      totalAmount: orderData.totalAmount,
      status: "processing"
    }).returning();

    for (const item of orderData.items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const [order] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async createNotification(userId: number, message: string): Promise<Notification> {
    const [notif] = await db.insert(notifications).values({ userId, message }).returning();
    return notif;
  }

  async markNotificationRead(id: number): Promise<Notification> {
    const [notif] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notif;
  }
}

export const storage = new DatabaseStorage();
