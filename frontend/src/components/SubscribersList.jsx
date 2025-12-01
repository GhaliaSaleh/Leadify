import React from 'react';

// استيراد مكونات Chakra الخاصة بالجداول والأزرار
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
} from '@chakra-ui/react';

function SubscribersList({ subscribers, campaignId, onExport }) {
  if (!subscribers || subscribers.length === 0) {
    return <Text p={4}>لا يوجد مشتركين في هذه الحملة بعد.</Text>;
  }

  return (
    <Box>
      <Button 
        colorScheme="green" 
        onClick={() => onExport(campaignId)} 
        mb={4}
        size="sm"
      >
        تصدير كـ CSV
      </Button>

      <TableContainer borderWidth="1px" borderRadius="md">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>البريد الإلكتروني</Th>
              <Th>تاريخ التسجيل</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subscribers.map(sub => (
              <Tr key={sub.id}>
                <Td>{sub.id}</Td>
                <Td>{sub.email}</Td>
                {/* تنسيق التاريخ ليكون أكثر قابلية للقراءة */}
                <Td>{new Date(sub.created_at).toLocaleDateString('ar-EG-u-nu-latn')}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default SubscribersList;