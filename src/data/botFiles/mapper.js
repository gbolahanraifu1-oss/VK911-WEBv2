// VK911 XMD — Bot File Mapper
// Maps file keys to their content
import { INDEX_JS } from "./index.js";
import { CONFIG_JS } from "./config.js";
import { ENV_EXAMPLE } from "./env.js";
import { README_MD } from "./readme.js";
import {
  LIB_CONNECTION_JS,
  LIB_HANDLER_JS,
  LIB_API_SERVER_JS,
  LIB_FUNCTIONS_JS,
  LIB_DATABASE_JS,
} from "./lib.js";
import { PLUGINS_ADMIN_JS, PLUGINS_INFO_JS } from "./plugins1.js";
import {
  PLUGINS_FUN_JS,
  PLUGINS_AI_JS,
  PLUGINS_DOWNLOADER_JS,
  PLUGINS_NSFW_JS,
} from "./plugins2.js";
import {
  PLUGINS_GROUP_JS,
  PLUGINS_MEDIA_JS,
  PLUGINS_UTILITY_JS,
} from "./plugins3.js";

export const BOT_FILES_MAP = {
  "index-js": INDEX_JS,
  "config-js": CONFIG_JS,
  "env-example": ENV_EXAMPLE,
  "lib_connection-js": LIB_CONNECTION_JS,
  "lib_handler-js": LIB_HANDLER_JS,
  "lib_apiServer-js": LIB_API_SERVER_JS,
  "lib_functions-js": LIB_FUNCTIONS_JS,
  "lib_database-js": LIB_DATABASE_JS,
  "plugins_admin-js": PLUGINS_ADMIN_JS,
  "plugins_info-js": PLUGINS_INFO_JS,
  "plugins_fun-js": PLUGINS_FUN_JS,
  "plugins_ai-js": PLUGINS_AI_JS,
  "plugins_downloader-js": PLUGINS_DOWNLOADER_JS,
  "plugins_nsfw-js": PLUGINS_NSFW_JS,
  "plugins_group-js": PLUGINS_GROUP_JS,
  "plugins_media-js": PLUGINS_MEDIA_JS,
  "plugins_utility-js": PLUGINS_UTILITY_JS,
  "README-md": README_MD,
};

export function getBotFileContent(key) {
  return BOT_FILES_MAP[key] || null;
}
