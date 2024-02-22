import { PluginSettingTab ,Setting, App } from 'obsidian';
import Navigation from './main';

export interface NavigationSettings {
  hoverPreview: boolean;
  TOP_MARGIN: number;
  BOTTOM_MARGIN: number;
}

export const DEFAULT_SETTINGS: NavigationSettings = {
  hoverPreview: false,
  TOP_MARGIN: 0.1,
  BOTTOM_MARGIN: 0.2,
}

export class NavigationSettingsTab extends PluginSettingTab{
  plugin: Navigation;
  TOP_MARGIN: number;

  constructor(app: App, plugin: Navigation) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const {containerEl} = this;
    containerEl.empty()

        containerEl.createEl('h1', { text: 'Navigation Settings' });

        containerEl.createEl('h2', { text: 'General settings' });
        new Setting(containerEl)
            .setName('Replace new tabs with Home tab')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.hoverPreview)
                .onChange(value => { this.plugin.settings.hoverPreview = value; this.plugin.saveSettings() }))
  }
}
