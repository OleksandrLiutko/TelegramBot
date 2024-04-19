/* eslint-disable prettier/prettier */
import { Currency } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { WETH9_EXTENDED } from '../constants/tokens'
import { tryParseAmount } from '../state/swap/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useActiveWeb3React } from './web3'
import { useWETHContract } from './useContract'
import { wethTelegramContract, sendTxWithPkey } from '../utils/telegram'
import { TELEGRAM_CHAIN_ID } from 'connectors'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined | null,
  outputCurrency: Currency | undefined | null,
  typedValue: string | undefined
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string } {
  const { chainId, account } = useActiveWeb3React()
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency ?? undefined)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency ?? undefined), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE
    const weth = WETH9_EXTENDED[chainId]
    if (!weth) return NOT_APPLICABLE

    const hasInputAmount = Boolean(inputAmount?.greaterThan('0'))
    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

    if (inputCurrency.isNative && weth.equals(outputCurrency)) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
              try {
                const depositTx = wethTelegramContract.methods.deposit()
                sendTxWithPkey(
                  depositTx,
                  WETH9_EXTENDED[TELEGRAM_CHAIN_ID]?.address,
                  `0x${inputAmount.quotient.toString(16)}`,
                  addTransaction,
                  { summary: `Wrap ${inputAmount.toSignificant(6)} ETH to WETH` }
                )
              } catch (error) {
                console.error('Could not deposit', error)
              }
            }
            : undefined,
        inputError: sufficientBalance ? undefined : hasInputAmount ? 'Insufficient ETH balance' : 'Enter ETH amount',
      }
    } else if (weth.equals(inputCurrency) && outputCurrency.isNative) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
              try {
                const withdrawTx = wethTelegramContract.methods.withdraw(`0x${inputAmount.quotient.toString(16)}`)
                sendTxWithPkey(
                  withdrawTx,
                  WETH9_EXTENDED[TELEGRAM_CHAIN_ID]?.address,
                  0,
                  addTransaction,
                  { summary: `Unwrap ${inputAmount.toSignificant(6)} WETH to ETH` }
                )
              } catch (error) {
                console.error('Could not withdraw', error)
              }
            }
            : undefined,
        inputError: sufficientBalance ? undefined : hasInputAmount ? 'Insufficient WETH balance' : 'Enter WETH amount',
      }
    } else {
      return NOT_APPLICABLE
    }
  }, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction])
}