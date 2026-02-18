import z from "zod";
import { _cacheSchema } from "./cache";
import { _categorySchema } from "./category";
import { _checksSchema } from "./checks";
import { _monitorsSchema } from "./monitor";
import { _shortUrlSchema } from "./short-url";

const __ssmrcSchema = z.object({
  category: z.array(_categorySchema.i),
  monitors: z.array(_monitorsSchema.i),
  checks: _checksSchema.i,
  cache: _cacheSchema.i,
  shortUrls: z.array(_shortUrlSchema.i),
});
type __ssmrcType = z.infer<typeof __ssmrcSchema>;

export const _ssmrcSchema = {
  i: __ssmrcSchema,
  e: {
    category: {
      i: __ssmrcSchema.pick({ category: true }).shape.category,
      e: _categorySchema,
    },
    monitors: {
      i: __ssmrcSchema.pick({ monitors: true }).shape.monitors,
      e: _monitorsSchema,
    },
    checks: {
      i: __ssmrcSchema.pick({ checks: true }).shape.checks,
      e: _checksSchema,
    },
    cache: {
      i: __ssmrcSchema.pick({ cache: true }).shape.cache,
      e: _cacheSchema,
    },
    shortUrls: { i: __ssmrcSchema.pick({ shortUrls: true }).shape.shortUrls, e: _shortUrlSchema },
  },
};
export namespace _ssmrcType {
  export type i = __ssmrcType;
  export namespace e {
    export type category = z.infer<typeof _ssmrcSchema.e.category.i>;
    export type monitor = z.infer<typeof _ssmrcSchema.e.monitors.i>;
    export type checks = z.infer<typeof _ssmrcSchema.e.checks.i>;
    export type cache = z.infer<typeof _ssmrcSchema.e.cache.i>;
    export type shortUrl = z.infer<typeof _ssmrcSchema.e.shortUrls.i>;
  }
}
