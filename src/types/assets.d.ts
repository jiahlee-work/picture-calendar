declare module "*.png" {
  const asset: number;

  export default asset;
}

declare module "*.xml" {
  const source: import("react-native").ImageSourcePropType;

  export default source;
}
