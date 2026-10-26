import { del, get, put } from "@vercel/blob";

export function createStorage(token: string) {
  return {
    async put(
      key: string,
      bytes: Uint8Array,
      options: { httpMetadata: { contentType: string } },
    ) {
      await put(key, Buffer.from(bytes), {
        access: "private",
        token,
        addRandomSuffix: false,
        contentType: options.httpMetadata.contentType,
      });
    },
    async get(key: string) {
      const object = await get(key, { access: "private", token });
      return object?.statusCode === 200 ? { body: object.stream } : null;
    },
    async delete(key: string) {
      await del(key, { token });
    },
  };
}
