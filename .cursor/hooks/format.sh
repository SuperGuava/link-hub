#!/bin/bash

# stdin에서 JSON 입력 읽기
input=$(cat)

# file_path 추출 (간단한 grep/sed)
file_path=$(echo "$input" | grep -oE '"file_path"\s*:\s*"[^"]*"' | sed -E 's/.*"file_path"\s*:\s*"([^"]*)".*/\1/')

# file_path가 있고 파일이 존재하면 포맷팅
if [ -n "$file_path" ] && [ -f "$file_path" ]; then
  # TypeScript/JavaScript 파일만 포맷팅
  if [[ "$file_path" == *.ts ]] || [[ "$file_path" == *.tsx ]] || [[ "$file_path" == *.js ]] || [[ "$file_path" == *.jsx ]]; then
    pnpm exec prettier --write "$file_path" > /dev/null 2>&1 || true
  fi
fi

exit 0