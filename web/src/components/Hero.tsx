import Image from 'next/image'
import { Flex, GridItem } from '@chakra-ui/react'

export function Hero() {
    return (
        <GridItem
          border="16px solid #1A202C"
          borderRadius="2rem"
          overflow="hidden"
          boxShadow="-5px 5px 0px 3px #171923"
          w="fit-content"
          h="fit-content"
          justifySelf="flex-end"
          gridArea="Hero"
          display={{ lg: "flex", sm: "none" }}
        >
          <Image
            width={300}
            height={520}
            src="/assets/hero.png"
            alt="Hero"
          />
        </GridItem>
    )
}