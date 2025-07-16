function waitForElement(selector, maxAttempts = 20, interval = 25) {
  return new Promise(resolve => {
    let attempts = 0;

    const checkForElement = setInterval(() => {
      const element = document.querySelector(selector);

      if (element || attempts >= maxAttempts) {
        clearInterval(checkForElement);
        resolve();
      }

      attempts++;
    }, interval);
  });
}

export default {
  'ohif.tours': [
    {
      id: 'basicViewerTour',
      route: '/viewer',
      steps: [
        {
          id: 'scroll',
          title: '浏览图像',
          text: '您可以使用鼠标滚轮或滚动条来浏览图像。',
          attachTo: {
            element: '.viewport-element',
            on: 'top',
          },
          advanceOn: {
            selector: '.cornerstone-viewport-element',
            event: 'CORNERSTONE_TOOLS_MOUSE_WHEEL',
          },
          beforeShowPromise: () => waitForElement('.viewport-element'),
        },
        {
          id: 'zoom',
          title: '缩放图像',
          text: '您可以使用右键点击来缩放图像。',
          attachTo: {
            element: '.viewport-element',
            on: 'left',
          },
          advanceOn: {
            selector: '.cornerstone-viewport-element',
            event: 'CORNERSTONE_TOOLS_MOUSE_UP',
          },
          beforeShowPromise: () => waitForElement('.viewport-element'),
        },
        {
          id: 'pan',
          title: '平移图像',
          text: '您可以使用中键点击来平移图像。',
          attachTo: {
            element: '.viewport-element',
            on: 'top',
          },
          advanceOn: {
            selector: '.cornerstone-viewport-element',
            event: 'CORNERSTONE_TOOLS_MOUSE_UP',
          },
          beforeShowPromise: () => waitForElement('.viewport-element'),
        },
        {
          id: 'windowing',
          title: '调整窗位',
          text: '您可以使用左键点击来调整窗位。',
          attachTo: {
            element: '.viewport-element',
            on: 'left',
          },
          advanceOn: {
            selector: '.cornerstone-viewport-element',
            event: 'CORNERSTONE_TOOLS_MOUSE_UP',
          },
          beforeShowPromise: () => waitForElement('.viewport-element'),
        },
        {
          id: 'length',
          title: '使用测量工具',
          text: '您可以使用“长度”工具来测量一个区域的长度。',
          attachTo: {
            element: '[data-cy="MeasurementTools-split-button-primary"]',
            on: 'bottom',
          },
          advanceOn: {
            selector: '[data-cy="MeasurementTools-split-button-primary"]',
            event: 'click',
          },
          beforeShowPromise: () =>
            waitForElement('[data-cy="MeasurementTools-split-button-primary"]'),
        },
        {
          id: 'drawAnnotation',
          title: '绘制长度标注',
          text: '在视图中使用长度工具来测量区域的长度。',
          attachTo: {
            element: '.viewport-element',
            on: 'right',
          },
          advanceOn: {
            selector: 'body',
            event: 'event::measurement_added',
          },
          beforeShowPromise: () => waitForElement('.viewport-element'),
        },
        {
          id: 'trackMeasurement',
          title: '在面板中跟踪测量',
          text: '点击“是”以在测量面板中跟踪测量。',
          attachTo: {
            element: '[data-cy="prompt-begin-tracking-yes-btn"]',
            on: 'bottom',
          },
          advanceOn: {
            selector: '[data-cy="prompt-begin-tracking-yes-btn"]',
            event: 'click',
          },
          beforeShowPromise: () => waitForElement('[data-cy="prompt-begin-tracking-yes-btn"]'),
        },
        {
          id: 'openMeasurementPanel',
          title: '打开测量面板',
          text: '点击测量按钮以打开测量面板。',
          attachTo: {
            element: '#trackedMeasurements-btn',
            on: 'left-start',
          },
          advanceOn: {
            selector: '#trackedMeasurements-btn',
            event: 'click',
          },
          beforeShowPromise: () => waitForElement('#trackedMeasurements-btn'),
        },
        {
          id: 'scrollAwayFromMeasurement',
          title: '滚动离开测量',
          text: '使用鼠标滚轮滚动图像，远离测量区域。',
          attachTo: {
            element: '.viewport-element',
            on: 'left',
          },
          advanceOn: {
            selector: '.cornerstone-viewport-element',
            event: 'CORNERSTONE_TOOLS_MOUSE_WHEEL',
          },
          beforeShowPromise: () => waitForElement('.viewport-element'),
        },
        {
          id: 'jumpToMeasurement',
          title: '跳转到测量区域',
          text: '点击测量面板中的测量数据跳转到该区域。',
          attachTo: {
            element: '[data-cy="data-row"]',
            on: 'left-start',
          },
          advanceOn: {
            selector: '[data-cy="data-row"]',
            event: 'click',
          },
          beforeShowPromise: () => waitForElement('[data-cy="data-row"]'),
        },
        {
          id: 'changeLayout',
          title: '更改布局',
          text: '您可以使用布局按钮更改查看器的布局。',
          attachTo: {
            element: '[data-cy="Layout"]',
            on: 'bottom',
          },
          advanceOn: {
            selector: '[data-cy="Layout"]',
            event: 'click',
          },
          beforeShowPromise: () => waitForElement('[data-cy="Layout"]'),
        },
        {
          id: 'selectLayout',
          title: '选择MPR布局',
          text: '选择MPR布局以在MPR模式下查看图像。',
          attachTo: {
            element: '[data-cy="MPR"]',
            on: 'left-start',
          },
          advanceOn: {
            selector: '[data-cy="MPR"]',
            event: 'click',
          },
          beforeShowPromise: () => waitForElement('[data-cy="MPR"]'),
        },
      ],
      tourOptions: {
        useModalOverlay: true,
        defaultStepOptions: {
          buttons: [
            {
              text: 'Skip all',
              action() {
                this.complete();
              },
              secondary: true,
            },
          ],
        },
      },
    },
  ],
};
