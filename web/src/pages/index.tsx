import Head from 'next/head'
import { Box, Text, Heading } from '@chakra-ui/react'
import Image from '../public/wave.svg'

export default function Home() {
  return (
    <Box p="0 20rem" m="auto" bgColor="bg" h="100vh" backgroundImage={Image}>
      <Head>
        <title>Shopit by Gustavo Zonta da Silva | Your Shopping Helper</title>
      </Head>
      <Heading>Hello NextJS!</Heading>
    </Box>
  )
}
