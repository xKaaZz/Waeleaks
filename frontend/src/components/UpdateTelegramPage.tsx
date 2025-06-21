// src/components/UpdateTelegramPage.tsx
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Input, Heading, VStack, useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig'

export default function UpdateTelegramPage() {
  const [telegramId, setTelegramId] = useState('')
  const [telegramToken, setTelegramToken] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append("telegram_id", telegramId)
      formData.append("telegram_token", telegramToken)

      await api.put("/user/telegram", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      toast({ status: "success", title: "Enregistré" })
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        (Array.isArray(err?.response?.data) ? err.response.data.map(e => e.msg).join(", ") : "Erreur inconnue")
      toast({ status: "error", title: "Erreur", description: msg })
    }
  }

  return (
    <Box px={6} py={8} width="100%" maxW="600px" mx="auto">
      <Heading mb={6} size="lg" textAlign="center">
        Paramètres Telegram
      </Heading>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Telegram ID</FormLabel>
          <Input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Telegram Token</FormLabel>
          <Input value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} />
        </FormControl>
        <Button colorScheme="blue" width="full" onClick={handleSave}>
          Enregistrer
        </Button>
      </VStack>
    </Box>
  )
}
