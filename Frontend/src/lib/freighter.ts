'use client'

import { getAddress, getNetwork, isConnected, requestAccess } from '@stellar/freighter-api'

export interface FreighterState {
  available: boolean
  connected: boolean
  address: string | null
  network: string | null
  networkPassphrase: string | null
  error: string | null
}

function extractError(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'message' in value) {
    return String((value as { message?: string }).message ?? 'Unknown error')
  }

  return 'Unknown error'
}

export async function getFreighterState(): Promise<FreighterState> {
  try {
    const connectionResult = await isConnected()

    if ('error' in connectionResult && connectionResult.error) {
      return {
        available: false,
        connected: false,
        address: null,
        network: null,
        networkPassphrase: null,
        error: extractError(connectionResult.error),
      }
    }

    if (!connectionResult.isConnected) {
      return {
        available: false,
        connected: false,
        address: null,
        network: null,
        networkPassphrase: null,
        error: null,
      }
    }

    const [addressResult, networkResult] = await Promise.all([getAddress(), getNetwork()])

    return {
      available: true,
      connected: Boolean(addressResult.address),
      address: addressResult.address || null,
      network: 'network' in networkResult ? networkResult.network ?? null : null,
      networkPassphrase: 'networkPassphrase' in networkResult ? networkResult.networkPassphrase ?? null : null,
      error:
        ('error' in addressResult && addressResult.error && extractError(addressResult.error)) ||
        ('error' in networkResult && networkResult.error && extractError(networkResult.error)) ||
        null,
    }
  } catch (error) {
    return {
      available: false,
      connected: false,
      address: null,
      network: null,
      networkPassphrase: null,
      error: extractError(error),
    }
  }
}

export async function connectFreighter(): Promise<FreighterState> {
  try {
    const connectionResult = await isConnected()

    if ('error' in connectionResult && connectionResult.error) {
      throw new Error(extractError(connectionResult.error))
    }

    if (!connectionResult.isConnected) {
      throw new Error('Freighter extension is not installed.')
    }

    const accessResult = await requestAccess()

    if ('error' in accessResult && accessResult.error) {
      throw new Error(extractError(accessResult.error))
    }

    const networkResult = await getNetwork()

    return {
      available: true,
      connected: Boolean(accessResult.address),
      address: accessResult.address || null,
      network: 'network' in networkResult ? networkResult.network ?? null : null,
      networkPassphrase: 'networkPassphrase' in networkResult ? networkResult.networkPassphrase ?? null : null,
      error: 'error' in networkResult && networkResult.error ? extractError(networkResult.error) : null,
    }
  } catch (error) {
    return {
      available: true,
      connected: false,
      address: null,
      network: null,
      networkPassphrase: null,
      error: extractError(error),
    }
  }
}
