// src/components/layout/Layout.tsx
// (แนะนำให้เปลี่ยนชื่อไฟล์เป็น MainLayoutClientShell.tsx เพื่อความชัดเจน)
'use client'; // ยังคงเป็น Client Component

import React, { useState } from 'react';
import { Box, Toolbar, useTheme } from '@mui/material';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
// ไม่ต้อง import AuthGuard ที่นี่แล้ว
// import AuthGuard from '@/components/layout/AuthGuard';

// ควร import หรือกำหนดค่า drawerWidth ที่นี่เพื่อให้สอดคล้องกับ Sidebar
const drawerWidth = 240; // หรือ import จากที่อื่นถ้ามีการแชร์ค่านี้

interface LayoutProps {
  children: React.ReactNode;
}

// เปลี่ยนชื่อ Function เป็น MainLayoutClientShell ถ้าเปลี่ยนชื่อไฟล์
export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* Sidebar */}
      {/* ส่ง props ที่จำเป็นสำหรับ Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      {/* Main area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          // ปรับ width และ marginLeft สำหรับ Desktop ที่มี Permanent Sidebar
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` }, // เพิ่ม margin ด้านซ้ายบน Desktop
        }}
      >
        {/* Navbar */}
        {/* ส่ง props ที่จำเป็นสำหรับ Navbar */}
        <Navbar onMenuClick={handleDrawerToggle} />

        {/* Push content below AppBar - จำเป็นเพื่อให้เนื้อหาไม่ซ้อนทับ Navbar */}
        <Toolbar />

        {/* Page Content + Footer Wrapper */}
        <Box
          component="main"
          sx={{
            flexGrow: 1, // ให้ส่วนนี้ขยายเต็มพื้นที่ที่เหลือในแนวตั้ง
            display: 'flex',
            flexDirection: 'column',
            // เอา justifyContent ออก เพื่อให้ Box ด้านล่าง (Inner content) ขยายได้เต็มที่
            // justifyContent: 'space-between',
            backgroundColor: theme.palette.background.default,
            // ปรับ Padding ให้ responsive
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 }, // ใช้ py แทน pb เพื่อให้มี padding บนล่าง
          }}
        >
          {/* Inner content - ส่วนนี้จะขยายเพื่อดัน Footer ลงไป */}
          <Box sx={{ flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}