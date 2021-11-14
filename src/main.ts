import { Plugin, setIcon, Platform } from 'obsidian';
import type { TopBarButtonsSettings } from './interfaces';
import TopBarButtonsSettingTab from './settings';
import { addAllFeatherIcons } from 'obsidian-community-lib';
import { obsiIcons } from './constants';

const DEFAULT_SETTINGS: TopBarButtonsSettings = {
    enabledButtons: [],
    desktop: false,
};

export default class TopBarButtonsPlugin extends Plugin {
    settings!: TopBarButtonsSettings;
    // https://github.com/phibr0/obsidian-customizable-sidebar/blob/master/src/main.ts
    iconList: string[] = obsiIcons

    addButton = (viewActions: Element, buttonId: string, icon: string) => {
        let iconSize = 24
        if (Platform.isMobile) {
            iconSize = 24
        } else if (Platform.isDesktop) {
            iconSize = 18
        }
        const buttonIcon = createEl('a', {
            cls: ['view-action', buttonId],
        });
        setIcon(buttonIcon, icon, iconSize);
        viewActions.prepend(buttonIcon);

        this.registerDomEvent(buttonIcon, 'click', () => {
            this.app.commands.executeCommandById(buttonId);
        });
    };

    removeButton = (buttonId: string) => {
        const activeLeaves = document.getElementsByClassName(
            'workspace-leaf-content'
        );
        for (let i = 0; i < activeLeaves.length; i++) {
            const leaf = activeLeaves[i];
            const element = leaf.getElementsByClassName(
                `view-action ${buttonId}`
            );
            if (element[0]) {
                element[0].remove();
            }
        }
    };

    async onload() {
        console.log('loading Top Bar Buttons Plugin');

        await this.loadSettings();

        addAllFeatherIcons();

        

        if (Platform.isMobile || this.settings.desktop) {
            this.registerEvent(
                this.app.workspace.on('file-open', () => {
                    const activeLeaf = document.getElementsByClassName(
                        'workspace-leaf mod-active'
                    )[0];
                    const viewActions =
                        activeLeaf.getElementsByClassName('view-actions')[0];

                    for (
                        let i = this.settings.enabledButtons.length - 1;
                        i >= 0;
                        i--
                    ) {
                        if (
                            !viewActions.getElementsByClassName(
                                `view-action ${this.settings.enabledButtons[i].id}`
                            )[0]
                        ) {
                            this.addButton(
                                viewActions,
                                this.settings.enabledButtons[i].id,
                                this.settings.enabledButtons[i].icon
                            );
                        }
                    }
                })
            );
        }

        this.addSettingTab(new TopBarButtonsSettingTab(this.app, this));
    }

    onunload() {
        console.log('unloading Top Bar Buttons Plugin');
        const enabledButtons = this.settings.enabledButtons;
        for (let button of enabledButtons) {
            this.removeButton(button.id);
        }
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
