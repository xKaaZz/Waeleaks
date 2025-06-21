import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CollectionDetail from '../components/CollectionDetail'
import AddCollectionForm from '../components/AddCollectionForm'
import AddTrackForm from '../components/AddTrackForm'
import LoginPage from '../components/LoginPage'
import RegisterPage from '../components/RegisterPage'
import UpdateTelegramPage from '../components/UpdateTelegramPage'
import { AuthProvider } from '../context/AuthContext'
import Home from '../components/Home'

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Box px={6} py={4} maxW="100%">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collection/:id" element={<CollectionDetail />} />
                <Route path="/collection/:id/add" element={<AddTrackForm />} />
                <Route path="/add" element={<AddCollectionForm />} />
                <Route path="/add-collection" element={<AddCollectionForm />} />
                <Route path="/add-track" element={<AddTrackForm />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/update-telegram" element={<UpdateTelegramPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  )
}

export default App
