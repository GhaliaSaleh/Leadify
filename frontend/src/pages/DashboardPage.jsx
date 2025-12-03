import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Link as RouterLink } from "react-router-dom";

import { BASE_URL } from '../config';

// Chakra UI Imports
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon, VStack, HStack, Divider, Button, useDisclosure, Link as ChakraLink, Tag, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';

// Our Custom Components and Context
import { useAuth } from '../context/AuthContext';
import UploadAssetForm from '../components/UploadAssetForm.jsx';
import CreateCampaignForm from '../components/CreateCampaignForm.jsx';
import SubscribersList from '../components/SubscribersList.jsx';
import CampaignEditor from '../components/CampaignEditor.jsx';
import InstallCodeModal from '../components/InstallCodeModal.jsx'; 

function DashboardPage() {
  const { token, user } = useAuth();
  
  // States for data
  const [assets, setAssets] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [visibleSubscribers, setVisibleSubscribers] = useState({});
  const [error, setError] = useState('');

  // Chakra UI Hooks
  const toast = useToast();
  const { isOpen: isEditorOpen, onOpen: onEditorOpen, onClose: onEditorClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const { isOpen: isInstallOpen, onOpen: onInstallOpen, onClose: onInstallClose } = useDisclosure();
  
  // State to manage which item is being processed
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const cancelRef = useRef();

  // Memoized API client
  const apiClient = useCallback(() => {
    return axios.create({

      baseURL: BASE_URL, 
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }, [token]);

  // Effect to fetch all data on load
  useEffect(() => {
    const fetchData = async () => {
      setError('');
      try {
        const [assetsRes, campaignsRes] = await Promise.all([
          apiClient().get('/assets/'),
          apiClient().get('/campaigns/')
        ]);
        setAssets(assetsRes.data);
        setCampaigns(campaignsRes.data);
      } catch (err) {
        console.error(err)
        setError('فشل في جلب البيانات من الخادم.');
      }
    };
    if (token) {
      fetchData();
    }
  }, [token, apiClient]);


  const handleUploadSuccess = (newAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleCampaignSuccess = (newCampaign) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  const toggleSubscribers = async (campaignId) => {
    if (visibleSubscribers[campaignId]) {
      setVisibleSubscribers(prev => ({ ...prev, [campaignId]: null }));
      return;
    }
    try {
      const response = await apiClient().get(`/campaigns/${campaignId}/subscribers`);
      setVisibleSubscribers(prev => ({ ...prev, [campaignId]: response.data }));
    } catch (error) {
      console.error(error)
      toast({ title: "فشل في جلب المشتركين.", status: "error", duration: 5000, isClosable: true, position: 'top' });
    }
  };

  const handleExport = async (campaignId) => {
    try {
      const response = await apiClient().get(`/campaigns/${campaignId}/subscribers/csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subscribers_campaign_${campaignId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error)
      toast({ title: "فشل في تصدير القائمة.", status: "error", duration: 5000, isClosable: true, position: 'top' });
    }
  };

  const openInstallModal = (campaign) => {
    setSelectedCampaign(campaign);
    onInstallOpen();
  };
  
  const openDeleteAlert = (id, type) => {
    setItemToDelete({ id, type });
    onAlertOpen();
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'asset') {
      handleDeleteAsset(itemToDelete.id);
    } else if (itemToDelete.type === 'campaign') {
      handleDeleteCampaign(itemToDelete.id);
    }
    onAlertClose();
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      await apiClient().delete(`/assets/${assetId}`);
      setAssets(prev => prev.filter(a => a.id !== assetId));
      toast({ title: "تم حذف المحتوى.", status: "info", duration: 3000, isClosable: true, position: 'top' });
    } catch (error) {
      toast({ title: "فشل الحذف.", description: error.response?.data?.detail, status: "error", duration: 5000, isClosable: true, position: 'top' });
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await apiClient().delete(`/campaigns/${campaignId}`);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      toast({ title: "تم حذف الحملة.", status: "info", duration: 3000, isClosable: true, position: 'top' });
    } catch (error) {
      toast({ title: "فشل الحذف.", description: error.response?.data?.detail, status: "error", duration: 5000, isClosable: true, position: 'top' });
    }
  };

  const openEditor = (campaign) => {
    setSelectedCampaign(campaign);
    onEditorOpen();
  };
  
  const handleUpdateCampaign = (updatedCampaign) => {
    setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
  };


  // --- Render Logic ---
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;
  if (!user) {
    return (
      <Box textAlign="center" p={10}><Spinner size="xl" /></Box>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      <HStack justifyContent="space-between">
        <Box>
          <Heading as="h2" size="xl">لوحة التحكم</Heading>
          <Text fontSize="lg" color="gray.600">أهلاً بك مرة أخرى، {user.email}!</Text>
        </Box>
        <Tag size="lg" colorScheme={user.plan === 'free' ? "orange" : "green"} variant="solid" borderRadius="full">
          {user.plan.toUpperCase()} PLAN
        </Tag>
      </HStack>
      
      <HStack spacing={8} align="start" flexDirection={{ base: "column", md: "row" }}>
        <Box flex={1} w="full"><UploadAssetForm onUploadSuccess={handleUploadSuccess} /></Box>
        <Box flex={1} w="full">
          <CreateCampaignForm 
            assets={assets} 
            onSuccess={handleCampaignSuccess}
            isDisabled={user.plan === 'free' && campaigns.length >= 1} 
          />
          {(user.plan === 'free' && campaigns.length >= 1) && (
            <Alert status="warning" mt={2} borderRadius="md">
              <AlertIcon />
              <Box fontSize="sm">
                <Text>لقد وصلت للحد الأقصى في الخطة المجانية.</Text>
                <ChakraLink href="#" color="teal.500" fontWeight="bold">
                  قم بترقية حسابك الآن!
                </ChakraLink>
              </Box>
            </Alert>
          )}
        </Box>
      </HStack>

      <Divider />

      <VStack spacing={4} align="stretch">
        <Heading as="h3" size="lg">حملاتك ({campaigns.length})</Heading>
        {campaigns.length > 0 ? (
          campaigns.map(campaign => (
            <Box key={campaign.id} p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
              <HStack justifyContent="space-between">
                <Text fontWeight="bold" fontSize="lg">{campaign.name}</Text>
                <Tag size="sm">ID: {campaign.id}</Tag>
              </HStack>
              <Text fontSize="sm" color="gray.500">مرتبطة بالمحتوى ID: {campaign.asset_id}</Text>
              
              <HStack mt={4} spacing={3} flexWrap="wrap">
                <Button size="sm" onClick={() => toggleSubscribers(campaign.id)}>{visibleSubscribers[campaign.id] ? 'إخفاء' : 'عرض'} المشتركين</Button>
                <Button size="sm" colorScheme="blue" onClick={() => openEditor(campaign)}>تخصيص</Button>
                <Button size="sm" colorScheme="teal" variant="outline" onClick={() => openInstallModal(campaign)}>الحصول على الكود</Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => openDeleteAlert(campaign.id, 'campaign')}>حذف</Button>
              </HStack>

              {visibleSubscribers[campaign.id] && (
                <Box mt={4}><SubscribersList subscribers={visibleSubscribers[campaign.id]} campaignId={campaign.id} onExport={handleExport} /></Box>
              )}
            </Box>
          ))
        ) : <Text>لم تقم بإنشاء أي حملات بعد.</Text>}
      </VStack>
      
      <Divider />

      <VStack spacing={4} align="stretch">
        <Heading as="h3" size="lg">المحتوى الرقمي الخاص بك</Heading>
        {assets.length > 0 ? (
          <VStack borderWidth="1px" borderRadius="md" spacing={0} align="stretch" overflow="hidden">
            {assets.map((asset, index) => (
              <HStack 
                key={asset.id} 
                justifyContent="space-between" 
                alignItems="center" 
                p={3}
                bg={index % 2 === 0 ? 'gray.50' : 'white'}
              >
                <Text fontWeight="medium">{asset.name}</Text>
                <Button size="sm" colorScheme="red" variant="outline" onClick={() => openDeleteAlert(asset.id, 'asset')}>حذف</Button>
              </HStack>
            ))}
          </VStack>
        ) : <Text>لم تقم برفع أي محتوى بعد.</Text>}
      </VStack>

      <CampaignEditor 
        campaign={selectedCampaign}
        isOpen={isEditorOpen}
        onClose={onEditorClose}
        onUpdate={handleUpdateCampaign}
      />
      {selectedCampaign && (
        <InstallCodeModal 
            isOpen={isInstallOpen}
            onClose={onInstallClose}
            campaignId={selectedCampaign.id}
        />
      )}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay><AlertDialogContent>
          <AlertDialogHeader>تأكيد الحذف</AlertDialogHeader>
          <AlertDialogBody>هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onAlertClose}>إلغاء</Button>
            <Button colorScheme="red" onClick={confirmDelete} ml={3}>حذف</Button>
          </AlertDialogFooter>
        </AlertDialogContent></AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}

export default DashboardPage;