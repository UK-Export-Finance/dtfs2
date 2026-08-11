/**
 * @jest-environment jsdom
 */
import { restoreFocusOnFilterToggle } from './restore-focus-on-filter-toggle';

type SetupOptions = {
  includeToggle?: boolean;
  includePanel?: boolean;
  panelId?: string;
  panelTabindex?: string;
  ariaHaspopup?: string;
};

const TOGGLE_CONTAINER_SELECTOR = '.moj-action-bar__filter';
const FILTER_PANEL_SELECTOR = '.moj-filter';
const FILTER_PANEL_ID = 'test-filter-panel';

const setupDom = ({ includeToggle = true, includePanel = true, panelId, panelTabindex, ariaHaspopup }: SetupOptions = {}) => {
  document.body.innerHTML = '';

  if (includePanel) {
    const panel = document.createElement('div');
    panel.className = 'moj-filter';

    if (panelId) {
      panel.id = panelId;
    }

    if (panelTabindex) {
      panel.setAttribute('tabindex', panelTabindex);
    }

    document.body.appendChild(panel);
  }

  if (includeToggle) {
    const container = document.createElement('div');
    container.className = 'moj-action-bar__filter';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Show filter';

    if (ariaHaspopup) {
      button.setAttribute('aria-haspopup', ariaHaspopup);
    }

    container.appendChild(button);
    document.body.appendChild(container);
  }
};

const invoke = () =>
  restoreFocusOnFilterToggle({
    toggleContainerSelector: TOGGLE_CONTAINER_SELECTOR,
    filterPanelSelector: FILTER_PANEL_SELECTOR,
    filterPanelId: FILTER_PANEL_ID,
  });

const getToggleButton = (): HTMLButtonElement => document.querySelector<HTMLButtonElement>(`${TOGGLE_CONTAINER_SELECTOR} button`)!;
const getPanel = (): HTMLElement => document.querySelector<HTMLElement>(FILTER_PANEL_SELECTOR)!;
const getFocusPing = (): HTMLElement | null => document.body.querySelector<HTMLElement>('div[tabindex="-1"]');
const getFocusPings = (): NodeListOf<HTMLElement> => document.body.querySelectorAll<HTMLElement>('div[tabindex="-1"]');

describe('restoreFocusOnFilterToggle', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('when the toggle container is missing', () => {
    it('should not throw', () => {
      setupDom({ includeToggle: false });

      expect(invoke).not.toThrow();
    });

    it('should not append a focus ping element', () => {
      setupDom({ includeToggle: false });

      invoke();

      expect(getFocusPing()).toBeNull();
    });
  });

  describe('when the filter panel is missing', () => {
    it('should not throw', () => {
      setupDom({ includePanel: false });

      expect(invoke).not.toThrow();
    });

    it('should not mutate the toggle button', () => {
      setupDom({ includePanel: false, ariaHaspopup: 'true' });

      invoke();

      const button = getToggleButton();

      expect(button.hasAttribute('aria-controls')).toEqual(false);
      expect(button.getAttribute('aria-haspopup')).toEqual('true');
    });

    it('should not append a focus ping element', () => {
      setupDom({ includePanel: false });

      invoke();

      expect(getFocusPing()).toBeNull();
    });
  });

  describe('when both the toggle and panel are present', () => {
    describe('panel id handling', () => {
      it('should assign the fallback id to the panel when it has none', () => {
        setupDom();

        invoke();

        expect(getPanel().id).toEqual(FILTER_PANEL_ID);
      });

      it('should preserve an existing panel id', () => {
        setupDom({ panelId: 'pre-existing-id' });

        invoke();

        expect(getPanel().id).toEqual('pre-existing-id');
      });
    });

    describe('panel DOM mutations', () => {
      it('should remove `tabindex` from the panel', () => {
        setupDom({ panelTabindex: '-1' });

        invoke();

        expect(getPanel().hasAttribute('tabindex')).toEqual(false);
      });
    });

    describe('toggle button DOM mutations', () => {
      it('should set `aria-controls` on the toggle button pointing at the panel id', () => {
        setupDom({ panelId: 'my-panel' });

        invoke();

        expect(getToggleButton().getAttribute('aria-controls')).toEqual('my-panel');
      });

      it('should set `aria-controls` using the fallback id when the panel had no id', () => {
        setupDom();

        invoke();

        expect(getToggleButton().getAttribute('aria-controls')).toEqual(FILTER_PANEL_ID);
      });

      it('should remove `aria-haspopup` from the toggle button', () => {
        setupDom({ ariaHaspopup: 'true' });

        invoke();

        expect(getToggleButton().hasAttribute('aria-haspopup')).toEqual(false);
      });
    });

    describe('focus ping element', () => {
      it('should append an offscreen focus ping to the body', () => {
        setupDom();

        invoke();

        const ping = getFocusPing();

        expect(ping).not.toBeNull();
        expect(ping!.getAttribute('tabindex')).toEqual('-1');
        expect(ping!.style.position).toEqual('fixed');
      });
    });

    describe('repeated invocations on the same toggle container', () => {
      it('should mark the toggle container as initialised', () => {
        setupDom();

        invoke();

        const container = document.querySelector<HTMLElement>(TOGGLE_CONTAINER_SELECTOR)!;

        expect(container.dataset.dtfsRestoreFocusOnFilterToggleInitialised).toEqual('true');
      });

      it('should not append a second focus ping element', () => {
        setupDom();

        invoke();
        invoke();

        expect(getFocusPings()).toHaveLength(1);
      });

      it('should not attach a second click listener', () => {
        jest.useFakeTimers();
        setupDom();

        invoke();
        invoke();

        const button = getToggleButton();
        const focusPing = getFocusPing()!;
        const buttonFocusSpy = jest.spyOn(button, 'focus');
        const pingFocusSpy = jest.spyOn(focusPing, 'focus');

        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        jest.runAllTimers();

        expect(pingFocusSpy).toHaveBeenCalledTimes(1);
        expect(buttonFocusSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('async focus restoration on click', () => {
    // `requestAnimationFrame` is mocked onto a `setTimeout` so the fake-timer
    // advances below are deterministic and do not depend on how the test
    // environment (or Jest's fake timer implementation) schedules real
    // animation frames, which can vary across environments.
    const ANIMATION_FRAME_MS = 16;

    let button: HTMLButtonElement;
    let container: HTMLElement;
    let focusPing: HTMLElement;
    let buttonFocusSpy: jest.SpyInstance;
    let pingFocusSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), ANIMATION_FRAME_MS) as unknown as number);

      setupDom();
      invoke();

      button = getToggleButton();
      container = document.querySelector<HTMLElement>(TOGGLE_CONTAINER_SELECTOR)!;
      focusPing = getFocusPing()!;
      buttonFocusSpy = jest.spyOn(button, 'focus');
      pingFocusSpy = jest.spyOn(focusPing, 'focus');
    });

    it('should ignore clicks that do not resolve to the toggle button', () => {
      container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      jest.runAllTimers();

      expect(pingFocusSpy).not.toHaveBeenCalled();
      expect(buttonFocusSpy).not.toHaveBeenCalled();
    });

    it('should not focus the ping or the button synchronously on click', () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(pingFocusSpy).not.toHaveBeenCalled();
      expect(buttonFocusSpy).not.toHaveBeenCalled();
    });

    it('should focus the ping first with `preventScroll`, then the toggle button after the setTimeout', () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      jest.runAllTimers();

      expect(pingFocusSpy).toHaveBeenNthCalledWith(1, { preventScroll: true });
      expect(buttonFocusSpy).toHaveBeenNthCalledWith(1, { preventScroll: true });
    });

    it('should schedule the toggle re-focus behind a 50ms setTimeout after the ping', () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Advance past both mocked requestAnimationFrame callbacks so the ping
      // fires but the setTimeout(50) that re-focuses the button has not yet
      // elapsed.
      jest.advanceTimersByTime(ANIMATION_FRAME_MS * 2);

      expect(pingFocusSpy).toHaveBeenCalledTimes(1);
      expect(buttonFocusSpy).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      expect(buttonFocusSpy).toHaveBeenNthCalledWith(1, { preventScroll: true });
    });
  });
});
