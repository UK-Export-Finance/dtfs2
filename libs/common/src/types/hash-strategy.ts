export type HashStrategy = {
    generateSalt: () => Buffer;
    generateHash: (target: string, salt: Buffer) => Buffer;
}