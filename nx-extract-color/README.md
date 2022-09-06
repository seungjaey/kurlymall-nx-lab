# nx-extract-color
> 색상코드를 사용중인 모든 파일을 조사합니다.

## Example
```
sh ./extract.sh /Users/mk-mac-135/Kurly/kurlymall-nx

ts-node index.ts
```

## Result
```
kurlymall-nx-lab
  ㄴ nx-extract-color
    ㄴ result
      ㄴ COLOR_LIST.json
```
- `COLOR_LIST.json`: 파일 경로와 색상 코드로 구성된 튜플들의 목록 입니다.
