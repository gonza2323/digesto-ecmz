import {useCallback, useEffect, useRef, useState} from 'react'
import {getErrorMessage} from '@/utils/errors'

interface AsyncState<T> {
    data: T | null
    loading: boolean
    error: string | null
}

/**
 * Runs `fetcher` on mount and whenever `deps` change. Stale responses (from a
 * previous deps value) are ignored. `reload()` re-runs it manually.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: readonly unknown[]) {
    const fetcherRef = useRef(fetcher)
    fetcherRef.current = fetcher

    const [state, setState] = useState<AsyncState<T>>({data: null, loading: true, error: null})
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let active = true
        setState((previous) => ({data: previous.data, loading: true, error: null}))
        fetcherRef
            .current()
            .then((data) => {
                if (active) setState({data, loading: false, error: null})
            })
            .catch((error: unknown) => {
                if (active) setState({data: null, loading: false, error: getErrorMessage(error)})
            })
        return () => {
            active = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, reloadKey])

    const reload = useCallback(() => setReloadKey((key) => key + 1), [])

    return {...state, reload}
}
