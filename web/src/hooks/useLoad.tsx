import { useState } from "react"

export function useLoad() {

    const [isImageLoading, setIsImageLoading] = useState(true)
    const [isHeroLoading, setIsHeroLoading] = useState(true)

    function handleImageLoadFinish() {
        setIsImageLoading(false)
    }

    function handleHeroLoadFinish() {
        setIsHeroLoading(false)
    }

    return {
        isImageLoading,
        isHeroLoading,
        handleImageLoadFinish,
        handleHeroLoadFinish,
    }
}