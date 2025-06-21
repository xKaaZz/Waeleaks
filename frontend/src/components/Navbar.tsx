// ✅ Navbar.tsx responsive
import {
  Box, Flex, Button, Heading, Text, Spacer, IconButton, useDisclosure, Drawer,
  DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody, VStack, Show, Hide
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { username, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box bg="blue.600" px={4} py={3} w="100%">
      <Flex align="center" maxW="1200px" mx="auto">
        <RouterLink to="/">
          <Heading size="lg" color="white">Waeleaks</Heading>
        </RouterLink>

        <Spacer />

        {/* Desktop */}
        <Hide below='md'>
          <Flex gap={3} align="center">
            {username && <Text color="white">Bonjour, {username}</Text>}
            {username ? (
              <>
                {isAdmin && (
                  <RouterLink to="/admin">
                    <Button variant="outline" colorScheme="yellow">Gérer bibliothèque</Button>
                  </RouterLink>
                )}
                <RouterLink to="/update-telegram">
                  <Button variant="outline" colorScheme="whiteAlpha">Lier Telegram</Button>
                </RouterLink>
                <Button colorScheme="red" onClick={onLogout}>Déconnexion</Button>
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
        </Hide>

        {/* Mobile */}
        <Show below='md'>
          <IconButton
            aria-label="Menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
            colorScheme="whiteAlpha"
          />
          <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerBody>
                <VStack spacing={4} mt={10} align="start">
                  {username && <Text>Bonjour, {username}</Text>}
                  {username ? (
                    <>
                      {isAdmin && (
                        <RouterLink to="/admin">
                          <Button variant="outline" colorScheme="yellow" w="full">Gérer bibliothèque</Button>
                        </RouterLink>
                      )}
                      <RouterLink to="/update-telegram">
                        <Button variant="outline" colorScheme="blue" w="full">Lier Telegram</Button>
                      </RouterLink>
                      <Button colorScheme="red" onClick={onLogout} w="full">Déconnexion</Button>
                    </>
                  ) : (
                    <>
                      <RouterLink to="/login">
                        <Button w="full">Connexion</Button>
                      </RouterLink>
                      <RouterLink to="/register">
                        <Button w="full">Inscription</Button>
                      </RouterLink>
                    </>
                  )}
                </VStack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Show>
      </Flex>
    </Box>
  )
}