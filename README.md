# concordium-testnet-faucet

## Development

Create the .env.local file and fill up the variables.

```bash
cp .env.example .env.local
```

Example enviroment variable values

```bash
NEXT_PUBLIC_EXPLORER_API_URL=https://wallet-proxy.testnet.concordium.com/v1
NEXT_PUBLIC_EXPLORER_URL=https://ccdexplorer.io/
NEXT_PUBLIC_SENDER_ADDRESS=4eDtVqZrkmcNEFziEMSs8S2anvkH5KnsYK4MhwedwGWK1pmjZe
NEXT_PUBLIC_USAGE_LIMIT_IN_DAYS=1
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=3x00000000000000000000FF
NODE_URL=node.testnet.concordium.com
NODE_PORT=20000
CCD_DEFAULT_AMOUNT=1
SENDER_PRIVATE_KEY=12...34
```

Note: the `3x00000000000000000000FF` value in the NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY is a site key provided by Cloudfare for testing purporses, it works fine in local. For setup the Cloudfare Turnstile service in produccion please refer to this [guide](docs/turnstile/SETUP.md).
