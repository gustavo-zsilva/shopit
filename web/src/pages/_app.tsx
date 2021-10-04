import { ChakraProvider } from '@chakra-ui/react'
import { globalStyles } from '../styles/global'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={globalStyles}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
