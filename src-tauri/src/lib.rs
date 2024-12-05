// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_store::StoreExt;
use std::time::Duration;
use std::collections::HashMap;
use std::sync::Mutex;

static mut VARIABLE_MAP: Option<Mutex<HashMap<String, String>>> = None;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn set_variable(key: &str, value: &str) {
  unsafe {
      if VARIABLE_MAP.is_none() {
          VARIABLE_MAP = Some(Mutex::new(HashMap::new()));
      }
      let mut map = VARIABLE_MAP.as_mut().unwrap().lock().unwrap();
      map.insert(key.to_string(), value.to_string());
  }
}

#[tauri::command]
fn get_variable(key: &str) -> Option<String> {
  unsafe {
      if let Some(map) = &VARIABLE_MAP {
          let map = map.lock().unwrap();
          map.get(key).cloned()
      } else {
          None
      }
  }
}

#[tauri::command]
fn remove_variable(key: &str) {
  unsafe {
      if let Some(map) = &VARIABLE_MAP {
          let mut map = map.lock().unwrap();
          map.remove(key);
      }
  }
}

#[cfg(desktop)]
mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]), /* arbitrary number of args to pass to your app */
        ))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_websocket::init())
        .invoke_handler(tauri::generate_handler![greet,set_variable,get_variable,remove_variable])
        .setup(|app| {
            let store = app
                .store("store.bin")?;
            let value = store.get("value");
            let boolean = store.get("boolean");
            // let value = store
            //     .get("value")
            //     .and_then(|v| v.as_str().map(String::from))
            //     .unwrap_or_else(|| "".to_owned());
            // let boolean = store
            //     .get("boolean")
            //     .and_then(|v| v.as_bool())
            //     .unwrap_or(false);
            println!("{:?}", value); // {"value":""}
            println!("{:?}", boolean); // {"value":false}

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
