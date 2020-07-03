# DeFi API for Compound

This address has some cDai / Dai: `0x0d0289e9f3eae696fa38e86fc4456228dc1792a7`
You can find other addresses like this on Etherscan:

- Search for the contract of cDai
- Search the last transactions, inspect the sending address, and it should have some dai/cDai

You can try out the API like this:

```bash
curl http://localhost:3000/tokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
curl http://localhost:3000/cTokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
```

## Spin up

```bash
npm start
```
