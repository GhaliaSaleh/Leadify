import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import { BASE_URL } from '../config';

import { 
  Box, Button, FormControl, FormLabel, Input, Select, Heading, Alert, AlertIcon, VStack,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast 
} from '@chakra-ui/react';

function CreateCampaignForm({ assets, onSuccess, isDisabled }) {
  const [name, setName] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [delay, setDelay] = useState(3);
  const [buttonColor, setButtonColor] = useState('#4263EB');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { token } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !selectedAssetId) {
      setError('يرجى إدخال اسم واختيار محتوى رقمي.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {

      const apiClient = axios.create({ 
          baseURL: BASE_URL,
          headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      const response = await apiClient.post('/campaigns/', {
        name: name,
        asset_id: parseInt(selectedAssetId),
        settings: {
          title: `احصل على: ${name}`,
          button_text: "احصل عليه الآن!",
          placeholder_text: "ادخل بريدك الإلكتروني",
          delay_seconds: parseInt(delay),
          button_color: buttonColor
        }
      });
      
      toast({
        title: 'تم إنشاء الحملة بنجاح!',
        description: "يمكنك الآن تخصيصها بشكل أكبر.",
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      
      setName('');
      setSelectedAssetId('');
      setDelay(3);
      setButtonColor('#4263EB');
      
      if (onSuccess) onSuccess(response.data);

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'فشل في إنشاء الحملة.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="sm" opacity={isDisabled ? 0.6 : 1} pointerEvents={isDisabled ? 'none' : 'auto'}>
      <Heading as="h4" size="md" mb={4}>إنشاء حملة جديدة</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired isDisabled={isDisabled}>
            <FormLabel>اسم الحملة:</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl isRequired isDisabled={isDisabled}>
            <FormLabel>ربط بمحتوى رقمي:</FormLabel>
            <Select placeholder="-- اختر محتوى --" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)}>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl isDisabled={isDisabled}>
            <FormLabel>تأخير الظهور (بالثواني):</FormLabel>
            <NumberInput value={delay} onChange={(valStr, valNum) => setDelay(valNum)} min={0}>
              <NumberInputField />
              <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl isDisabled={isDisabled}>
            <FormLabel>لون الزر في النافذة:</FormLabel>
            <Input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} width="100px" p={1}/>
          </FormControl>

          {error && <Alert status="error"><AlertIcon />{error}</Alert>}
          <Button type="submit" colorScheme="green" width="full" isLoading={isSubmitting} isDisabled={isDisabled}>إنشاء الحملة</Button>
        </VStack>
      </form>
    </Box>
  );
}
export default CreateCampaignForm;