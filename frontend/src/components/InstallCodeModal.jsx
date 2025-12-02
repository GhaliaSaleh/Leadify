import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Box, Text, useToast, Code
} from '@chakra-ui/react';

function InstallCodeModal({ isOpen, onClose, campaignId }) {
  const toast = useToast();
  
  if (!campaignId) {
    return null;
  }

 
  // ---------------------------------------------------------
  const origin = window.location.origin;
  
  const widgetCode = `<script src="${origin}/widget.js" data-campaign-id="${campaignId}" defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode).then(() => {
      toast({ 
        title: "تم نسخ الكود!", 
        description: "الصقه في موقعك ليعمل النظام فوراً.",
        status: "success", 
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>تثبيت الحملة</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>
            انسخ هذا الكود والصقه في موقعك قبل وسم الإغلاق 
            <Code fontSize="sm" mx={1} p={1} borderRadius="md" bg="gray.100">
              {'</body>'}
            </Code>
            .
          </Text>
          <Box bg="gray.900" p={4} borderRadius="md" color="white">
            <Code bg="transparent" whiteSpace="pre-wrap" dir="ltr">
              {widgetCode}
            </Code>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleCopy} mr={3}>
            نسخ الكود
          </Button>
          <Button variant="ghost" onClick={onClose}>
            إغلاق
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default InstallCodeModal;