import Chart from '../';
import {
  colorChangeTone,
  deepMerge,
  generateRandomColor,
  getPointOnArc,
  intersectionPolygon,
} from '../../common';
import { ERenderBy, EType, TProps } from '../types';
import settings from './settings';

type TData = Array<{
  value: number;
  label: string;
  color?: string;
}>;

type TPreparedData = Array<{
  value: number;
  label: string;
  percent: number;
  color: string;
  total: number;
  state?: number;
  startPi?: number;
  endPi?: number;
  polygon?: number[];
  hovered?: boolean;
}>;

export default class Slices extends Chart {
  constructor(props: TProps) {
    super({
      ...props,
      settings: deepMerge(structuredClone(settings), props.settings || {}),
    });
  }

  prepareData(data: TData = []): TPreparedData {
    data = data.filter((item) => item.value > 0);

    const total = data.reduce(
      (acc, item) => acc + (parseFloat(String(item.value)) || 0),
      0,
    );

    return data.map((item) => ({
      ...item,
      percent: (100 / total) * item.value,
      total,
      color: item.color || generateRandomColor(),
    }));
  }

  getData = () => this.data as TPreparedData;

  generatePolygon = ({
    count = 20,
    x,
    y,
    radius,
    sliceWidth,
    startPi,
    endPi,
  }) => {
    const polygon = [];
    let part = (endPi - startPi) / count;
    part = isFinite(part) ? part : 0;

    for (let i = 0; i <= count; i++) {
      polygon.push(
        getPointOnArc(x, y, radius + sliceWidth / 2, startPi + part * i),
      );
    }

    for (let i = 0; i <= count; i++) {
      polygon.push(
        getPointOnArc(x, y, radius - sliceWidth / 2, endPi - part * i),
      );
    }

    return polygon;
  };

  tooltip = () => {
    const hovered = this.data.find((item) => item.hovered);

    if (!hovered) {
      return;
    }

    super.tooltip({
      title: {
        value: hovered.label,
      },
      panels: [
        {
          colorPanel: {
            color: hovered.color,
          },
          texts: [
            {
              value: 'Value: ' + hovered.value,
            },
            {
              value: 'Percent: ' + hovered.percent.toFixed(2) + '%',
            },
          ],
          footer: {
            text: 'Total: ' + hovered.total,
          },
        },
      ],
    });
  };

  slices() {
    const canvas = this.canvas;
    const settings = this.getSettings();
    const data = this.getData();
    const cursor = this.cursor;
    const type = this.type;
    const state = this.state;

    const sideSize =
      Math.min(
        canvas.element.clientHeight -
          settings.offset.top -
          settings.offset.bottom -
          (type === EType.DONUT ? settings.data.styles.width : 0),
        canvas.element.clientWidth -
          settings.offset.left -
          settings.offset.right -
          (type === EType.DONUT ? settings.data.styles.width : 0),
      ) * state.loading;

    let sliceWidth = 0;
    let radius = 0;
    const x =
      canvas.element.clientWidth / 2 +
      settings.offset.left -
      settings.offset.right;
    const y =
      canvas.element.clientHeight / 2 +
      settings.offset.top -
      settings.offset.bottom;

    let piOffset = -(Math.PI / 2);

    if (type === EType.PIE) {
      sliceWidth = sideSize / 2;
      radius = sideSize / 4;
    }

    if (type === EType.DONUT) {
      if (settings.data.styles.width >= sideSize) {
        sliceWidth = sideSize;
      } else {
        sliceWidth = settings.data.styles.width;
      }
      radius = sideSize / 2;
    }

    data.forEach((item) => {
      const startPi = piOffset;
      const endPi =
        (2 * Math.PI * state.loading * item.percent) / 100 + piOffset;
      const hoveredValue = settings.data.hover.value * (item.state || 0);

      item.startPi = startPi;
      item.endPi = endPi;

      piOffset = endPi;

      const polygon = this.generatePolygon({
        x,
        y,
        radius: radius + hoveredValue / 2,
        sliceWidth: sliceWidth + hoveredValue,
        startPi,
        endPi,
      });

      const isHovered = intersectionPolygon({
        x: cursor.x,
        y: cursor.y,
        polygon,
      });

      item.polygon = polygon;
      item.hovered = isHovered;

      super.hover({
        item,
        isHovered: item.hovered,
      });

      const slices = [];

      slices.push({
        radius: radius + hoveredValue / 2,
        width: sliceWidth + hoveredValue,
        color: colorChangeTone(item.color, hoveredValue),
        x,
        y,
        startPi,
        endPi,
      });

      if (settings.data.volumed) {
        let volumeRadius = 0;
        let volumeWidth = 0;

        if (type === EType.DONUT) {
          volumeRadius = radius - sliceWidth / 4 + hoveredValue / 2;
          volumeWidth = sliceWidth / 2 + hoveredValue;
        }

        if (type === EType.PIE) {
          volumeRadius = radius - sliceWidth / 6 + hoveredValue / 2;
          volumeWidth = volumeRadius * 2;
        }

        slices.push({
          radius: volumeRadius,
          width: volumeWidth,
          color: colorChangeTone(item.color, -50 + hoveredValue),
          x,
          y,
          startPi,
          endPi,
        });
      }

      slices.forEach((slice) => {
        canvas.context.save();
        canvas.context.beginPath();
        canvas.context.strokeStyle = slice.color;
        canvas.context.lineWidth = slice.width;
        canvas.context.fillStyle = 'transparent';
        canvas.context.arc(
          slice.x,
          slice.y,
          slice.radius > 0 ? slice.radius : 0,
          slice.startPi,
          slice.endPi,
        );
        canvas.context.fill();
        canvas.context.stroke();
        canvas.context.restore();
      });
    });

    if (settings.texts.slicePercent.enabled) {
      data.forEach((item) => {
        canvas.context.font =
          '100 ' + settings.texts.slicePercent.styles.fontSize + 'px arial';
        canvas.context.textAlign = 'center';
        canvas.context.textBaseline = 'middle';
        canvas.context.fillStyle = settings.texts.slicePercent.styles.color;

        let percentRadius = radius;
        const hoveredValue = settings.data.hover.value * (item.state || 0);

        if (type === EType.DONUT) {
          percentRadius += settings.data.volumed
            ? sliceWidth / 4 + hoveredValue
            : hoveredValue / 2;
        }

        if (type === EType.PIE) {
          percentRadius += settings.data.volumed
            ? sliceWidth / 3 + hoveredValue
            : hoveredValue / 2;
        }

        const text = parseFloat(item.percent.toFixed(2)) + '%';
        const point = getPointOnArc(
          x,
          y,
          percentRadius,
          (item.startPi + item.endPi) / 2,
        );

        canvas.context.fillText(text, point.x, point.y);
      });
    }

    if (settings.texts.center.enabled) {
      canvas.context.font =
        '800 ' +
        settings.texts.center.styles.fontSize * state.loading +
        'px arial';
      canvas.context.textAlign = 'center';
      canvas.context.textBaseline = 'middle';
      canvas.context.fillStyle = settings.texts.center.styles.color;
      canvas.context.fillText(settings.texts.center.value, x, y);
    }
  }

  render = (props: { by: ERenderBy }) => {
    const time = 300;

    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }

    this.renderTimeout = window.setTimeout(() => {
      super.baseRender(props);
      this.slices();
      this.tooltip();
    }, time / 60);
  };
}
