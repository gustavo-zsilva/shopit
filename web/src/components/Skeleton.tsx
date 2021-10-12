import { Skeleton as SkeletonComponent, SkeletonProps } from "@chakra-ui/react"

type SkeletonFNProps = SkeletonProps

export function Skeleton({ children, ...skeletonProps }: SkeletonFNProps) {
    return (
        <SkeletonComponent
            startColor="pink.300"
            endColor="orange.300"
            {...skeletonProps}
        >
            {children}
        </SkeletonComponent>
    )
}