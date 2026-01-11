APP_NAME          := kotodom-gpt
ANSIBLE_PLAYBOOK  := deploy/playbook.yml
ANSIBLE_INVENTORY := ../infra/inventory.ini
INFRA_DIR         := ../infra

include $(INFRA_DIR)/mk/project.mk

deploy-nginx:
	cd deploy && ansible-playbook deploy-nginx.yml \
		--vault-password-file ../../infra/.vault_pass.txt

setup-certbot:
	cd deploy && ansible-playbook setup-certbot.yml \
		--vault-password-file ../../infra/.vault_pass.txt