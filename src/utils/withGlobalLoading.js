import store from "../store/store";
import { setLoading } from "../store/common-slice";

let _counter = 0;

export async function withGlobalLoading(fnOrPromise, message = null) {
  _counter++;
  store.dispatch(setLoading({ value: true, message }));
  try {
    const res =
      typeof fnOrPromise === "function" ? await fnOrPromise() : await fnOrPromise;
    return res;
  } finally {
    _counter = Math.max(0, _counter - 1);
    if (_counter === 0) {
      store.dispatch(setLoading({ value: false, message: null }));
    }
  }
}
