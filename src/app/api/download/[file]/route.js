import { getBotFileContent } from "@/data/botFiles/mapper";

export async function loader({ params }) {
  const { file } = params;
  const content = getBotFileContent(file);

  if (!content) {
    return new Response(
      `// File not found: ${file}\n// Available files: index-js, config-js, env-example, lib_connection-js, lib_handler-js, lib_apiServer-js, lib_functions-js, lib_database-js, plugins_admin-js, plugins_group-js, plugins_media-js, plugins_downloader-js, plugins_fun-js, plugins_ai-js, plugins_utility-js, plugins_info-js, plugins_nsfw-js, README-md`,
      { status: 404, headers: { "Content-Type": "text/plain" } }
    );
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
