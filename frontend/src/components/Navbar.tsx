import { Box, Flex, Button, Heading, Text, Spacer } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Navbar() {
  const { username, logout, token } = useAuth()
  const navigate = useNavigate()
  const [firstCollectionId, setFirstCollectionId] = useState<number | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (!token) return
    axios
      .get('http://192.168.1.194:8002/api/collections/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        if (res.data.length > 0) {
          setFirstCollectionId(res.data[0].id)
        }
      })
      .catch(err => {
        console.error('Erreur récupération des collections', err)
      })
  }, [token])

  const handleAddTrack = () => {
    if (firstCollectionId) {
      navigate(`/collection/${firstCollectionId}/add`)
    } else {
      navigate('/add-collection')
    }
  }

  return (
    <Box bg="blue.600" px={8} py={4} w="100%">
      <Flex align="center" maxW="1200px" mx="auto" gap={6}>
        <RouterLink to="/">
          <Heading size="lg" color="white">
            Waeleaks
          </Heading>
        </RouterLink>

        {username && (
          <Text color="white" fontWeight="medium">
            Bonjour, {username}
          </Text>
        )}

        <Spacer />

        <Flex gap={3}>
          {username ? (
            <>
              <RouterLink to="/add-collection">
                <Button variant="outline" colorScheme="whiteAlpha">
                  Ajouter une collection
                </Button>
              </RouterLink>
              <Button
                variant="outline"
                colorScheme="whiteAlpha"
                onClick={handleAddTrack}
              >
                Ajouter un son
              </Button>
              <RouterLink to="/update-telegram">
                <Button variant="outline" colorScheme="whiteAlpha">
                  Lier Telegram
                </Button>
              </RouterLink>
              <Button colorScheme="red" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <RouterLink to="/login">
                <Button variant="solid" colorScheme="whiteAlpha">
                  Connexion
                </Button>
              </RouterLink>
              <RouterLink to="/register">
                <Button variant="solid" colorScheme="whiteAlpha">
                  Inscription
                </Button>
              </RouterLink>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
