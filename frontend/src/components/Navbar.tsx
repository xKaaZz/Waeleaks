import { Box, Flex, Button, Heading, Text } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box bg="blue.500" px={4} py={3}>
      <Flex maxW="container.xl" mx="auto" align="center" justify="space-between">
        <RouterLink to="/">
          <Heading size="lg" color="white">
            Manga Lector
          </Heading>
        </RouterLink>

        <Flex align="center" gap={4}>
          {username ? (
            <>
              <Text color="white">Bonjour, {username}</Text>
              <Button colorScheme="whiteAlpha" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <RouterLink to="/login">
                <Button colorScheme="whiteAlpha">Connexion</Button>
              </RouterLink>
              <RouterLink to="/register">
                <Button colorScheme="whiteAlpha">Inscription</Button>
              </RouterLink>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
