import { useEffect, useRef } from 'react'
import { Box, Button, HStack, Text } from '@chakra-ui/react'

interface Sound {
    title: string
    url: string
}

interface AudioPlayerProps {
    playlist: Sound[]
    currentIndex: number
    onSelectTrack: (index: number) => void
}

export default function AudioPlayer({
    playlist,
    currentIndex,
    onSelectTrack,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const currentSound = playlist[currentIndex]

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load()
            // ❌ pas de .play() ici → on attend une interaction manuelle
        }
    }, [currentIndex])


    const handleEnded = () => {
        if (currentIndex < playlist.length - 1) {
            onSelectTrack(currentIndex + 1)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            onSelectTrack(currentIndex - 1)
        }
    }

    const handleNext = () => {
        if (currentIndex < playlist.length - 1) {
            onSelectTrack(currentIndex + 1)
        }
    }

    return (
        <Box borderWidth="1px" p={4} borderRadius="md" bg="white" w="100%">
            <Text fontWeight="bold" mb={2}>
                Lecture : {currentSound.title}
            </Text>
            <audio
                ref={audioRef}
                src={currentSound.url}
                controls
                onEnded={handleEnded}
            />
            <HStack mt={2}>
                <Button onClick={handlePrevious} isDisabled={currentIndex === 0}>
                    Précédent
                </Button>
                <Button
                    onClick={handleNext}
                    isDisabled={currentIndex === playlist.length - 1}
                >
                    Suivant
                </Button>
            </HStack>
        </Box>
    )
}
