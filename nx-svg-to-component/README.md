# nx-svg-to-component
> 현재 사용중인 모든 `svg` 파일들을 React Component 로 변환합니다.

## Example
```
# this shell script create `SVG_FILE_PATH_LIST.json`
sh ./extract.sh /Users/mk-mac-135/Kurly/kurlymall-nx/assets

# this command create `result` dir
ts-node index.ts
```

## Result
```
kurlymall-nx-lab
  ㄴ nx-svg-to-component
    ㄴ result
      ㄴ *.tsx
      ㄴ component_list.json
```
- `*.tsx`: SVG 파일이 React 컴포넌트로 변경된 결과물 입니다. 
- `component_list.json`: 원본 파일 경로와 컴포넌트의 이름의 튜플 목록입니다. (Storybook 구축에 사용합니다.)

# Ref
- [svgr](https://react-svgr.com/)