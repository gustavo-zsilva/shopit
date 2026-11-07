import { useToast } from '@chakra-ui/react'

const APK_PATH = '/assets/shopit.apk'
const APK_NAME = 'shopit.apk'

export function useDownload() {
    const toast = useToast()

    function handleDownloadApp() {
        const link = document.createElement('a')
        link.href = APK_PATH
        link.download = APK_NAME
        document.body.appendChild(link)
        link.click()
        link.remove()

        toast({
            title: 'Download started',
            description: 'Shopit.apk is downloading.',
            status: 'success',
            position: 'top',
            duration: 4000,
        })
    }

    return {
        handleDownloadApp,
    }
}
