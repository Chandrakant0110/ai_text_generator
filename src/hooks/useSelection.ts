import { useState, useEffect } from "react"
import { framer, CanvasNode } from "framer-plugin"

/**
 * Hook to get and subscribe to selection in Framer
 */
export function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
} 