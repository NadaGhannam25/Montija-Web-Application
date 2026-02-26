# Montija – Digital Marketplace Platform

Montija is a complete digital marketplace platform designed to empower home-based families (productive families) to showcase and sell their products through a modern, clean, and user-friendly system.

The platform provides a full end-to-end purchasing experience, starting from browsing products to placing orders and tracking their status, along with a dedicated dashboard for sellers.

---

## Project Overview

Montija aims to create a professional digital environment that supports small family businesses by offering:

- Organized product listings with high-quality images
- Category-based browsing
- Smooth search experience
- Shopping cart system
- Checkout and order creation
- Order tracking with status updates
- Seller dashboard for product and order management
- Notifications system
- FAQ page and simple chatbot
- Login & Registration system with role selection

---

## Core Features

### Customer Features
- Browse products by categories
- Search functionality
- Product details page
- Add to cart / modify quantity
- Checkout process
- Order tracking (Processing → Preparing → Out for Delivery → Delivered)
- Rate delivery representative after completion

### Seller (Family) Features
- Register as a productive family
- Seller dashboard
- Add / Edit / Delete products (CRUD)
- View incoming orders
- Advanced statistics (Revenue, Orders count, Top sellers)
- Insights & analytics section

### System Features
- Mock notification system:
  - Order confirmed
  - Order preparation started
  - Status updates
- Notification badge counter
- FAQ section (Expansion tiles)
- Simple keyword-based chatbot

---

## End-to-End Order Flow

1. Browse products  
2. View product details  
3. Add to cart  
4. Checkout  
5. Create order with initial status "Processing"  
6. Order appears in "My Orders"  
7. Notifications triggered  
8. Status updates handled  

---

## Project Structure

```
lib/
│
├── core/ # Theme, routing, app configuration
├── features/ # Feature-first structure (home, cart, orders, seller, profile)
├── shared/ # Reusable UI components
├── models.dart # Data models
├── providers/ # State management
└── main.dart
```


---

## Prompt Used to Build the Project

```

> بصفتك خبيرًا في تطوير الأنظمة الرقمية، أريد منك مراجعة وتحسين منصة "منتجة" بشكل شامل بعد التحديثات الأخيرة. يوجد خلل في مرحلة إتمام الطلب (Checkout) حيث لا يتم أحيانًا إنشاء الطلب أو لا يظهر مباشرة في صفحة "طلباتي"، لذلك أريد منك مراجعة منطق إنشاء الطلب والتأكد من أن الضغط على زر "تأكيد الطلب" يقوم بإنشاء كائن Order فعليًا، إضافته إلى نظام إدارة الطلبات، تعيين حالته الأولى إلى "قيد المعالجة"، ثم الانتقال إلى صفحة الطلبات مع تحديث الواجهة فورًا دون الحاجة لإعادة تشغيل النظام. بالإضافة إلى ذلك، أريد إضافة نظام تسجيل دخول وتسجيل حساب (Login & Register) متكامل، بحيث يتمكن المستخدم من إنشاء حساب جديد واختيار نوع الحساب (عميل أو أسرة منتجة)، مع وجود تحقق من صحة البيانات (Validation) لجميع الحقول. يجب حفظ حالة تسجيل الدخول وعدم السماح بإتمام الطلب أو الوصول إلى لوحة تحكم الأسرة أو صفحة الإحصائيات إلا بعد تسجيل الدخول. كما أريد تحسين واجهات صفحات تسجيل الدخول والتسجيل من حيث المحاذاة، توزيع العناصر، وضوح الحقول، والأزرار، مع الحفاظ على تصميم عصري وسلس. تأكد أيضًا من تحسين تجربة المستخدم العامة في جميع الصفحات، بما في ذلك محاذاة النصوص والأزرار، اتساق أحجام الصور في بطاقات المنتجات، وضوح زر "إضافة إلى السلة"، واستقرار نظام الإشعارات بحيث يتم إرسال إشعار عند إنشاء الطلب وعند تغيير حالته. الهدف النهائي هو جعل المنصة مستقرة، خالية من الأخطاء، ومكتملة الوظائف الأساسية وجاهزة للتسليم كنسخة MVP احترافية.

```


---

## Project Status

- Completed as a Professional MVP  
- Ready for future enhancements (Real backend integration, Payment gateway, Push notifications)

---

## Goal

To build a scalable and professional digital marketplace that supports small family businesses while delivering a smooth, modern, and reliable user experience.

