import {
  Flex,
  Heading,
  Text,
  Divider,
  Button,
  ButtonGroup,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'
import { FiDownload } from 'react-icons/fi'
import { GiCampfire } from 'react-icons/gi'
import { useDownload } from '../hooks/useDownload'
import { Skeleton } from '../components/Skeleton'
import { useLoad } from '../hooks/useLoad'

export function ProductDescription() {

  const { handleDownloadApp } = useDownload()
  
  return (
      <Flex
        flexDir="column"
        gridGap="1rem"
        gridArea="Description"
        alignItems={{ lg: "initial", sm: "center" }}
        textAlign={{ lg: "initial", sm: "center" }}
        mb={{ lg: "initial", sm: "6rem" }}
      >
        <>
          <Heading fontSize={{ lg: "3rem", md: "4rem", sm: "3.2rem" }} textShadow="0 0 5px rgba(255, 255, 255, .8)">
            Your Shopping Helper.
          </Heading>
          
          <Text fontSize="1.5rem">
            Simplistic and Practical.
            No Experience Required.
          </Text>
          
          <Divider />
          
          <Text fontSize="1.1rem" maxW={{ lg: "90%", sm: "80%" }}>
            Shopit handles all the shopping confusion for you,
            just create your lists and start making your life easier.
          </Text>
        </>
        
        <ButtonGroup
          mt={{ xl: "10rem", lg: "8rem", sm: "6rem" }}
          size="lg"
          gridGap="1rem"
          flexDir={{ xl: "initial", sm: "column" }}
          w={{ lg: "100%", sm: "80%" }}
        >
          <Button
            bgColor="bg"
            onClick={handleDownloadApp}
            rightIcon={<FiDownload size={28} />}
            _hover={{ transform: "scale(1.06)" }}
            flex={{ xl: "2", sm: null }}
            w={{ lg: "initial", sm: "100%" }}
          >
            Download
          </Button>
          <Button
            variant="link"
            onClick={() => window.location.href="https://github.com/gustavo-zsilva/shopit"}
            rightIcon={<GiCampfire size={28} />}
            flex="1"
          >
            Behind the scenes
          </Button>
        </ButtonGroup>

        <Alert
          status="warning"
          variant="left-accent"
          borderRadius=".2rem"
          color="#1A202C"
          w={{ lg: "100%", sm: "80%" }}
        >
          <AlertIcon />
          <AlertDescription>Shopit is only available for Android yet.</AlertDescription>
        </Alert>
      </Flex>
  )
}