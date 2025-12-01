import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // 1. استيراد وإعادة تسمية

// 2. تحديث قائمة استيراد Chakra UI
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Alert,
  AlertIcon,
  useToast,
  Text, // إضافة Text
  Link    // إضافة Link (سيتم استخدامه كـ ChakraLink)
} from '@chakra-ui/react';


function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setToken } = useAuth();
  const navigate = useNavigate();
  const toast = useToast(); // 2. تعريف toast

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/login',
        new URLSearchParams(formData),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const accessToken = response.data.access_token;
      setToken(accessToken);
      
      // 3. استخدام toast بدلاً من alert
      toast({
        title: "تم تسجيل الدخول بنجاح.",
        description: "جاري توجيهك إلى لوحة التحكم.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top'
      });

      navigate('/');

    } catch (err) {
      setError('فشل تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        تسجيل الدخول
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <FormControl isRequired mb={4}>
          <FormLabel>البريد الإلكتروني</FormLabel>
          <Input type="email" name="username" value={formData.username} onChange={handleChange} />
        </FormControl>
        
        <FormControl isRequired mb={6}>
          <FormLabel>كلمة المرور</FormLabel>
          <Input type="password" name="password" value={formData.password} onChange={handleChange} />
        </FormControl>
        
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Button type="submit" colorScheme="blue" width="full" isLoading={isLoading}>
          دخول
        </Button>
      </form>

{/* --- هذا هو الجزء الجديد والمهم --- */}
      <Text mt={6} textAlign="center">
        ليس لديك حساب؟{' '}
        <Link as={RouterLink} to="/register" color="blue.500" fontWeight="bold">
          أنشئ حسابًا جديدًا
        </Link>
      </Text>

    </Box>
  );
}

export default LoginPage;