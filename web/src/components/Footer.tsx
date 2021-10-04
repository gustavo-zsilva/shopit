import { Flex, Text, Link } from '@chakra-ui/react'

export function Footer() {
    return (
        <Flex
            bgColor="gray.900"
            gridArea="Footer"
            pos="fixed"
            bottom="0"
            left="0"
            right="0"
            p="1.2rem"
        >
            <Flex flexDir="column">
                <Link
                    href="https://github.com/gustavo-zsilva"
                    target="_blank"
                    rel="noopener noreferrer"
                    fontStyle="italic"
                >
                    Gustavo Zonta da Silva
                </Link>
                <Link
                    href="https://github.com/gustavo-zsilva/shopit"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    App Repo
                </Link>
            </Flex>
        </Flex>
    )
}