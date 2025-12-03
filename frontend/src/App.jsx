import React from 'react';
import { Routes, Route, Link as RouterLink } from "react-router-dom";

import { Box, Container, Heading, Link as ChakraLink, Button, HStack } from '@chakra-ui/react';

import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext";
import RegisterPage from "./pages/RegisterPage.jsx"; 


function App() {
  const { token, logout } = useAuth();

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="container.xl" py={4}>

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
          
          <Box>
            {token ? (
              <>
              <HStack as="nav" spacing={4}> 

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
              <ChakraLink as={RouterLink} to="/login" fontWeight="bold">
                تسجيل الدخول
              </ChakraLink>
          
            )}
          </Box>
        </Box>

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