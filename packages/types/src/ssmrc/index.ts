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
    category: __ssmrcSchema.pick({ category: true }).shape.category,
    monitors: __ssmrcSchema.pick({ monitors: true }).shape.monitors,
    checks: __ssmrcSchema.pick({ checks: true }).shape.checks,
    cache: __ssmrcSchema.pick({ cache: true }).shape.cache,
    shortUrls: __ssmrcSchema.pick({ shortUrls: true }).shape.shortUrls,
  },
};
export namespace _ssmrcType {
  export type i = __ssmrcType;
  export namespace e {
    export type category = z.infer<typeof _categorySchema.i>;
    export type monitor = z.infer<typeof _monitorsSchema.i>;
    export type checks = z.infer<typeof _checksSchema.i>;
    export type cache = z.infer<typeof _cacheSchema.i>;
    export type shortUrl = z.infer<typeof _shortUrlSchema.i>;
  }
}
