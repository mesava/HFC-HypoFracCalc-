export function downloadJsonFile(
  filenamePrefix: string,
  jsonText: string,
  generatedAtIso: string,
): void {
  const blob = new Blob(
    [jsonText],
    { type: "application/json;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const stamp = generatedAtIso
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .replace("Z", "");

  anchor.href = url;
  anchor.download =
    filenamePrefix + "_" + stamp + ".json";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
