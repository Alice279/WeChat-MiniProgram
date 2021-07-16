import create from 'zustand'

let Store = null

const createStore = () =>
  create(set => ({
    toBtcAddress: '',
    fromBtcAddress: '',
    tokenFromBackend: {},
    setFromBtcAddress: fromBtcAddress => set({fromBtcAddress}),
    setToBtcAddress: toBtcAddress => set({toBtcAddress}),
    setTokenFromBackend: tokenFromBackend => set({tokenFromBackend}),
  }))

export const useShuttleState = () => {
  if (!Store) Store = createStore()
  const useStore = Store
  const state = useStore()

  return state
}
