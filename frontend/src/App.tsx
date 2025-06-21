import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import AdminPanel from './components/AdminPanel'
import AddCollectionForm from './components/AddCollectionForm'
import AddTrackHorsCollection from './components/AddTrackHorsCollection'
import AddTrackToCollection from './components/AddTrackToCollection'
import CollectionList from './components/CollectionList'
import CollectionDetail from './components/CollectionDetail'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import UpdateTelegramPage from './components/UpdateTelegramPage'

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Box px={6} py={4}>
              <Routes>
                <Route path="/" element={<CollectionList />} />
                <Route path="/collection/:id" element={<CollectionDetail />} />

                {/* admin */}
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/add-collection" element={<AddCollectionForm />} />
                <Route path="/add-track" element={<AddTrackHorsCollection />} />
                <Route path="/add-track-to-collection" element={<AddTrackToCollection />} />

                {/* auth */}
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
