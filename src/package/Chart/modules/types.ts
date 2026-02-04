export enum EType {
  UNKNOWN = 'UNKNOWN',
  COMBO = 'COMBO',
  PIE = 'PIE',
  DONUT = 'DONUT',
  RADAR = 'RADAR',
  FUNNEL = 'FUNNEL',
}

export enum ERenderBy {
  LOADING = 'LOADING',
  INIT = 'INIT',
  HOVER = 'HOVER',
  SET_SETTINGS = 'SET_SETTINGS',
  SET_DATA = 'SET_DATA',
  RESIZE = 'RESIZE',
  MOUSEMOVE = 'MOUSEMOVE',
  MOUSEOUT = 'MOUSEOUT',
}

export type TProps = {
  element: HTMLCanvasElement;
  data: any;
  settings: any;
  type?: EType;
};

export type TTooltip = {
  title?: {
    value?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  };
  panels?: Array<{
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    colorPanel?: {
      color?: string;
      height?: number;
      x?: number;
      y?: number;
    };
    texts?: Array<{
      value: string;
      height?: number;
      x?: number;
      y?: number;
    }>;
    footer?: {
      text?: string;
      height?: number;
      x?: number;
      y?: number;
    };
  }>;
  x?: number;
  y?: number;
};
