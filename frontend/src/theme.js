import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    primary: '#4263EB',
    secondary: '#495057',
    background: '#F8F9FA',
    surface: '#FFFFFF',
  },
};

const fonts = {
  heading: "'Tajawal', sans-serif",
  body: "'Tajawal', sans-serif",
};

const direction = 'rtl';

const theme = extendTheme({ 
  colors, 
  fonts,
  direction, 
});

export default theme;