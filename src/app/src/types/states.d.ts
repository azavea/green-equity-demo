export type StateGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;
export type StateProperties = {
    STATEFP: string;
    STUSPS: string;
    NAME: string;
};
export type StateFeature = GeoJSON.Feature<StateGeometry, StateProperties>;
export type StatesCollection = GeoJSON.FeatureCollection<
    StateGeometry,
    StateProperties
>;
export type StatesLayer = L.GeoJSON<StateProperties, StateGeometry>;
