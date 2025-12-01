import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// استيراد مكونات Chakra UI
import {
  Box, Button, FormControl, FormLabel, Input, Heading, Alert, AlertIcon, Link, Text
} from '@chakra-ui/react';

function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // استخدام API إنشاء المستخدم الذي بنيناه سابقًا
      await axios.post('http://localhost:8000/users/', formData);

      alert('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.');
      navigate('/login'); // توجيه المستخدم إلى صفحة تسجيل الدخول بعد النجاح

    } catch (err) {
      const errorMessage = err.response?.data?.detail || "حدث خطأ ما. حاول مرة أخرى.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        إنشاء حساب جديد
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <FormControl isRequired mb={4}>
          <FormLabel>البريد الإلكتروني</FormLabel>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </FormControl>
        
        <FormControl isRequired mb={6}>
          <FormLabel>كلمة المرور</FormLabel>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </FormControl>
        
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="green"
          width="full"
          isLoading={isLoading}
        >
          إنشاء حساب
        </Button>
      </form>

      <Text mt={4} textAlign="center">
        لديك حساب بالفعل؟{' '}
        <Link as={RouterLink} to="/login" color="blue.500" fontWeight="bold">
          سجل الدخول من هنا
        </Link>
      </Text>
    </Box>
  );
}

export default RegisterPage;