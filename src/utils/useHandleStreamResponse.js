import { useCallback } from "react";

function useHandleStreamResponse({ onChunk, onFinish }) {
  const handleStreamResponse = useCallback(
    async (response) => {
      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) { onFinish?.(content); break; }
        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
        onChunk?.(chunk);
      }
    },
    [onChunk, onFinish]
  );
  return { handleStreamResponse };
}

export default useHandleStreamResponse;
