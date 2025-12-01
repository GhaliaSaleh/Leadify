import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Box, Button, FormControl, FormLabel, Input, Heading, Alert, AlertIcon, VStack, useToast // 1. استيراد useToast
} from '@chakra-ui/react';

function UploadAssetForm({ onUploadSuccess }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAuth();
  const toast = useToast(); // 2. تعريف toast

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name) {
      setError('يرجى إدخال اسم واختيار ملف.');
      return;
    }
    setError('');
    setIsUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    try {
      const apiClient = axios.create({ baseURL: 'http://localhost:8000', headers: { 'Authorization': `Bearer ${token}` } });
      const response = await apiClient.post('/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // 3. استخدام toast بدلاً من alert
      toast({
        title: "تم الرفع بنجاح.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: 'top'
      });

      setName('');
      setFile(null);
      document.getElementById('assetFile').value = null;
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      setError('فشل في رفع الملف. حاول مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
      <Heading as="h4" size="md" mb={4}>رفع محتوى جديد</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="assetName">اسم المحتوى:</FormLabel>
            <Input type="text" id="assetName" value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="assetFile">اختر ملف (PDF):</FormLabel>
            <Input type="file" id="assetFile" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" p={1.5} />
          </FormControl>
          {error && (
            <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>
          )}
          <Button type="submit" colorScheme="blue" width="full" isLoading={isUploading} loadingText="جاري الرفع...">
            رفع الملف
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default UploadAssetForm;