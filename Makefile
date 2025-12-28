APP_NAME          := kotodom-gpt
ANSIBLE_PLAYBOOK  := deploy/playbook.yml
ANSIBLE_INVENTORY := ../infra/inventory.ini
INFRA_DIR         := ../infra

include $(INFRA_DIR)/mk/project.mk