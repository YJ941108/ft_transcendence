# make를 했는데 5432 포트가 열려있다면?

## Mac OS

brew services info postgresql
brew services stop postgresql

## Amazon Linux 2

sudo systemctl status postgresql-12.service
sudo systemctl stop postgresql-12