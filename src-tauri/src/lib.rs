// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::time::Duration;
use tauri_plugin_store::StoreExt;
#[tauri::command]

fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
#[cfg(desktop)]
mod tray;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let store = app
                .handle()
                .store_builder("store.bin")
                .auto_save(Duration::from_millis(100))
                .build();

            let _ = store.load();
            let value = store
                .get("value")
                .and_then(|v| v.as_str().map(String::from))
                .unwrap_or_else(|| "".to_owned());
            let boolean = store
                .get("boolean")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            println!("{}", value); // {"value":""}
            println!("{}", boolean); // {"value":false}

            #[cfg(all(desktop))]
            {
                let handle = app.handle();
                tray::create_tray(handle)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
