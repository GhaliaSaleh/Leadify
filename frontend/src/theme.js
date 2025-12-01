import { extendTheme } from '@chakra-ui/react';

// 1. تعريف الألوان كما هي
const colors = {
  brand: {
    primary: '#4263EB',
    secondary: '#495057',
    background: '#F8F9FA',
    surface: '#FFFFFF',
  },
};

// 2. تعريف الخطوط
const fonts = {
  // نخبر Chakra بأن الخط الأساسي للنصوص والعناوين هو "Tajawal"
  // وإذا لم يجده، يستخدم خط sans-serif كبديل
  heading: "'Tajawal', sans-serif",
  body: "'Tajawal', sans-serif",
};

// 3. تعريف اتجاه الكتابة
const direction = 'rtl';

// 4. إنشاء وتصدير الموضوع المخصص مع كل الإعدادات الجديدة
const theme = extendTheme({ 
  colors, 
  fonts,
  direction, // إضافة اتجاه الكتابة
});

export default theme;