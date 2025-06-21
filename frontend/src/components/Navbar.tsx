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
    <Box bg="blue.600" px={8} py={4} width="100%">
      <Flex maxW="100%" align="center" justify="space-between">
        <RouterLink to="/">
          <Heading size="lg" color="white">
            Waeleaks
          </Heading>
        </RouterLink>

        <Flex align="center" gap={4} flexWrap="wrap">
          {username ? (
            <>
              <Text color="white">Bonjour, {username}</Text>
              <RouterLink to="/add-collection">
                <Button colorScheme="whiteAlpha" variant="outline">Ajouter une collection</Button>
              </RouterLink>
              <RouterLink to="/add-track">
                <Button colorScheme="whiteAlpha" variant="outline">Ajouter un son</Button>
              </RouterLink>
              <Button colorScheme="red" onClick={handleLogout}>
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
