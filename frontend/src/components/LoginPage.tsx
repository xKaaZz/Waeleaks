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
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async () => {
    try {
      const res = await api.post('/login', {
        username,
        password,
      })

      login(username, res.data.token) // <-- ici utilisation de AuthContext proprement

      const userRes = await api.get('/user/me')
      const { telegram_id, telegram_token } = userRes.data

      if (!telegram_id || !telegram_token) {
        navigate('/update-telegram')
      } else {
        navigate('/')
      }

      toast({ title: 'Connecté avec succès', status: 'success' })
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.response?.data?.detail || "Erreur de connexion",
        status: 'error',
      })
    }
  }

  return (
    <Box px={6} py={8} width="100%" maxW="600px" mx="auto">
      <Heading mb={6} size="lg" textAlign="center">
        Connexion
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
        <Button colorScheme="blue" width="full" onClick={handleLogin}>
          Se connecter
        </Button>
      </VStack>
    </Box>
  )
}
