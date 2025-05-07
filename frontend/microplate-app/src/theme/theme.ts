// src/theme/theme.ts
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { Shadows } from '@mui/material/styles/shadows';

// สร้าง Theme เริ่มต้นเพื่อเข้าถึงค่า default บางอย่าง เช่น shadows
const defaultTheme = createTheme();

let theme = createTheme({
  palette: {
    mode: 'light',

    // Brand palette (คงเดิม - สีทันสมัยและเข้ากันได้ดี)
    primary: {
      main: '#5B6CFF',
      light: '#8C9EFF',
      dark: '#3949AB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00C6AE',
      light: '#5CF2D7',
      dark: '#008C7D',
      contrastText: '#FFFFFF',
    },

    // Semantic colors (คงเดิม)
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error:   { main: '#EF4444' },
    info:    { main: '#3B82F6' },

    // Greyscale (คงเดิม - อิง Tailwind)
    grey: {
      50:  '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      700: '#374151',
      900: '#111827',
    },

    background: {
      default: '#F8F9FC', // สีพื้นหลังอ่อนๆ ทำให้สบายตา
      paper:   '#FFFFFF',
    },

    text: {
      primary:   '#1A202C', // สีเข้ม อ่านง่าย
      secondary: '#4A5568', // สีรองสำหรับข้อความที่ไม่เน้นมาก
      disabled:  '#9CA3AF',
    },
  },

  // Responsive breakpoints (คงเดิม)
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  // Typography scale (ปรับปรุงเล็กน้อย)
  typography: {
    fontFamily: [
      'Inter', // ฟอนต์หลักที่เหมาะกับ UI
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // ปรับ letterSpacing ของ Heading ใหญ่ๆ ให้ติดลบเล็กน้อย
    h1: { fontSize: '3rem',    fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' }, // 48px
    h2: { fontSize: '2.5rem',  fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em' },  // 40px
    h3: { fontSize: '2rem',    fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.015em' },  // 32px
    h4: { fontSize: '1.5rem',  fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.01em' },   // 24px
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },                             // 20px
    h6: { fontSize: '1.125rem',fontWeight: 600, lineHeight: 1.5 },                             // 18px
    subtitle1: { fontSize: '1rem',    fontWeight: 500, lineHeight: 1.6 },                      // 16px
    body1:     { fontSize: '1rem',    fontWeight: 400, lineHeight: 1.65 }, // เพิ่ม lineHeight เล็กน้อยให้อ่านง่ายขึ้น
    body2:     { fontSize: '0.875rem',fontWeight: 400, lineHeight: 1.65 }, // เพิ่ม lineHeight เล็กน้อยให้อ่านง่ายขึ้น
    caption:   { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5 },                      // 12px
    // กำหนด style ของ button ให้ชัดเจน (อาจปรับ fontWeight หรือ fontSize เพิ่มเติมตามต้องการ)
    button: {
      fontWeight: 600,
      lineHeight: 1.5,
      // textTransform: 'none', // กำหนดใน MuiButton defaultProps แทน
    },
  },

  // Base spacing unit (เปลี่ยนเป็น 8px เพื่อความสอดคล้องกับ grid สมัยใหม่)
  // theme.spacing(1) = 8px
  spacing: 8,

  // Rounded corners (คงเดิม 8px - ดูทันสมัย)
  shape: {
    borderRadius: 8,
  },

  // ใช้ shadows เริ่มต้นของ MUI เพื่อความสอดคล้องและครอบคลุม
  // หากต้องการปรับแก้เฉพาะบางค่า สามารถ override ได้ เช่น shadows[1] = '...'
  shadows: defaultTheme.shadows as Shadows,

  components: {
    // ตั้งค่า default props และ variants สำหรับ Components ต่างๆ
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        disableElevation: true, // ปุ่มแบบเรียบ ไม่มีเงาเริ่มต้น
        size: 'medium', // ขนาดกลางเป็นค่าเริ่มต้น
      },
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          textTransform: 'none', // ไม่ใช้ตัวพิมพ์ใหญ่ทั้งหมด
          padding: `${theme.spacing(1)} ${theme.spacing(2)}`, // 8px 16px padding
          // ตัวอย่างการปรับ padding ตาม size
          ...(ownerState.size === 'small' && {
            padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`, // 4px 12px
          }),
          ...(ownerState.size === 'large' && {
            padding: `${theme.spacing(1.25)} ${theme.spacing(3)}`, // 10px 24px
          }),
        }),
        // ทำให้ปุ่ม Outlined มี border ที่ชัดเจนขึ้นเล็กน้อย
        outlined: ({ theme }) => ({
          borderColor: theme.palette.grey[300],
        }),
        outlinedPrimary: ({ theme }) => ({
          '&:hover': {
            borderColor: theme.palette.primary.light,
            backgroundColor: `${theme.palette.primary.main}14`, // สี primary อ่อนๆ เป็นพื้นหลังตอน hover
          }
        }),
        outlinedSecondary: ({ theme }) => ({
          '&:hover': {
            borderColor: theme.palette.secondary.light,
            backgroundColor: `${theme.palette.secondary.main}14`, // สี secondary อ่อนๆ เป็นพื้นหลังตอน hover
          }
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small', // ขนาดเล็กเป็นค่าเริ่มต้น เหมาะกับฟอร์ม
      },
      styleOverrides: {
        root: {
          // อาจจะเพิ่ม style เล็กน้อย เช่น ปรับสีของ border ตอน focus
          // '& .MuiOutlinedInput-root': {
          //   '&.Mui-focused fieldset': {
          //     borderWidth: '1px', // ป้องกันไม่ให้ border หนาขึ้นตอน focus
          //   },
          // },
        }
      }
    },
    MuiCard: {
      defaultProps: {
        elevation: 1, // เงาเล็กน้อยเป็นค่าเริ่มต้น
        variant: 'elevation',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          // อาจจะเพิ่ม style เช่น กำหนด background color หรือ border
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none', // ป้องกัน gradient แปลกๆ ในบางกรณี
        }),
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0, // ไม่มีเงา เริ่มต้น
        color: 'inherit', // ใช้สีพื้นหลังตาม parent หรือ theme background
      },
      styleOverrides: {
        root: ({ theme }) => ({
            // เพิ่มเส้นขอบบางๆ ด้านล่าง ถ้าต้องการแยก AppBar ออกจากเนื้อหา
            // borderBottom: `1px solid ${theme.palette.grey[200]}`,
            backgroundColor: theme.palette.background.paper, // ทำให้ AppBar เป็นสีขาวเริ่มต้น
        }),
      }
    },
    MuiLink: {
        defaultProps: {
            underline: 'hover', // ขีดเส้นใต้เมื่อ hover
            color: 'primary.main', // ใช้สี primary เป็นสี link เริ่มต้น
        },
    },
    MuiChip: {
        defaultProps: {
            size: 'small', // ขนาดเล็กเป็นค่าเริ่มต้น
        },
        styleOverrides: {
            root: {
                fontWeight: 500, // ทำให้ข้อความหนาขึ้นเล็กน้อย
            }
        }
    },
    MuiTooltip: {
        defaultProps: {
            arrow: true, // แสดง mũi tên ชี้
        },
        styleOverrides: {
            tooltip: ({ theme }) => ({
                backgroundColor: theme.palette.grey[700], // สีพื้นหลังเข้มขึ้น
                fontSize: '0.75rem', // ปรับขนาดฟอนต์
            }),
            arrow: ({ theme }) => ({
                color: theme.palette.grey[700],
            }),
        },
    },
  },
});

// ทำให้ Typography ตอบสนองตามขนาดหน้าจอ (Responsive)
theme = responsiveFontSizes(theme);

export default theme;