import Image from 'next/image'
import Link from 'next/link'
import { Flex, Button, Heading } from '@chakra-ui/react'
import { FiDownload } from 'react-icons/fi'
import { useDownload } from '../hooks/useDownload'

export function Header() {

    const { handleDownloadApp } = useDownload()

    return (
        <Flex paddingY="1rem" mb="2rem" justifyContent="space-between" gridArea="Header">
            
            <Link href="/" passHref>
                <Flex alignItems="center" cursor="pointer">
                    <Flex border="1px solid #FFF" borderRadius="6px">
                        <Image
                            width={35}
                            height={35}
                            src="/icon.svg"
                            alt="Icon"
                        />
                    </Flex>
                    <Heading
                        fontSize="1.6rem"
                        fontWeight="500"
                        ml=".6rem"
                    >
                        Shopit
                    </Heading>
                </Flex>
            </Link>

            <Flex>
                <Button
                    bgColor="primary"
                    onClick={handleDownloadApp}
                    rightIcon={<FiDownload size={22} />}
                    _hover={{ bgColor: "primaryDark", boxShadow: "inset 0 0 6px 4px rgba(0, 0, 0, 0.1)" }}
                >
                    Download
                </Button>
            </Flex>
        </Flex>
    )
}