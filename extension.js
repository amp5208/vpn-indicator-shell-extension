const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Lang = imports.lang;
const Util = imports.misc.util;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;

const Convenience = Me.imports.convenience;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const IndicatorName = "VpnIndicator";

const VpnIndicator = GObject.registerClass(
    class VpnIndicator extends PanelMenu.Button {

    _init: function() {
        super._init(null, IndicatorName);

        this.parent(0.0, "VPN Indicator", false);
        this.buttonText = new St.Label({
            text: _("Loading..."),
            y_align: Clutter.ActorAlign.CENTER
        });

        this.actor.add_actor(this.buttonText);
        this._icon = new St.Icon({
            style_class: 'system-status-icon'
        });
        this._icon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/up.svg`);
        this.actor.add_actor(this._icon);
        this._refresh();
    },

    _checkVPN: function() {
        let [res, out, err, exit] = GLib.spawn_sync(null, ["/bin/bash", "-c", "ifconfig -a | grep tun0"], null, GLib.SpawnFlags.SEARCH_PATH, null);

        return exit;
    },

    _refresh: function() {
        this._refreshUI(this._checkVPN());

        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }

        this._timeout = Mainloop.timeout_add_seconds(2, Lang.bind(this, this._refresh));
    },

    _refreshUI: function(data) {
        var text;

        if (data == 256) {
            text = "VPN is down!";
        } else if (data == 0) {
            text = "VPN is up!";
        } else {
            text = "Error!";
        }

        this.buttonText.set_text(text);
        this._icon = new St.Icon({
            style_class: 'system-status-icon'
        });
        this._icon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/up.svg`);
        this.actor.add_actor(this._icon);
    }
});

let twMenu;

function init() {
    Convenience.initTranslations();
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(`${extensionMeta.path}/icons`);
}

function enable() {
    twMenu = new VpnIndicator;
    Main.panel.addToStatusArea(IndicatorName, twMenu);
}

function disable() {
    twMenu.destroy();
    twMenu = null;
}
