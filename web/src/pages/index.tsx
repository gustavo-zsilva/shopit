import Head from 'next/head'
import { Box, Grid } from '@chakra-ui/react'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { ProductDescription } from '../components/ProductDescription'
import { Hero } from '../components/Hero'

export default function Home() {
  return (
    <Box maxW="80rem" m="auto">
      <Head>
        <title>Shopit by Gustavo Silva | Your Shopping Helper</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Grid
        templateColumns={{ lg: "1fr 1fr", sm: null }}
        templateRows="auto 1fr auto"
        templateAreas={`'Header Header' 'Description Hero' 'Footer Footer'`}
        justifyContent="space-between"
        mx={{ xl: null, sm: "2rem" }}
      >
        <Header />
        <ProductDescription />
        <Hero />
        <Footer />
      </Grid>

    </Box>
  )
}
