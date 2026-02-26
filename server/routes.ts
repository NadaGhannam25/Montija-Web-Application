import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, hashPassword } from "./auth";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);

  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    const passport = require("passport");
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.login(user, (err: any) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'family') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const product = await storage.createProduct({
      ...req.body,
      familyId: (req.user as any).id
    });
    res.status(201).json(product);
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const orders = await storage.getOrders(user.id, user.role);
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    
    const order = await storage.createOrder({
      ...req.body,
      customerId: user.id
    });

    // Notify family
    await storage.createNotification(
      order.familyId, 
      `لديك طلب جديد بقيمة ${order.totalAmount} ريال`
    );

    res.status(201).json(order);
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'family') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const order = await storage.updateOrderStatus(orderId, status);

    // Notify customer
    let statusText = status;
    if (status === 'accepted') statusText = 'مقبول';
    else if (status === 'completed') statusText = 'مكتمل';
    else if (status === 'cancelled') statusText = 'ملغى';
    
    await storage.createNotification(
      order.customerId,
      `تم تحديث حالة طلبك إلى: ${statusText}`
    );

    res.json(order);
  });

  app.get(api.notifications.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const notifs = await storage.getNotifications(user.id);
    res.json(notifs);
  });

  app.post(api.notifications.markRead.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const notif = await storage.markNotificationRead(Number(req.params.id));
    res.json(notif);
  });

  // Seed DB with mock data
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingUser = await storage.getUserByUsername("family1");
  if (!existingUser) {
    const pwd = await hashPassword("password");
    
    const family = await storage.createUser({
      username: "family1",
      password: pwd,
      name: "أسرة عبق الماضي",
      role: "family"
    });

    const customer = await storage.createUser({
      username: "customer1",
      password: pwd,
      name: "أحمد محمد",
      role: "customer"
    });

    await storage.createProduct({
      familyId: family.id,
      name: "معمول تمر فاخر",
      description: "معمول بالتمر السكري والزبدة الطبيعية، هش ولذيذ.",
      price: "45",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    });

    await storage.createProduct({
      familyId: family.id,
      name: "كليجا قصيمية",
      description: "كليجا محشوة بدبس التمر والبهارات القصيمية المميزة.",
      price: "35",
      imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e"
    });
  }
}
