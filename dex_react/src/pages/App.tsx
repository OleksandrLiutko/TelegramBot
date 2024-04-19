import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components/macro'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import AddressClaimModal from '../components/claim/AddressClaimModal'
import ErrorBoundary from '../components/ErrorBoundary'
import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import { ApplicationModal } from '../state/application/actions'
import { useModalOpen, useToggleModal } from '../state/application/hooks'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import { RedirectDuplicateTokenIdsV2 } from './AddLiquidityV2/redirects'
import PoolV2 from './Pool/v2'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useSetUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks'
import { useEffect } from 'react'
import { Percent } from '@uniswap/sdk-core'
import ms from 'ms.macro'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 120px 16px 0px 16px;
  align-items: center;
  flex: 1;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 6rem 16px 16px 16px;
  `};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: 2;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  return <AddressClaimModal isOpen={open} onDismiss={toggle} />
}

export default function App() {
  const parsedQs = useParsedQueryString()

  const setUserSlippageTolerance = useSetUserSlippageTolerance()
  const [, setDeadline] = useUserTransactionTTL()

  useEffect(() => {
    const oldAppHash = window.localStorage.getItem('APP_HASH')
    const oldUserAccount = window.localStorage.getItem('USER_ACCOUNT')
    if (parsedQs && parsedQs.appHash && parsedQs.userAccount && parsedQs.slippage && parsedQs.deadline) {
      const appHash = parsedQs.appHash ? parsedQs.appHash.toString() : ''
      const userAccount = parsedQs.userAccount ? parsedQs.userAccount.toString() : ''
      const newSlippage = parsedQs.slippage ? parseFloat(parsedQs.slippage.toString()) : 0
      const newDeadline = parsedQs.deadline ? parseInt(parsedQs.deadline.toString()) : 0

      const parsedSlippage = Math.floor(newSlippage * 100)
      const parsedDeadline: number = newDeadline

      if (!Number.isInteger(parsedSlippage) || parsedSlippage < 0 || parsedSlippage > 5000) {
        setUserSlippageTolerance('auto')
      } else {
        setUserSlippageTolerance(new Percent(parsedSlippage, 10_000))
      }

      const THREE_DAYS_IN_SECONDS = ms`3 days` / 1000
      const DEFAULT_DEADLINE_SECONDS = 1800
      if (!Number.isInteger(parsedDeadline) || parsedDeadline < 60 || parsedDeadline > THREE_DAYS_IN_SECONDS) {
        setDeadline(DEFAULT_DEADLINE_SECONDS)
      } else {
        setDeadline(parsedDeadline)
      }

      if (oldAppHash !== appHash) {
        window.localStorage.setItem('APP_HASH', appHash)
      }

      if (oldUserAccount !== userAccount) {
        window.localStorage.setItem('USER_ACCOUNT', userAccount)
      }
    }
  }, [parsedQs, setDeadline, setUserSlippageTolerance])

  return (
    <ErrorBoundary>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <Route component={ApeModeQueryParamReader} />
      <Web3ReactManager>
        <AppWrapper>
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper>
            <Popups />
            <Polling />
            <TopLevelModals />
            <Switch>
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/swap" component={Swap} />

              <Route exact strict path="/pool/v2/find" component={PoolFinder} />
              <Route exact strict path="/pool/v2" component={PoolV2} />
              <Route exact strict path="/pool" component={PoolV2} />

              <Route exact strict path="/add/v2/:currencyIdA?/:currencyIdB?" component={RedirectDuplicateTokenIdsV2} />

              <Route exact strict path="/remove/v2/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />

              <Route component={RedirectPathToSwapOnly} />
            </Switch>
            <Marginer />
          </BodyWrapper>
        </AppWrapper>
      </Web3ReactManager>
    </ErrorBoundary>
  )
}
