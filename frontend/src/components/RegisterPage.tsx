import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await api.post('/register', {
        username,
        password,
      })
      toast({ title: 'Inscription réussie', status: 'success' })
      navigate('/login')
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.response?.data?.detail || 'Erreur d\'inscription',
        status: 'error',
      })
    }
  }

  return (
    <Box px={6} py={8} width="100%" maxW="600px" mx="auto">
      <Heading mb={6} size="lg" textAlign="center">
        Inscription
      </Heading>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Nom d'utilisateur</FormLabel>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Mot de passe</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button colorScheme="green" width="full" onClick={handleRegister}>
          Créer un compte
        </Button>
      </VStack>
    </Box>
  )
}
