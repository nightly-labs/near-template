import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { transactions, utils } from 'near-api-js'
import { JsonRpcProvider } from 'near-api-js/lib/providers'
import { useEffect, useState } from 'react'
import './App.css'
import { NightlyWalletAdapter } from './nightly'
import { AccountImportData, NearAccount } from './types'
import docs from './docs.png'
import { KeyPairEd25519 } from 'near-api-js/lib/utils'
import { setupWalletSelector, WalletSelector } from '@near-wallet-selector/core'
import { setupNightly } from '@near-wallet-selector/nightly'
import { setupModal } from '@near-wallet-selector/modal-ui'
import { randomBytes } from 'crypto'

const NightlyNear = new NightlyWalletAdapter()
const selector = await setupWalletSelector({
  network: 'testnet',
  modules: [setupNightly()]
})

const App = () => {
  const [nearAccount, setnearAccount] = useState<NearAccount | undefined>(undefined)

  return (
    <div className='App'>
      <header className='App-header'>
        <div>
          <Button
            variant='contained'
            onClick={() => {
              window.open('https://docs.nightly.app/docs/near/near/detecting')
            }}
            style={{ background: '#2680d9', marginBottom: '64px' }}>
            <img src={docs} style={{ width: '40px', height: '40px', paddingRight: '16px' }} />
            Open documentation
          </Button>
        </div>
        <Typography>
          {nearAccount ? `Hello, ${nearAccount?.accountId}` : 'Hello, stranger'}
        </Typography>
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            const value = await NightlyNear.connect(() => {
              console.log('Trigger disconnect Near')
              setnearAccount(undefined)
            })
            setnearAccount(value)
          }}>
          Connect Near
        </Button>{' '}
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!nearAccount) return
            const provider = new JsonRpcProvider({ url: 'https://rpc.testnet.near.org' })
            const blockInfo = await provider.query(
              `access_key/${nearAccount.accountId}/${
                nearAccount.publicKey.toString().split(':')[1]
              }`,
              ''
            )
            const blockHash = utils.serialize.base_decode(blockInfo.block_hash)
            // @ts-expect-error
            const action = transactions.transfer(utils.format.parseNearAmount('0.0001'))

            const tx = transactions.createTransaction(
              nearAccount.accountId,
              nearAccount.publicKey,
              'norbert.testnet',
              // @ts-expect-error
              ++blockInfo.nonce,
              [action],
              blockHash
            )
            const signedTx = await NightlyNear.signTransaction(tx)
            const id = (await provider.sendTransactionAsync(signedTx)) as unknown as string
            console.log(id)
          }}>
          Send test 0.0001 Near
        </Button>
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!nearAccount) return
            const provider = new JsonRpcProvider({ url: 'https://rpc.testnet.near.org' })
            const blockInfo = await provider.query(
              `access_key/${nearAccount.accountId}/${
                nearAccount.publicKey.toString().split(':')[1]
              }`,
              ''
            )
            const blockHash = utils.serialize.base_decode(blockInfo.block_hash)
            // @ts-expect-error
            const action = transactions.transfer(utils.format.parseNearAmount('0.0001'))

            const tx = transactions.createTransaction(
              nearAccount.accountId,
              nearAccount.publicKey,
              'norbert.testnet',
              // @ts-expect-error
              ++blockInfo.nonce,
              [action],
              blockHash
            )
            const actionTokenSend = transactions.functionCall(
              'ft_transfer',
              { amount: '11111', memo: '', receiver_id: 'norbert.testnet' },
              // @ts-expect-error
              30000000000000, // attached gas
              '1'
            )
            const tx2 = transactions.createTransaction(
              nearAccount.accountId,
              nearAccount.publicKey,
              'banana.ft-fin.teset',
              // @ts-expect-error
              blockInfo.nonce + 2,
              [actionTokenSend],
              blockHash
            )
            const signedTxs = await NightlyNear.signAllTransactions([tx, tx2])
            for (const signedTx of signedTxs) {
              const id = (await provider.sendTransactionAsync(signedTx)) as unknown as string
              console.log(id)
            }
          }}>
          sign all 0.0001 Near
        </Button>
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!nearAccount) return
            const signedMessage = await NightlyNear.signMessage({
              message: 'hello world <3',
              recipient: 'norbert.testnet',
              nonce: randomBytes(32)
            })
            console.log(signedMessage)
          }}>
          Sign message
        </Button>
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            const account = KeyPairEd25519.fromRandom()
            const accounts: AccountImportData[] = [
              { accountId: 'accountId', privateKey: account.secretKey.toString() }
            ]
            await NightlyNear.importWalletsNear(accounts)
          }}>
          Import random account
        </Button>
        <Button
          variant='contained'
          style={{ margin: 10, background: '#f50057' }}
          onClick={async () => {
            await NightlyNear.disconnect()
          }}>
          Disconnect Near
        </Button>
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            const nightlyWallet = await selector.wallet('nightly')

            const connect = await nightlyWallet.signIn({
              contractId: 'guest-book.testnet',
              accounts: []
            })

            const signedMessage = await nightlyWallet.signMessage({
              message: 'hello world',
              recipient: 'norbert.testnet',
              nonce: new Buffer('1')
            })

            console.log(signedMessage)
            // const modal = setupModal(selector, {
            //   contractId: 'guest-book.testnet'
            // })
            // modal.show()
          }}>
          Connect wallet selector
        </Button>
      </header>
    </div>
  )
}

export default App
