nextjs-app/
├── public/                   # สินทรัพย์สาธารณะ (โลโก้, favicon)
├── pages/                    # Next.js pages
│   ├── _app.tsx
│   ├── index.tsx             # Landing / sign-in redirect
│   ├── dashboard.tsx
│   ├── profile.tsx
│   └── controlchart/         # dynamic route
│       └── [factory].tsx
├── components/               # shared React components
│   ├── Layout/               # layout wrapper
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── ControlChartCard.tsx  # ปรับให้เป็น component เดียว ไม่ต้องมี subfolder
├── styles/                   # global & module CSS
│   ├── globals.css
│   └── Home.module.css
├── theme/                    # MUI theme
│   └── theme.ts
├── utils/                    # helper functions (fetcher, formatDate, ฯลฯ)
│   └── fetcher.ts
├── context/                  # React Context (Auth, UI state, ฯลฯ)
│   └── AuthContext.tsx
├── types/                    # TypeScript interfaces & types
│   └── index.ts
├── .env.local                # local env vars (NEXT_PUBLIC_…)
├── next.config.js
├── package.json
└── tsconfig.json