use serde_json::{json, Value};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, Runtime,
};
pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let setting_i = MenuItem::with_id(app, "setting", "设置", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&setting_i, &quit_i])?;
    // menu.append_items(&[&setting_i])?;
    let _ = TrayIconBuilder::with_id("tray")
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Tray Tooltip")
        .menu(&menu)
        .menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "setting" => app.emit("open-setting", {}).unwrap(),
            "quit" => {
                app.exit(0);
            }
            // Add more events here
            _ => {}
        })
        .on_tray_icon_event(|tray, event: TrayIconEvent| match event {
            TrayIconEvent::Click {
                id: _,
                position: _,
                rect: _,
                button,
                button_state,
            } => match button {
                MouseButton::Left {} => match button_state {
                    MouseButtonState::Up => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    MouseButtonState::Down => {}
                },
                MouseButton::Right {} => match button_state {
                    MouseButtonState::Up => {}
                    MouseButtonState::Down => {}
                },
                MouseButton::Middle {} => {}
            },
            TrayIconEvent::DoubleClick {
                id: _,
                position: _,
                rect: _,
                button: _,
            } => {}
            TrayIconEvent::Enter {
                id: _,
                position,
                rect: _,
            } => {
                let data: Value = json!({
                  "position":position
                });
                tray.app_handle().emit("tray-mouse-enter", data).unwrap()
            }
            TrayIconEvent::Move {
                id: _,
                position,
                rect: _,
            } => tray.app_handle().emit("tray-mouse-move", position).unwrap(),
            TrayIconEvent::Leave {
                id: _,
                position,
                rect: _,
            } => tray
                .app_handle()
                .emit("tray-mouse-leave", position)
                .unwrap(),
            _ => {}
        })
        .build(app);

    Ok(())
}
