import {
  generateRandomColor,
  intersectionPolygon,
  colorChangeTone,
  hexAverage,
  deepMerge,
} from '../../common';
import settings from './settings';
import Chart from '../';
import { ERenderBy, EType, TProps } from '../types';

type TData = Array<{
  value: number;
  label: string;
  color?: string;
}>;

type TPreparedData = Array<{
  value: number;
  label: string;
  color: string;
  state?: number;
  hovered?: boolean;
}>;

export default class Funnel extends Chart {
  constructor(props: TProps) {
    super({
      ...props,
      type: EType.FUNNEL,
      settings: deepMerge(structuredClone(settings), props.settings || {}),
    });
  }

  prepareData(data: TData = []): TPreparedData {
    return data.map((item) => ({
      ...item,
      color: item.color || generateRandomColor(),
    }));
  }

  getData = () => this.data as TPreparedData;

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
          ],
        },
      ],
    });
  };

  getRect() {
    const data = this.getData();
    const settings = this.getSettings();
    const canvas = this.canvas;

    let result = {
      xStart: settings.offset.left,
      xEnd: canvas.element.clientWidth - settings.offset.right,
      yStart: settings.offset.top,
      yEnd: canvas.element.clientHeight - settings.offset.bottom,
      width: 0,
      height: 0,
      center: 0,
      partHeight: 0,
    };

    result.width = result.xEnd - result.xStart;
    result.height = result.yEnd - result.yStart;
    result.center = result.xStart + result.width / 2;
    result.partHeight = result.height / data.length;

    return result;
  }

  funnel() {
    const canvas = this.canvas;
    const settings = this.getSettings();
    const data = this.getData();
    const cursor = this.cursor;
    const state = this.state;
    const max = Math.max(...data.map((item) => item.value));
    const rect = this.getRect();

    let bezierLeft = [];
    let bezierRight = [];

    for (let i = 0; i <= data.length - 1; i++) {
      let item = data[i],
        nextItem = data[i + 1],
        prevItem = data[i - 1],
        yStart = rect.yStart + rect.partHeight * i,
        yEnd = yStart + rect.partHeight,
        width = (item.value / max) * rect.width,
        nextWidth = nextItem ? (nextItem.value / max) * rect.width : width;
      width *= state.loading;
      nextWidth *= state.loading;
      canvas.context.beginPath();
      canvas.context.strokeStyle = 'transparent';

      let color: string | CanvasGradient = colorChangeTone(
        item.color,
        settings.hover.enable && item.state
          ? settings.hover.value * item.state
          : 1,
      );

      if (settings.area?.gradient) {
        let nextColor = nextItem
            ? colorChangeTone(
                nextItem.color,
                settings.hover.enable && nextItem.state
                  ? settings.hover.value * nextItem.state
                  : 1,
              )
            : color,
          prevColor = prevItem
            ? colorChangeTone(
                prevItem.color,
                settings.hover.enable && prevItem.state
                  ? settings.hover.value * prevItem.state
                  : 1,
              )
            : color,
          gradient = canvas.context.createLinearGradient(0, yStart, 0, yEnd);

        gradient.addColorStop(0, hexAverage([prevColor, color]));
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, hexAverage([color, nextColor]));
        color = gradient;
      }

      canvas.context.fillStyle = canvas.context.strokeStyle = color;

      let polygon = [
        {
          x: rect.center - width / 2,
          y: yStart,
        },
        {
          x: rect.center - nextWidth / 2,
          y: yEnd,
        },
        {
          x: rect.center + nextWidth / 2,
          y: yEnd,
        },
        {
          x: rect.center + width / 2,
          y: yStart,
        },
      ];

      if (!i) {
        bezierLeft.push([polygon[0].x, polygon[0].y]);
        bezierRight.push([polygon[3].x, polygon[3].y]);
      }

      bezierLeft.push([polygon[1].x, polygon[1].y]);
      bezierRight.push([polygon[2].x, polygon[2].y]);

      for (let p = 0; p <= polygon.length - 1; p++) {
        if (p === 0) {
          canvas.context.moveTo(polygon[p].x, polygon[p].y);
        } else {
          canvas.context.lineTo(polygon[p].x, polygon[p].y);
        }
      }

      canvas.context.fill();
      canvas.context.closePath();
      canvas.context.stroke();

      item.hovered = intersectionPolygon({
        polygon,
        x: cursor.x,
        y: cursor.y,
      });

      super.hover({
        item: item,
        isHovered: item.hovered,
      });

      canvas.context.save();

      let x = rect.center,
        y = yEnd - (yEnd - yStart) / 2;
      canvas.context.globalAlpha = 1 * state.loading;
      if (settings.label?.enable) {
        canvas.context.font =
          '100 ' + settings.label.styles.fontSize * state.loading + 'px arial';
        canvas.context.fillStyle = settings.label.styles.color;
        canvas.context.textAlign = 'center';
        canvas.context.textBaseline = 'middle';
        canvas.context.fillText(
          item.label,
          x,
          yStart + settings.label.styles.fontSize + 5,
        );
      }
      if (settings.value?.enable) {
        canvas.context.font =
          '100 ' + settings.value.styles.fontSize * state.loading + 'px arial';
        canvas.context.fillStyle = settings.value.styles.color;
        canvas.context.textAlign = 'center';
        canvas.context.textBaseline = 'middle';
        canvas.context.fillText(item.value.toString(), x, y);
      }
      canvas.context.restore();
    }
    bezierRight.reverse();
  }

  render = (props: { by: ERenderBy }) => {
    const time = 300;

    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }

    this.renderTimeout = window.setTimeout(() => {
      super.baseRender(props);
      this.funnel();
      this.tooltip();
    }, time / 60);
  };
}
