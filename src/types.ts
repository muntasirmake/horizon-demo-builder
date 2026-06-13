export type EntryPointType = 'rectangle-row' | 'circle-row';
export type DemoType = 'web' | 'app';

export interface ImgData {
  src: string;
  w: number;
  h: number;
}

export interface Hotspot {
  id: number;
  label: string;
  embedCode: string;
  entryPointType: EntryPointType;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DemoState {
  img: ImgData | null;
  hotspots: Hotspot[];
  selectedId: number | null;
}
