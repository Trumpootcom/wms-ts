declare const __APP_VERSION__: string;
declare const __APP_REVISION__: string;
declare const __APP_BUILD_DATE__: string;

const buildDate = new Date(__APP_BUILD_DATE__);

export const buildInfo = {
  version: __APP_VERSION__,
  revision: __APP_REVISION__,
  builtAt:
    Number.isNaN(buildDate.getTime())
      ? __APP_BUILD_DATE__
      : buildDate.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }),
};
