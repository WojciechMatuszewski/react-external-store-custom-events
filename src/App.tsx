import { useEffect, useSyncExternalStore } from "react";

/**
 * A bit unfortunate that we have to write this.
 * The `EventTarget` class is not generic.
 */
interface CustomEventTarget<E extends CustomEvent = CustomEvent>
  extends EventTarget {
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void;
  addEventListener(
    type: string,
    callback: (event: E) => void,
    options?: EventListenerOptions
  ): void;

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void;
  removeEventListener(
    type: string,
    callback: (event: E) => void,
    options?: EventListenerOptions
  ): void;
}

const customEventTarget = EventTarget as {
  new (): CustomEventTarget;
  prototype: CustomEventTarget;
};

class State extends customEventTarget {
  #count = 0;

  constructor() {
    super();
  }

  public add = (num: number) => {
    this.#count += num;

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          count: this.#count
        }
      })
    );
  };

  public getSnapshot = (selector: (num: number) => number = (n) => n) => {
    return selector(this.#count);
  };

  /**
   * Arrow functions so that the `this` is not overwritten when passing the function in a point-free style, like so
   * useSyncExternalStore(state.subscribe, ...)
   */
  public subscribe = (listener: (event: CustomEvent) => void) => {
    this.addEventListener("change", listener);

    return () => {
      this.removeEventListener("change", listener);
    };
  };
}

const state = new State();

function App() {
  return (
    <div>
      <CounterWithSelector />
      <hr />
      <CounterWithoutSelector />
    </div>
  );
}

/**
 * This component will update upon each click.
 */
function CounterWithoutSelector() {
  const count = useSyncExternalStore(state.subscribe, state.getSnapshot);

  useEffect(() => {
    const listener = (event: CustomEvent) => {
      console.log(event.detail.count);
    };

    state.addEventListener("change", listener);

    return () => {
      state.removeEventListener("change", listener);
    };
  }, []);

  return (
    <div>
      <h1>Without selector</h1>
      <button
        onClick={() => {
          state.add(2);
        }}
      >
        Click me {count}
      </button>
    </div>
  );
}

/**
 * This component will only update when the value is a multiplication of 10.
 */
function CounterWithSelector() {
  const count = useSyncExternalStore(state.subscribe, () =>
    state.getSnapshot((num) => {
      return Math.floor(num / 10) * 10;
    })
  );

  return (
    <div>
      <h1>With selector</h1>
      <button
        onClick={() => {
          state.add(2);
        }}
      >
        Click me {count}
      </button>
    </div>
  );
}

export default App;
