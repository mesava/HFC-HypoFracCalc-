declare module "*.csv?raw" {
  const csv: string;
  export default csv;
}

declare module "*.json?raw" {
  const rawJson: string;
  export default rawJson;
}
