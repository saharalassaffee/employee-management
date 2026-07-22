# Employee Management — Full Project

مشروع كامل: **Frontend (React)** + **Backend (Node/Express)** + **API** + قاعدة بيانات.
يشتغل مباشرة بدون أي تركيب معقّد — لا composer، لا سيرفر قاعدة بيانات، لا إعدادات.

يغطي كل متطلبات السلايدات + الـ Bonus (authentication + user management + employee management).

---

## المطلوب قبل البدء
بس **Node.js** لازم يكون منصّب على جهازك. تأكد:
```bash
node -v
```
إذا ما عندك، نزّله من: https://nodejs.org (اختر LTS)

---

## التشغيل — خطوتين بس

تحتاج تفتح **نافذتين terminal**.

### الخطوة 1: شغّل الباك اند (API)
```bash
cd server
npm install
npm start
```
راح يطبع: `API running at http://localhost:4000`
خلّي هذي النافذة مفتوحة.

قاعدة البيانات (`data.db`) تنخلق تلقائياً أول مرة، مع:
- حساب جاهز: **admin@example.com** / **password**
- 3 موظفين تجريبيين

### الخطوة 2: شغّل الفرونت اند (بنافذة ثانية)
```bash
cd client
npm install
npm run dev
```
راح يطبع رابط: `http://localhost:5173`

افتح الرابط بالمتصفح، سجّل دخول بالحساب فوق، وخلص.

---

## شنو يسوي المشروع

| المكوّن | الوظيفة |
|---------|---------|
| **EmployeeForm** | إضافة موظف — Name, Email, Department (dropdown), Role + validation + مسح الحقول |
| **EmployeeTable** | جدول (Name \| Email \| Department \| Role \| Actions) مع View, Delete، ورندر بـ `.map()` |
| **EmployeeProfile** | modal يعرض كل التفاصيل + زر Back |
| **Login** | تسجيل دخول / إنشاء حساب (الـ bonus) |

---

## نقاط الـ API

| Method | Endpoint | الوظيفة |
|--------|----------|---------|
| POST | `/api/register` | إنشاء حساب |
| POST | `/api/login` | تسجيل دخول (يرجّع token) |
| POST | `/api/logout` | تسجيل خروج |
| GET | `/api/me` | المستخدم الحالي |
| GET | `/api/employees` | كل الموظفين |
| GET | `/api/employees/:id` | موظف واحد |
| POST | `/api/employees` | إضافة موظف |
| PUT | `/api/employees/:id` | تعديل موظف |
| DELETE | `/api/employees/:id` | حذف موظف |
| GET | `/api/users` | كل المستخدمين |
| POST | `/api/users` | إنشاء مستخدم |
| PUT | `/api/users/:id` | تعديل مستخدم |

كل نقاط `employees` و `users` محمية — تحتاج هيدر:
`Authorization: Bearer <token>`

---

## هيكل المشروع
```
employee-app/
├── server/          # Node/Express API + SQLite
│   ├── server.js    # كل الـ backend بملف واحد
│   └── package.json
└── client/          # React + Vite
    └── src/
        ├── components/  EmployeeForm, EmployeeTable, EmployeeProfile, Login
        ├── api/         client.js
        └── App.jsx
```

---

## ملاحظات
- إذا تريد تصفّر قاعدة البيانات: احذف ملف `server/data.db` وشغّل السيرفر من جديد.
- إذا المنفذ 4000 مشغول عندك، غيّره من `server/server.js` (سطر `const PORT`)
  و غيّر نفس الرقم في `client/src/api/client.js` (`BASE_URL`).
