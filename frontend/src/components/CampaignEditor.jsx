import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
// ---------------------------------------------------------
// 1. استيراد الرابط الديناميكي من ملف الإعدادات
// ---------------------------------------------------------
import { BASE_URL } from '../config'; 

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, VStack, useToast
} from '@chakra-ui/react';

function CampaignEditor({ campaign, isOpen, onClose, onUpdate }) {
  const [settings, setSettings] = useState({ title: '', button_text: '', placeholder_text: '', delay_seconds: 0, button_color: '#000000' });
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const defaultSettings = { title: '', button_text: '', placeholder_text: '', delay_seconds: 0, button_color: '#4263EB' };
    if (campaign) {
      setSettings({ ...defaultSettings, ...(campaign.settings || {}) });
    }
  }, [campaign]);

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleDelayChange = (_, valueAsNumber) => {
    setSettings(prev => ({ ...prev, delay_seconds: valueAsNumber }));
  };
  const handleColorChange = (e) => {
    setSettings(prev => ({ ...prev, button_color: e.target.value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // ---------------------------------------------------------
      // 2. التصحيح هنا: استخدام BASE_URL بدلاً من الرابط الثابت
      // ---------------------------------------------------------
      const apiClient = axios.create({ 
          baseURL: BASE_URL, // <--- هنا التغيير المهم
          headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      const response = await apiClient.put(`/campaigns/${campaign.id}`, { settings });
      onUpdate(response.data);
      toast({ title: "تم حفظ الإعدادات بنجاح.", status: "success", duration: 3000, isClosable: true, position: "top" });
      onClose();
    } catch (error) {
      toast({ title: "فشل حفظ الإعدادات.", description: error.message, status: "error", duration: 5000, isClosable: true, position: "top" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!campaign) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>تخصيص حملة: {campaign.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>عنوان النافذة</FormLabel>
              <Input name="title" value={settings.title} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>نص الزر</FormLabel>
              <Input name="button_text" value={settings.button_text} onChange={handleChange} />
            </FormControl>
             <FormControl>
              <FormLabel>النص داخل حقل الإدخال</FormLabel>
              <Input name="placeholder_text" value={settings.placeholder_text} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>تأخير الظهور (بالثواني)</FormLabel>
              <NumberInput value={settings.delay_seconds} onChange={handleDelayChange} min={0}>
                <NumberInputField />
                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
              </NumberInput>
            </FormControl>
             <FormControl>
              <FormLabel>لون الزر</FormLabel>
              <Input type="color" name="button_color" value={settings.button_color} onChange={handleColorChange} width="100px" p={1} />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>إلغاء</Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={isLoading}>حفظ التغييرات</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
export default CampaignEditor;