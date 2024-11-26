export const encodeMessage = (message: string): Buffer => {
  return Buffer.from(message, "utf-8");
};

export const decodeMessage = (data: Buffer): string => {
  return data.toString("utf-8");
};
