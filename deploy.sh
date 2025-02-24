#!/bin/zsh

rsync -azv --exclude 'node_modules' --exclude '.git' --exclude '.env.local' \
	--exclude 'dist' --exclude 'yarn.lock' --exclude '.wwjs' --exclude '.wwebjs_cache' \
	-e "ssh -i ~/ssl-pem/brazil-windows-wsl2-lenovo-event-facil.pem" \
  . ubuntu@ec2-18-117-189-105.us-east-2.compute.amazonaws.com:~/app

ssh -i ~/ssl-pem/brazil-windows-wsl2-lenovo-event-facil.pem ubuntu@ec2-18-117-189-105.us-east-2.compute.amazonaws.com '
  cd ~/app
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  npm install
	node node_modules/puppeteer/install.js
  npm run build
  pm2 restart all
'