import React from 'react';
import { Routes, Route, Link as RouterLink } from "react-router-dom";

// 1. استيراد المكونات اللازمة من Chakra UI
import { Box, Container, Heading, Link as ChakraLink, Button, HStack } from '@chakra-ui/react';

// 2. استيراد الصفحات والمكونات الخاصة بنا
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext";
import RegisterPage from "./pages/RegisterPage.jsx"; // 1. استيراد


function App() {
  const { token, logout } = useAuth();

  return (
    // 3. استخدام Box كحاوية رئيسية لتطبيق لون الخلفية
    <Box bg="gray.50" minH="100vh">
      {/* 4. استخدام Container لوضع المحتوى في المنتصف وإضافة هوامش */}
      <Container maxW="container.xl" py={4}>

        {/* --- شريط التنقل --- */}
        <Box 
          as="nav" 
          bg="white" 
          p={4} 
          borderRadius="md" 
          boxShadow="sm" 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
        >
          {/* الشعار */}
          <Heading as="h1" size="md" color="blue.600">
            <ChakraLink as={RouterLink} to="/">
              Leadify
            </ChakraLink>
          </Heading>
          
          {/* الروابط */}
          <Box>
            {token ? (
              // حالة المستخدم المسجل
              <>
              <HStack as="nav" spacing={4}> {/* استخدام HStack مع تباعد */}

                <ChakraLink as={RouterLink} to="/dashboard" fontWeight="medium" mr={4}>
                  لوحة التحكم
                </ChakraLink>
                <Button colorScheme="red" variant="outline" size="sm" onClick={logout}>
                  تسجيل الخروج
                </Button>
                <Button as={RouterLink} to="/register" colorScheme="green" size="sm">
                  إنشاء حساب
                </Button>
             </HStack>


              </>
            ) : (
              // حالة الزائر
              <ChakraLink as={RouterLink} to="/login" fontWeight="bold">
                تسجيل الدخول
              </ChakraLink>
          
            )}
          </Box>
        </Box>

        {/* --- محتوى الصفحة الرئيسي --- */}
        <Box as="main" bg="white" p={{ base: 4, md: 8 }} mt={6} borderRadius="md" boxShadow="sm">
          <Routes>
            <Route path="/" element={
              <Box textAlign="center">
                <Heading>أهلاً بك في الصفحة الرئيسية لتطبيق Leadify</Heading>
              </Box>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} /> {/* <-- السطر الجديد */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
        
      </Container>
    </Box>
  );



  
}

export default App;