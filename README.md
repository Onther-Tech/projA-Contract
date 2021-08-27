# projA-Contract

tokenFactory를 통해서 token을 생성합니다.

factory를 통해서 생성되는 token들은 ERC20기능과 permit, approveAndCall, transferAndCall등의 기능을 가지고 있고,
토큰의 관리는 owner, minter, burner를 통해서 관리합니다. owner는 minter와 burner를 관리하고 minter는 mint기능을 관리, burner는 burn기능을 관리합니다.

# 테스트 환경설치

```
npm install
```

# factory 테스트

```
npm run hardhat:factory
```

# approveAndCall, transferAndCall 테스트

```
npm run hardhat:erc1363
```


