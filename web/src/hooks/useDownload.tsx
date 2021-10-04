import { useEffect, useRef, useState } from 'react'
import { useToast, Progress } from '@chakra-ui/react'
import axios from 'axios'

export function useDownload() {

    const [downloadProgress, setDownloadProgress] = useState(0)
    const [error, setError] = useState(null)
    const toast = useToast()
    const toastId = useRef<string | number>()

    useEffect(() => {
        if (downloadProgress === 0) return;

        if (toastId.current) {
          toast.update(toastId.current, {
            title: "Downloading...",
            description: <Progress value={downloadProgress} colorScheme="pink" borderRadius="4px" size="sm" mt=".4rem" />,
            position: "top",
            duration: null,
          })
        }
        
    }, [downloadProgress, toast])

    useEffect(() => {
        if (!error) return;

        toast.update(toastId.current, {
            title: "An error occurred",
            description: error,
            position: "top",
            status: "error",
        })
        setError(null)
        
    }, [error, toast])

    async function handleDownloadApp() {

        toastId.current = toast({
            title: "Downloading...",
            description: <Progress value={downloadProgress} colorScheme="pink" borderRadius="4px" size="sm" mt=".4rem" />,
            duration: null,
            position: "top",
        })

        try {
            const response = await axios.get("https://exp-shell-app-assets.s3.us-west-1.amazonaws.com/android/%40gustavo-silva/shopit-30170529c6d34b50bff55f9d7b640688-signed.apk", 
            {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    const percentageCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    
                    // Only shows toast when it's done downloading and ends cycle
                    if (percentageCompleted === 100) {
                        toast.update(toastId.current, {
                            title: "Downloaded!",
                            description: "You can now install Shopit.",
                            position: "top",
                            status: "success",
                        })
                        toastId.current = null
                        setDownloadProgress(0)
                        return;
                    }

                    setDownloadProgress(percentageCompleted)
                }
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'shopit.apk')
            link.click()
            window.URL.revokeObjectURL(url)

        } catch (err) {
            console.error(err)
            setError(err.message)
        }
        
    }

    return {
        downloadProgress,
        error,
        handleDownloadApp,
    }
}