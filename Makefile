NAME = ft_transcendence
DATA_PATH = ~/goinfre/data
DOCKER-COMPOSE = docker-compose

.PHONY: all
all: $(NAME)

$(NAME):
	mkdir -p $(DATA_PATH)
	mkdir -p $(DATA_PATH)/dist
	mkdir -p $(DATA_PATH)/postgres
	$(DOCKER-COMPOSE) up --build

.PHONY: clean
clean:
	$(DOCKER-COMPOSE) down
	docker rm -f $(docker ps -aq)

.PHONY: fclean
fclean: clean
	rm -rf $(DATA_PATH)
# docker rm -f $(docker ps -aq)
# docker rmi -f $(docker images -aq)

.PHONY: re
re: fclean all
