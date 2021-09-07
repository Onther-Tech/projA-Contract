# projA-Contract

tokenFactory를 통해서 token을 생성합니다.

factory를 통해서 생성되는 token들은 ERC20기능과 permit, approveAndCall, transferAndCall등의 기능을 가지고 있고,
토큰의 관리는 owner, minter, burner를 통해서 관리합니다. owner는 minter와 burner를 관리하고 minter는 mint기능을 관리, burner는 burn기능을 관리합니다.

## 테스트 환경설치

```
npm install
```

## factory 테스트

```
npm run hardhat:factory
```

## approveAndCall, transferAndCall 테스트

```
npm run hardhat:tokenSimple
```

## crownSale을 통한 approveAndCall 테스트

```
npm run hardhat:Sale
```


## privateSale 테스트

```
npm run hardhat:privateSale
```

<br>

### private시 owner가 설정해줘야하는 것들
1. writeList설정 -> addwhitelist를 통해서 account, amount를 입력하여서 writelist에 추가합니다. (추후 amount 추가(addwhitelist), 감소(delwhitelist) 가능합니다.)
2. rate비율 (컨트랙트 배포 후 sale시작전까지는 변경가능합니다, sale 시작 후 변경 불가합니다.) -> rateChange로 변경
3. sale의 시작시간과 끝시간 -> settingSaleStartTime, settingSaleEndTime로 setting 가능합니다.
4. claim시작 시간 -> settingClaimTime으로 setting 가능 (start시간을 넣으면 end시간은 start시간 기준으로 계산되어서 세팅됩니다.)