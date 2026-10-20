#!/bin/zsh
cd "$(dirname "$0")"
if [[ ! -d node_modules/vite ]]; then
  npm install || exit 1
fi
(sleep 2; open 'http://127.0.0.1:5178') &
npm run dev
