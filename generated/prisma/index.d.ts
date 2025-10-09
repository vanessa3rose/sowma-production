
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model SocialMedia
 * 
 */
export type SocialMedia = $Result.DefaultSelection<Prisma.$SocialMediaPayload>
/**
 * Model SocialMediaMetrics
 * 
 */
export type SocialMediaMetrics = $Result.DefaultSelection<Prisma.$SocialMediaMetricsPayload>
/**
 * Model DatabaseReport
 * 
 */
export type DatabaseReport = $Result.DefaultSelection<Prisma.$DatabaseReportPayload>
/**
 * Model DatabaseReportCount
 * 
 */
export type DatabaseReportCount = $Result.DefaultSelection<Prisma.$DatabaseReportCountPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Provider: {
  FACEBOOK: 'FACEBOOK',
  INSTAGRAM: 'INSTAGRAM',
  TIKTOK: 'TIKTOK',
  LINKEDIN: 'LINKEDIN',
  TWITTER: 'TWITTER'
};

export type Provider = (typeof Provider)[keyof typeof Provider]


export const Metric: {
  FOLLOWERS: 'FOLLOWERS',
  LIKES: 'LIKES',
  SHARES: 'SHARES',
  COMMENTS: 'COMMENTS',
  VIEWS: 'VIEWS'
};

export type Metric = (typeof Metric)[keyof typeof Metric]


export const Count: {
  ATTENDED_EVENT: 'ATTENDED_EVENT',
  COMMUNITY_VOLUNTEER: 'COMMUNITY_VOLUNTEER',
  CORPORATE_VOLUNTEER: 'CORPORATE_VOLUNTEER',
  GOOGLE_SEARCH: 'GOOGLE_SEARCH',
  HEARD_SOWMA_SPEAKER: 'HEARD_SOWMA_SPEAKER',
  NEWS_MEDIA: 'NEWS_MEDIA',
  OTHER: 'OTHER',
  REFERRAL: 'REFERRAL',
  SCHOOL_VOLUNTEER: 'SCHOOL_VOLUNTEER',
  SOCIAL_MEDIA: 'SOCIAL_MEDIA',
  WEBSITE: 'WEBSITE'
};

export type Count = (typeof Count)[keyof typeof Count]

}

export type Provider = $Enums.Provider

export const Provider: typeof $Enums.Provider

export type Metric = $Enums.Metric

export const Metric: typeof $Enums.Metric

export type Count = $Enums.Count

export const Count: typeof $Enums.Count

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more SocialMedias
 * const socialMedias = await prisma.socialMedia.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more SocialMedias
   * const socialMedias = await prisma.socialMedia.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.socialMedia`: Exposes CRUD operations for the **SocialMedia** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SocialMedias
    * const socialMedias = await prisma.socialMedia.findMany()
    * ```
    */
  get socialMedia(): Prisma.SocialMediaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.socialMediaMetrics`: Exposes CRUD operations for the **SocialMediaMetrics** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SocialMediaMetrics
    * const socialMediaMetrics = await prisma.socialMediaMetrics.findMany()
    * ```
    */
  get socialMediaMetrics(): Prisma.SocialMediaMetricsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.databaseReport`: Exposes CRUD operations for the **DatabaseReport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DatabaseReports
    * const databaseReports = await prisma.databaseReport.findMany()
    * ```
    */
  get databaseReport(): Prisma.DatabaseReportDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.databaseReportCount`: Exposes CRUD operations for the **DatabaseReportCount** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DatabaseReportCounts
    * const databaseReportCounts = await prisma.databaseReportCount.findMany()
    * ```
    */
  get databaseReportCount(): Prisma.DatabaseReportCountDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.0
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    SocialMedia: 'SocialMedia',
    SocialMediaMetrics: 'SocialMediaMetrics',
    DatabaseReport: 'DatabaseReport',
    DatabaseReportCount: 'DatabaseReportCount'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "socialMedia" | "socialMediaMetrics" | "databaseReport" | "databaseReportCount"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      SocialMedia: {
        payload: Prisma.$SocialMediaPayload<ExtArgs>
        fields: Prisma.SocialMediaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SocialMediaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SocialMediaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>
          }
          findFirst: {
            args: Prisma.SocialMediaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SocialMediaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>
          }
          findMany: {
            args: Prisma.SocialMediaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>[]
          }
          create: {
            args: Prisma.SocialMediaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>
          }
          createMany: {
            args: Prisma.SocialMediaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SocialMediaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>[]
          }
          delete: {
            args: Prisma.SocialMediaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>
          }
          update: {
            args: Prisma.SocialMediaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>
          }
          deleteMany: {
            args: Prisma.SocialMediaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SocialMediaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SocialMediaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>[]
          }
          upsert: {
            args: Prisma.SocialMediaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaPayload>
          }
          aggregate: {
            args: Prisma.SocialMediaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSocialMedia>
          }
          groupBy: {
            args: Prisma.SocialMediaGroupByArgs<ExtArgs>
            result: $Utils.Optional<SocialMediaGroupByOutputType>[]
          }
          count: {
            args: Prisma.SocialMediaCountArgs<ExtArgs>
            result: $Utils.Optional<SocialMediaCountAggregateOutputType> | number
          }
        }
      }
      SocialMediaMetrics: {
        payload: Prisma.$SocialMediaMetricsPayload<ExtArgs>
        fields: Prisma.SocialMediaMetricsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SocialMediaMetricsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SocialMediaMetricsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>
          }
          findFirst: {
            args: Prisma.SocialMediaMetricsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SocialMediaMetricsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>
          }
          findMany: {
            args: Prisma.SocialMediaMetricsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>[]
          }
          create: {
            args: Prisma.SocialMediaMetricsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>
          }
          createMany: {
            args: Prisma.SocialMediaMetricsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SocialMediaMetricsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>[]
          }
          delete: {
            args: Prisma.SocialMediaMetricsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>
          }
          update: {
            args: Prisma.SocialMediaMetricsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>
          }
          deleteMany: {
            args: Prisma.SocialMediaMetricsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SocialMediaMetricsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SocialMediaMetricsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>[]
          }
          upsert: {
            args: Prisma.SocialMediaMetricsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SocialMediaMetricsPayload>
          }
          aggregate: {
            args: Prisma.SocialMediaMetricsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSocialMediaMetrics>
          }
          groupBy: {
            args: Prisma.SocialMediaMetricsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SocialMediaMetricsGroupByOutputType>[]
          }
          count: {
            args: Prisma.SocialMediaMetricsCountArgs<ExtArgs>
            result: $Utils.Optional<SocialMediaMetricsCountAggregateOutputType> | number
          }
        }
      }
      DatabaseReport: {
        payload: Prisma.$DatabaseReportPayload<ExtArgs>
        fields: Prisma.DatabaseReportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DatabaseReportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DatabaseReportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>
          }
          findFirst: {
            args: Prisma.DatabaseReportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DatabaseReportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>
          }
          findMany: {
            args: Prisma.DatabaseReportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>[]
          }
          create: {
            args: Prisma.DatabaseReportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>
          }
          createMany: {
            args: Prisma.DatabaseReportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DatabaseReportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>[]
          }
          delete: {
            args: Prisma.DatabaseReportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>
          }
          update: {
            args: Prisma.DatabaseReportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>
          }
          deleteMany: {
            args: Prisma.DatabaseReportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DatabaseReportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DatabaseReportUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>[]
          }
          upsert: {
            args: Prisma.DatabaseReportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportPayload>
          }
          aggregate: {
            args: Prisma.DatabaseReportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDatabaseReport>
          }
          groupBy: {
            args: Prisma.DatabaseReportGroupByArgs<ExtArgs>
            result: $Utils.Optional<DatabaseReportGroupByOutputType>[]
          }
          count: {
            args: Prisma.DatabaseReportCountArgs<ExtArgs>
            result: $Utils.Optional<DatabaseReportCountAggregateOutputType> | number
          }
        }
      }
      DatabaseReportCount: {
        payload: Prisma.$DatabaseReportCountPayload<ExtArgs>
        fields: Prisma.DatabaseReportCountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DatabaseReportCountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DatabaseReportCountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>
          }
          findFirst: {
            args: Prisma.DatabaseReportCountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DatabaseReportCountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>
          }
          findMany: {
            args: Prisma.DatabaseReportCountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>[]
          }
          create: {
            args: Prisma.DatabaseReportCountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>
          }
          createMany: {
            args: Prisma.DatabaseReportCountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DatabaseReportCountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>[]
          }
          delete: {
            args: Prisma.DatabaseReportCountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>
          }
          update: {
            args: Prisma.DatabaseReportCountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>
          }
          deleteMany: {
            args: Prisma.DatabaseReportCountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DatabaseReportCountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DatabaseReportCountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>[]
          }
          upsert: {
            args: Prisma.DatabaseReportCountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatabaseReportCountPayload>
          }
          aggregate: {
            args: Prisma.DatabaseReportCountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDatabaseReportCount>
          }
          groupBy: {
            args: Prisma.DatabaseReportCountGroupByArgs<ExtArgs>
            result: $Utils.Optional<DatabaseReportCountGroupByOutputType>[]
          }
          count: {
            args: Prisma.DatabaseReportCountCountArgs<ExtArgs>
            result: $Utils.Optional<DatabaseReportCountCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    socialMedia?: SocialMediaOmit
    socialMediaMetrics?: SocialMediaMetricsOmit
    databaseReport?: DatabaseReportOmit
    databaseReportCount?: DatabaseReportCountOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type SocialMediaCountOutputType
   */

  export type SocialMediaCountOutputType = {
    metrics: number
  }

  export type SocialMediaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metrics?: boolean | SocialMediaCountOutputTypeCountMetricsArgs
  }

  // Custom InputTypes
  /**
   * SocialMediaCountOutputType without action
   */
  export type SocialMediaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaCountOutputType
     */
    select?: SocialMediaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SocialMediaCountOutputType without action
   */
  export type SocialMediaCountOutputTypeCountMetricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SocialMediaMetricsWhereInput
  }


  /**
   * Count Type DatabaseReportCountOutputType
   */

  export type DatabaseReportCountOutputType = {
    counts: number
  }

  export type DatabaseReportCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    counts?: boolean | DatabaseReportCountOutputTypeCountCountsArgs
  }

  // Custom InputTypes
  /**
   * DatabaseReportCountOutputType without action
   */
  export type DatabaseReportCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCountOutputType
     */
    select?: DatabaseReportCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DatabaseReportCountOutputType without action
   */
  export type DatabaseReportCountOutputTypeCountCountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DatabaseReportCountWhereInput
  }


  /**
   * Models
   */

  /**
   * Model SocialMedia
   */

  export type AggregateSocialMedia = {
    _count: SocialMediaCountAggregateOutputType | null
    _min: SocialMediaMinAggregateOutputType | null
    _max: SocialMediaMaxAggregateOutputType | null
  }

  export type SocialMediaMinAggregateOutputType = {
    id: string | null
    provider: $Enums.Provider | null
    userId: string | null
    username: string | null
    displayName: string | null
    profileUrl: string | null
    email: string | null
  }

  export type SocialMediaMaxAggregateOutputType = {
    id: string | null
    provider: $Enums.Provider | null
    userId: string | null
    username: string | null
    displayName: string | null
    profileUrl: string | null
    email: string | null
  }

  export type SocialMediaCountAggregateOutputType = {
    id: number
    provider: number
    userId: number
    username: number
    displayName: number
    profileUrl: number
    email: number
    _all: number
  }


  export type SocialMediaMinAggregateInputType = {
    id?: true
    provider?: true
    userId?: true
    username?: true
    displayName?: true
    profileUrl?: true
    email?: true
  }

  export type SocialMediaMaxAggregateInputType = {
    id?: true
    provider?: true
    userId?: true
    username?: true
    displayName?: true
    profileUrl?: true
    email?: true
  }

  export type SocialMediaCountAggregateInputType = {
    id?: true
    provider?: true
    userId?: true
    username?: true
    displayName?: true
    profileUrl?: true
    email?: true
    _all?: true
  }

  export type SocialMediaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SocialMedia to aggregate.
     */
    where?: SocialMediaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SocialMedias to fetch.
     */
    orderBy?: SocialMediaOrderByWithRelationInput | SocialMediaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SocialMediaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SocialMedias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SocialMedias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SocialMedias
    **/
    _count?: true | SocialMediaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SocialMediaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SocialMediaMaxAggregateInputType
  }

  export type GetSocialMediaAggregateType<T extends SocialMediaAggregateArgs> = {
        [P in keyof T & keyof AggregateSocialMedia]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSocialMedia[P]>
      : GetScalarType<T[P], AggregateSocialMedia[P]>
  }




  export type SocialMediaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SocialMediaWhereInput
    orderBy?: SocialMediaOrderByWithAggregationInput | SocialMediaOrderByWithAggregationInput[]
    by: SocialMediaScalarFieldEnum[] | SocialMediaScalarFieldEnum
    having?: SocialMediaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SocialMediaCountAggregateInputType | true
    _min?: SocialMediaMinAggregateInputType
    _max?: SocialMediaMaxAggregateInputType
  }

  export type SocialMediaGroupByOutputType = {
    id: string
    provider: $Enums.Provider
    userId: string
    username: string
    displayName: string | null
    profileUrl: string | null
    email: string | null
    _count: SocialMediaCountAggregateOutputType | null
    _min: SocialMediaMinAggregateOutputType | null
    _max: SocialMediaMaxAggregateOutputType | null
  }

  type GetSocialMediaGroupByPayload<T extends SocialMediaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SocialMediaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SocialMediaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SocialMediaGroupByOutputType[P]>
            : GetScalarType<T[P], SocialMediaGroupByOutputType[P]>
        }
      >
    >


  export type SocialMediaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    userId?: boolean
    username?: boolean
    displayName?: boolean
    profileUrl?: boolean
    email?: boolean
    metrics?: boolean | SocialMedia$metricsArgs<ExtArgs>
    _count?: boolean | SocialMediaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["socialMedia"]>

  export type SocialMediaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    userId?: boolean
    username?: boolean
    displayName?: boolean
    profileUrl?: boolean
    email?: boolean
  }, ExtArgs["result"]["socialMedia"]>

  export type SocialMediaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    provider?: boolean
    userId?: boolean
    username?: boolean
    displayName?: boolean
    profileUrl?: boolean
    email?: boolean
  }, ExtArgs["result"]["socialMedia"]>

  export type SocialMediaSelectScalar = {
    id?: boolean
    provider?: boolean
    userId?: boolean
    username?: boolean
    displayName?: boolean
    profileUrl?: boolean
    email?: boolean
  }

  export type SocialMediaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "provider" | "userId" | "username" | "displayName" | "profileUrl" | "email", ExtArgs["result"]["socialMedia"]>
  export type SocialMediaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    metrics?: boolean | SocialMedia$metricsArgs<ExtArgs>
    _count?: boolean | SocialMediaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SocialMediaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SocialMediaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SocialMediaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SocialMedia"
    objects: {
      metrics: Prisma.$SocialMediaMetricsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      provider: $Enums.Provider
      userId: string
      username: string
      displayName: string | null
      profileUrl: string | null
      email: string | null
    }, ExtArgs["result"]["socialMedia"]>
    composites: {}
  }

  type SocialMediaGetPayload<S extends boolean | null | undefined | SocialMediaDefaultArgs> = $Result.GetResult<Prisma.$SocialMediaPayload, S>

  type SocialMediaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SocialMediaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SocialMediaCountAggregateInputType | true
    }

  export interface SocialMediaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SocialMedia'], meta: { name: 'SocialMedia' } }
    /**
     * Find zero or one SocialMedia that matches the filter.
     * @param {SocialMediaFindUniqueArgs} args - Arguments to find a SocialMedia
     * @example
     * // Get one SocialMedia
     * const socialMedia = await prisma.socialMedia.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SocialMediaFindUniqueArgs>(args: SelectSubset<T, SocialMediaFindUniqueArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SocialMedia that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SocialMediaFindUniqueOrThrowArgs} args - Arguments to find a SocialMedia
     * @example
     * // Get one SocialMedia
     * const socialMedia = await prisma.socialMedia.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SocialMediaFindUniqueOrThrowArgs>(args: SelectSubset<T, SocialMediaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SocialMedia that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaFindFirstArgs} args - Arguments to find a SocialMedia
     * @example
     * // Get one SocialMedia
     * const socialMedia = await prisma.socialMedia.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SocialMediaFindFirstArgs>(args?: SelectSubset<T, SocialMediaFindFirstArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SocialMedia that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaFindFirstOrThrowArgs} args - Arguments to find a SocialMedia
     * @example
     * // Get one SocialMedia
     * const socialMedia = await prisma.socialMedia.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SocialMediaFindFirstOrThrowArgs>(args?: SelectSubset<T, SocialMediaFindFirstOrThrowArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SocialMedias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SocialMedias
     * const socialMedias = await prisma.socialMedia.findMany()
     * 
     * // Get first 10 SocialMedias
     * const socialMedias = await prisma.socialMedia.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const socialMediaWithIdOnly = await prisma.socialMedia.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SocialMediaFindManyArgs>(args?: SelectSubset<T, SocialMediaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SocialMedia.
     * @param {SocialMediaCreateArgs} args - Arguments to create a SocialMedia.
     * @example
     * // Create one SocialMedia
     * const SocialMedia = await prisma.socialMedia.create({
     *   data: {
     *     // ... data to create a SocialMedia
     *   }
     * })
     * 
     */
    create<T extends SocialMediaCreateArgs>(args: SelectSubset<T, SocialMediaCreateArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SocialMedias.
     * @param {SocialMediaCreateManyArgs} args - Arguments to create many SocialMedias.
     * @example
     * // Create many SocialMedias
     * const socialMedia = await prisma.socialMedia.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SocialMediaCreateManyArgs>(args?: SelectSubset<T, SocialMediaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SocialMedias and returns the data saved in the database.
     * @param {SocialMediaCreateManyAndReturnArgs} args - Arguments to create many SocialMedias.
     * @example
     * // Create many SocialMedias
     * const socialMedia = await prisma.socialMedia.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SocialMedias and only return the `id`
     * const socialMediaWithIdOnly = await prisma.socialMedia.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SocialMediaCreateManyAndReturnArgs>(args?: SelectSubset<T, SocialMediaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SocialMedia.
     * @param {SocialMediaDeleteArgs} args - Arguments to delete one SocialMedia.
     * @example
     * // Delete one SocialMedia
     * const SocialMedia = await prisma.socialMedia.delete({
     *   where: {
     *     // ... filter to delete one SocialMedia
     *   }
     * })
     * 
     */
    delete<T extends SocialMediaDeleteArgs>(args: SelectSubset<T, SocialMediaDeleteArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SocialMedia.
     * @param {SocialMediaUpdateArgs} args - Arguments to update one SocialMedia.
     * @example
     * // Update one SocialMedia
     * const socialMedia = await prisma.socialMedia.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SocialMediaUpdateArgs>(args: SelectSubset<T, SocialMediaUpdateArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SocialMedias.
     * @param {SocialMediaDeleteManyArgs} args - Arguments to filter SocialMedias to delete.
     * @example
     * // Delete a few SocialMedias
     * const { count } = await prisma.socialMedia.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SocialMediaDeleteManyArgs>(args?: SelectSubset<T, SocialMediaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SocialMedias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SocialMedias
     * const socialMedia = await prisma.socialMedia.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SocialMediaUpdateManyArgs>(args: SelectSubset<T, SocialMediaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SocialMedias and returns the data updated in the database.
     * @param {SocialMediaUpdateManyAndReturnArgs} args - Arguments to update many SocialMedias.
     * @example
     * // Update many SocialMedias
     * const socialMedia = await prisma.socialMedia.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SocialMedias and only return the `id`
     * const socialMediaWithIdOnly = await prisma.socialMedia.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SocialMediaUpdateManyAndReturnArgs>(args: SelectSubset<T, SocialMediaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SocialMedia.
     * @param {SocialMediaUpsertArgs} args - Arguments to update or create a SocialMedia.
     * @example
     * // Update or create a SocialMedia
     * const socialMedia = await prisma.socialMedia.upsert({
     *   create: {
     *     // ... data to create a SocialMedia
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SocialMedia we want to update
     *   }
     * })
     */
    upsert<T extends SocialMediaUpsertArgs>(args: SelectSubset<T, SocialMediaUpsertArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SocialMedias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaCountArgs} args - Arguments to filter SocialMedias to count.
     * @example
     * // Count the number of SocialMedias
     * const count = await prisma.socialMedia.count({
     *   where: {
     *     // ... the filter for the SocialMedias we want to count
     *   }
     * })
    **/
    count<T extends SocialMediaCountArgs>(
      args?: Subset<T, SocialMediaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SocialMediaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SocialMedia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SocialMediaAggregateArgs>(args: Subset<T, SocialMediaAggregateArgs>): Prisma.PrismaPromise<GetSocialMediaAggregateType<T>>

    /**
     * Group by SocialMedia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SocialMediaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SocialMediaGroupByArgs['orderBy'] }
        : { orderBy?: SocialMediaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SocialMediaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSocialMediaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SocialMedia model
   */
  readonly fields: SocialMediaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SocialMedia.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SocialMediaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    metrics<T extends SocialMedia$metricsArgs<ExtArgs> = {}>(args?: Subset<T, SocialMedia$metricsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SocialMedia model
   */
  interface SocialMediaFieldRefs {
    readonly id: FieldRef<"SocialMedia", 'String'>
    readonly provider: FieldRef<"SocialMedia", 'Provider'>
    readonly userId: FieldRef<"SocialMedia", 'String'>
    readonly username: FieldRef<"SocialMedia", 'String'>
    readonly displayName: FieldRef<"SocialMedia", 'String'>
    readonly profileUrl: FieldRef<"SocialMedia", 'String'>
    readonly email: FieldRef<"SocialMedia", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SocialMedia findUnique
   */
  export type SocialMediaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * Filter, which SocialMedia to fetch.
     */
    where: SocialMediaWhereUniqueInput
  }

  /**
   * SocialMedia findUniqueOrThrow
   */
  export type SocialMediaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * Filter, which SocialMedia to fetch.
     */
    where: SocialMediaWhereUniqueInput
  }

  /**
   * SocialMedia findFirst
   */
  export type SocialMediaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * Filter, which SocialMedia to fetch.
     */
    where?: SocialMediaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SocialMedias to fetch.
     */
    orderBy?: SocialMediaOrderByWithRelationInput | SocialMediaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SocialMedias.
     */
    cursor?: SocialMediaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SocialMedias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SocialMedias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SocialMedias.
     */
    distinct?: SocialMediaScalarFieldEnum | SocialMediaScalarFieldEnum[]
  }

  /**
   * SocialMedia findFirstOrThrow
   */
  export type SocialMediaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * Filter, which SocialMedia to fetch.
     */
    where?: SocialMediaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SocialMedias to fetch.
     */
    orderBy?: SocialMediaOrderByWithRelationInput | SocialMediaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SocialMedias.
     */
    cursor?: SocialMediaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SocialMedias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SocialMedias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SocialMedias.
     */
    distinct?: SocialMediaScalarFieldEnum | SocialMediaScalarFieldEnum[]
  }

  /**
   * SocialMedia findMany
   */
  export type SocialMediaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * Filter, which SocialMedias to fetch.
     */
    where?: SocialMediaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SocialMedias to fetch.
     */
    orderBy?: SocialMediaOrderByWithRelationInput | SocialMediaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SocialMedias.
     */
    cursor?: SocialMediaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SocialMedias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SocialMedias.
     */
    skip?: number
    distinct?: SocialMediaScalarFieldEnum | SocialMediaScalarFieldEnum[]
  }

  /**
   * SocialMedia create
   */
  export type SocialMediaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * The data needed to create a SocialMedia.
     */
    data: XOR<SocialMediaCreateInput, SocialMediaUncheckedCreateInput>
  }

  /**
   * SocialMedia createMany
   */
  export type SocialMediaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SocialMedias.
     */
    data: SocialMediaCreateManyInput | SocialMediaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SocialMedia createManyAndReturn
   */
  export type SocialMediaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * The data used to create many SocialMedias.
     */
    data: SocialMediaCreateManyInput | SocialMediaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SocialMedia update
   */
  export type SocialMediaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * The data needed to update a SocialMedia.
     */
    data: XOR<SocialMediaUpdateInput, SocialMediaUncheckedUpdateInput>
    /**
     * Choose, which SocialMedia to update.
     */
    where: SocialMediaWhereUniqueInput
  }

  /**
   * SocialMedia updateMany
   */
  export type SocialMediaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SocialMedias.
     */
    data: XOR<SocialMediaUpdateManyMutationInput, SocialMediaUncheckedUpdateManyInput>
    /**
     * Filter which SocialMedias to update
     */
    where?: SocialMediaWhereInput
    /**
     * Limit how many SocialMedias to update.
     */
    limit?: number
  }

  /**
   * SocialMedia updateManyAndReturn
   */
  export type SocialMediaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * The data used to update SocialMedias.
     */
    data: XOR<SocialMediaUpdateManyMutationInput, SocialMediaUncheckedUpdateManyInput>
    /**
     * Filter which SocialMedias to update
     */
    where?: SocialMediaWhereInput
    /**
     * Limit how many SocialMedias to update.
     */
    limit?: number
  }

  /**
   * SocialMedia upsert
   */
  export type SocialMediaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * The filter to search for the SocialMedia to update in case it exists.
     */
    where: SocialMediaWhereUniqueInput
    /**
     * In case the SocialMedia found by the `where` argument doesn't exist, create a new SocialMedia with this data.
     */
    create: XOR<SocialMediaCreateInput, SocialMediaUncheckedCreateInput>
    /**
     * In case the SocialMedia was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SocialMediaUpdateInput, SocialMediaUncheckedUpdateInput>
  }

  /**
   * SocialMedia delete
   */
  export type SocialMediaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
    /**
     * Filter which SocialMedia to delete.
     */
    where: SocialMediaWhereUniqueInput
  }

  /**
   * SocialMedia deleteMany
   */
  export type SocialMediaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SocialMedias to delete
     */
    where?: SocialMediaWhereInput
    /**
     * Limit how many SocialMedias to delete.
     */
    limit?: number
  }

  /**
   * SocialMedia.metrics
   */
  export type SocialMedia$metricsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    where?: SocialMediaMetricsWhereInput
    orderBy?: SocialMediaMetricsOrderByWithRelationInput | SocialMediaMetricsOrderByWithRelationInput[]
    cursor?: SocialMediaMetricsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SocialMediaMetricsScalarFieldEnum | SocialMediaMetricsScalarFieldEnum[]
  }

  /**
   * SocialMedia without action
   */
  export type SocialMediaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMedia
     */
    select?: SocialMediaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMedia
     */
    omit?: SocialMediaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaInclude<ExtArgs> | null
  }


  /**
   * Model SocialMediaMetrics
   */

  export type AggregateSocialMediaMetrics = {
    _count: SocialMediaMetricsCountAggregateOutputType | null
    _avg: SocialMediaMetricsAvgAggregateOutputType | null
    _sum: SocialMediaMetricsSumAggregateOutputType | null
    _min: SocialMediaMetricsMinAggregateOutputType | null
    _max: SocialMediaMetricsMaxAggregateOutputType | null
  }

  export type SocialMediaMetricsAvgAggregateOutputType = {
    metricValue: number | null
  }

  export type SocialMediaMetricsSumAggregateOutputType = {
    metricValue: number | null
  }

  export type SocialMediaMetricsMinAggregateOutputType = {
    id: string | null
    socialMediaId: string | null
    metricName: $Enums.Metric | null
    metricValue: number | null
    lastSynced: Date | null
  }

  export type SocialMediaMetricsMaxAggregateOutputType = {
    id: string | null
    socialMediaId: string | null
    metricName: $Enums.Metric | null
    metricValue: number | null
    lastSynced: Date | null
  }

  export type SocialMediaMetricsCountAggregateOutputType = {
    id: number
    socialMediaId: number
    metricName: number
    metricValue: number
    lastSynced: number
    _all: number
  }


  export type SocialMediaMetricsAvgAggregateInputType = {
    metricValue?: true
  }

  export type SocialMediaMetricsSumAggregateInputType = {
    metricValue?: true
  }

  export type SocialMediaMetricsMinAggregateInputType = {
    id?: true
    socialMediaId?: true
    metricName?: true
    metricValue?: true
    lastSynced?: true
  }

  export type SocialMediaMetricsMaxAggregateInputType = {
    id?: true
    socialMediaId?: true
    metricName?: true
    metricValue?: true
    lastSynced?: true
  }

  export type SocialMediaMetricsCountAggregateInputType = {
    id?: true
    socialMediaId?: true
    metricName?: true
    metricValue?: true
    lastSynced?: true
    _all?: true
  }

  export type SocialMediaMetricsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SocialMediaMetrics to aggregate.
     */
    where?: SocialMediaMetricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SocialMediaMetrics to fetch.
     */
    orderBy?: SocialMediaMetricsOrderByWithRelationInput | SocialMediaMetricsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SocialMediaMetricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SocialMediaMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SocialMediaMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SocialMediaMetrics
    **/
    _count?: true | SocialMediaMetricsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SocialMediaMetricsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SocialMediaMetricsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SocialMediaMetricsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SocialMediaMetricsMaxAggregateInputType
  }

  export type GetSocialMediaMetricsAggregateType<T extends SocialMediaMetricsAggregateArgs> = {
        [P in keyof T & keyof AggregateSocialMediaMetrics]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSocialMediaMetrics[P]>
      : GetScalarType<T[P], AggregateSocialMediaMetrics[P]>
  }




  export type SocialMediaMetricsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SocialMediaMetricsWhereInput
    orderBy?: SocialMediaMetricsOrderByWithAggregationInput | SocialMediaMetricsOrderByWithAggregationInput[]
    by: SocialMediaMetricsScalarFieldEnum[] | SocialMediaMetricsScalarFieldEnum
    having?: SocialMediaMetricsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SocialMediaMetricsCountAggregateInputType | true
    _avg?: SocialMediaMetricsAvgAggregateInputType
    _sum?: SocialMediaMetricsSumAggregateInputType
    _min?: SocialMediaMetricsMinAggregateInputType
    _max?: SocialMediaMetricsMaxAggregateInputType
  }

  export type SocialMediaMetricsGroupByOutputType = {
    id: string
    socialMediaId: string
    metricName: $Enums.Metric
    metricValue: number
    lastSynced: Date | null
    _count: SocialMediaMetricsCountAggregateOutputType | null
    _avg: SocialMediaMetricsAvgAggregateOutputType | null
    _sum: SocialMediaMetricsSumAggregateOutputType | null
    _min: SocialMediaMetricsMinAggregateOutputType | null
    _max: SocialMediaMetricsMaxAggregateOutputType | null
  }

  type GetSocialMediaMetricsGroupByPayload<T extends SocialMediaMetricsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SocialMediaMetricsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SocialMediaMetricsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SocialMediaMetricsGroupByOutputType[P]>
            : GetScalarType<T[P], SocialMediaMetricsGroupByOutputType[P]>
        }
      >
    >


  export type SocialMediaMetricsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    socialMediaId?: boolean
    metricName?: boolean
    metricValue?: boolean
    lastSynced?: boolean
    socialMedia?: boolean | SocialMediaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["socialMediaMetrics"]>

  export type SocialMediaMetricsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    socialMediaId?: boolean
    metricName?: boolean
    metricValue?: boolean
    lastSynced?: boolean
    socialMedia?: boolean | SocialMediaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["socialMediaMetrics"]>

  export type SocialMediaMetricsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    socialMediaId?: boolean
    metricName?: boolean
    metricValue?: boolean
    lastSynced?: boolean
    socialMedia?: boolean | SocialMediaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["socialMediaMetrics"]>

  export type SocialMediaMetricsSelectScalar = {
    id?: boolean
    socialMediaId?: boolean
    metricName?: boolean
    metricValue?: boolean
    lastSynced?: boolean
  }

  export type SocialMediaMetricsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "socialMediaId" | "metricName" | "metricValue" | "lastSynced", ExtArgs["result"]["socialMediaMetrics"]>
  export type SocialMediaMetricsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    socialMedia?: boolean | SocialMediaDefaultArgs<ExtArgs>
  }
  export type SocialMediaMetricsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    socialMedia?: boolean | SocialMediaDefaultArgs<ExtArgs>
  }
  export type SocialMediaMetricsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    socialMedia?: boolean | SocialMediaDefaultArgs<ExtArgs>
  }

  export type $SocialMediaMetricsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SocialMediaMetrics"
    objects: {
      socialMedia: Prisma.$SocialMediaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      socialMediaId: string
      metricName: $Enums.Metric
      metricValue: number
      lastSynced: Date | null
    }, ExtArgs["result"]["socialMediaMetrics"]>
    composites: {}
  }

  type SocialMediaMetricsGetPayload<S extends boolean | null | undefined | SocialMediaMetricsDefaultArgs> = $Result.GetResult<Prisma.$SocialMediaMetricsPayload, S>

  type SocialMediaMetricsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SocialMediaMetricsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SocialMediaMetricsCountAggregateInputType | true
    }

  export interface SocialMediaMetricsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SocialMediaMetrics'], meta: { name: 'SocialMediaMetrics' } }
    /**
     * Find zero or one SocialMediaMetrics that matches the filter.
     * @param {SocialMediaMetricsFindUniqueArgs} args - Arguments to find a SocialMediaMetrics
     * @example
     * // Get one SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SocialMediaMetricsFindUniqueArgs>(args: SelectSubset<T, SocialMediaMetricsFindUniqueArgs<ExtArgs>>): Prisma__SocialMediaMetricsClient<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SocialMediaMetrics that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SocialMediaMetricsFindUniqueOrThrowArgs} args - Arguments to find a SocialMediaMetrics
     * @example
     * // Get one SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SocialMediaMetricsFindUniqueOrThrowArgs>(args: SelectSubset<T, SocialMediaMetricsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SocialMediaMetricsClient<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SocialMediaMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaMetricsFindFirstArgs} args - Arguments to find a SocialMediaMetrics
     * @example
     * // Get one SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SocialMediaMetricsFindFirstArgs>(args?: SelectSubset<T, SocialMediaMetricsFindFirstArgs<ExtArgs>>): Prisma__SocialMediaMetricsClient<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SocialMediaMetrics that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaMetricsFindFirstOrThrowArgs} args - Arguments to find a SocialMediaMetrics
     * @example
     * // Get one SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SocialMediaMetricsFindFirstOrThrowArgs>(args?: SelectSubset<T, SocialMediaMetricsFindFirstOrThrowArgs<ExtArgs>>): Prisma__SocialMediaMetricsClient<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SocialMediaMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaMetricsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.findMany()
     * 
     * // Get first 10 SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const socialMediaMetricsWithIdOnly = await prisma.socialMediaMetrics.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SocialMediaMetricsFindManyArgs>(args?: SelectSubset<T, SocialMediaMetricsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SocialMediaMetrics.
     * @param {SocialMediaMetricsCreateArgs} args - Arguments to create a SocialMediaMetrics.
     * @example
     * // Create one SocialMediaMetrics
     * const SocialMediaMetrics = await prisma.socialMediaMetrics.create({
     *   data: {
     *     // ... data to create a SocialMediaMetrics
     *   }
     * })
     * 
     */
    create<T extends SocialMediaMetricsCreateArgs>(args: SelectSubset<T, SocialMediaMetricsCreateArgs<ExtArgs>>): Prisma__SocialMediaMetricsClient<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SocialMediaMetrics.
     * @param {SocialMediaMetricsCreateManyArgs} args - Arguments to create many SocialMediaMetrics.
     * @example
     * // Create many SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SocialMediaMetricsCreateManyArgs>(args?: SelectSubset<T, SocialMediaMetricsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SocialMediaMetrics and returns the data saved in the database.
     * @param {SocialMediaMetricsCreateManyAndReturnArgs} args - Arguments to create many SocialMediaMetrics.
     * @example
     * // Create many SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SocialMediaMetrics and only return the `id`
     * const socialMediaMetricsWithIdOnly = await prisma.socialMediaMetrics.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SocialMediaMetricsCreateManyAndReturnArgs>(args?: SelectSubset<T, SocialMediaMetricsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SocialMediaMetrics.
     * @param {SocialMediaMetricsDeleteArgs} args - Arguments to delete one SocialMediaMetrics.
     * @example
     * // Delete one SocialMediaMetrics
     * const SocialMediaMetrics = await prisma.socialMediaMetrics.delete({
     *   where: {
     *     // ... filter to delete one SocialMediaMetrics
     *   }
     * })
     * 
     */
    delete<T extends SocialMediaMetricsDeleteArgs>(args: SelectSubset<T, SocialMediaMetricsDeleteArgs<ExtArgs>>): Prisma__SocialMediaMetricsClient<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SocialMediaMetrics.
     * @param {SocialMediaMetricsUpdateArgs} args - Arguments to update one SocialMediaMetrics.
     * @example
     * // Update one SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SocialMediaMetricsUpdateArgs>(args: SelectSubset<T, SocialMediaMetricsUpdateArgs<ExtArgs>>): Prisma__SocialMediaMetricsClient<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SocialMediaMetrics.
     * @param {SocialMediaMetricsDeleteManyArgs} args - Arguments to filter SocialMediaMetrics to delete.
     * @example
     * // Delete a few SocialMediaMetrics
     * const { count } = await prisma.socialMediaMetrics.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SocialMediaMetricsDeleteManyArgs>(args?: SelectSubset<T, SocialMediaMetricsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SocialMediaMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaMetricsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SocialMediaMetricsUpdateManyArgs>(args: SelectSubset<T, SocialMediaMetricsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SocialMediaMetrics and returns the data updated in the database.
     * @param {SocialMediaMetricsUpdateManyAndReturnArgs} args - Arguments to update many SocialMediaMetrics.
     * @example
     * // Update many SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SocialMediaMetrics and only return the `id`
     * const socialMediaMetricsWithIdOnly = await prisma.socialMediaMetrics.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SocialMediaMetricsUpdateManyAndReturnArgs>(args: SelectSubset<T, SocialMediaMetricsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SocialMediaMetrics.
     * @param {SocialMediaMetricsUpsertArgs} args - Arguments to update or create a SocialMediaMetrics.
     * @example
     * // Update or create a SocialMediaMetrics
     * const socialMediaMetrics = await prisma.socialMediaMetrics.upsert({
     *   create: {
     *     // ... data to create a SocialMediaMetrics
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SocialMediaMetrics we want to update
     *   }
     * })
     */
    upsert<T extends SocialMediaMetricsUpsertArgs>(args: SelectSubset<T, SocialMediaMetricsUpsertArgs<ExtArgs>>): Prisma__SocialMediaMetricsClient<$Result.GetResult<Prisma.$SocialMediaMetricsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SocialMediaMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaMetricsCountArgs} args - Arguments to filter SocialMediaMetrics to count.
     * @example
     * // Count the number of SocialMediaMetrics
     * const count = await prisma.socialMediaMetrics.count({
     *   where: {
     *     // ... the filter for the SocialMediaMetrics we want to count
     *   }
     * })
    **/
    count<T extends SocialMediaMetricsCountArgs>(
      args?: Subset<T, SocialMediaMetricsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SocialMediaMetricsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SocialMediaMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaMetricsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SocialMediaMetricsAggregateArgs>(args: Subset<T, SocialMediaMetricsAggregateArgs>): Prisma.PrismaPromise<GetSocialMediaMetricsAggregateType<T>>

    /**
     * Group by SocialMediaMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SocialMediaMetricsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SocialMediaMetricsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SocialMediaMetricsGroupByArgs['orderBy'] }
        : { orderBy?: SocialMediaMetricsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SocialMediaMetricsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSocialMediaMetricsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SocialMediaMetrics model
   */
  readonly fields: SocialMediaMetricsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SocialMediaMetrics.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SocialMediaMetricsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    socialMedia<T extends SocialMediaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SocialMediaDefaultArgs<ExtArgs>>): Prisma__SocialMediaClient<$Result.GetResult<Prisma.$SocialMediaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SocialMediaMetrics model
   */
  interface SocialMediaMetricsFieldRefs {
    readonly id: FieldRef<"SocialMediaMetrics", 'String'>
    readonly socialMediaId: FieldRef<"SocialMediaMetrics", 'String'>
    readonly metricName: FieldRef<"SocialMediaMetrics", 'Metric'>
    readonly metricValue: FieldRef<"SocialMediaMetrics", 'Int'>
    readonly lastSynced: FieldRef<"SocialMediaMetrics", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SocialMediaMetrics findUnique
   */
  export type SocialMediaMetricsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * Filter, which SocialMediaMetrics to fetch.
     */
    where: SocialMediaMetricsWhereUniqueInput
  }

  /**
   * SocialMediaMetrics findUniqueOrThrow
   */
  export type SocialMediaMetricsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * Filter, which SocialMediaMetrics to fetch.
     */
    where: SocialMediaMetricsWhereUniqueInput
  }

  /**
   * SocialMediaMetrics findFirst
   */
  export type SocialMediaMetricsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * Filter, which SocialMediaMetrics to fetch.
     */
    where?: SocialMediaMetricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SocialMediaMetrics to fetch.
     */
    orderBy?: SocialMediaMetricsOrderByWithRelationInput | SocialMediaMetricsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SocialMediaMetrics.
     */
    cursor?: SocialMediaMetricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SocialMediaMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SocialMediaMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SocialMediaMetrics.
     */
    distinct?: SocialMediaMetricsScalarFieldEnum | SocialMediaMetricsScalarFieldEnum[]
  }

  /**
   * SocialMediaMetrics findFirstOrThrow
   */
  export type SocialMediaMetricsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * Filter, which SocialMediaMetrics to fetch.
     */
    where?: SocialMediaMetricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SocialMediaMetrics to fetch.
     */
    orderBy?: SocialMediaMetricsOrderByWithRelationInput | SocialMediaMetricsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SocialMediaMetrics.
     */
    cursor?: SocialMediaMetricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SocialMediaMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SocialMediaMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SocialMediaMetrics.
     */
    distinct?: SocialMediaMetricsScalarFieldEnum | SocialMediaMetricsScalarFieldEnum[]
  }

  /**
   * SocialMediaMetrics findMany
   */
  export type SocialMediaMetricsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * Filter, which SocialMediaMetrics to fetch.
     */
    where?: SocialMediaMetricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SocialMediaMetrics to fetch.
     */
    orderBy?: SocialMediaMetricsOrderByWithRelationInput | SocialMediaMetricsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SocialMediaMetrics.
     */
    cursor?: SocialMediaMetricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SocialMediaMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SocialMediaMetrics.
     */
    skip?: number
    distinct?: SocialMediaMetricsScalarFieldEnum | SocialMediaMetricsScalarFieldEnum[]
  }

  /**
   * SocialMediaMetrics create
   */
  export type SocialMediaMetricsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * The data needed to create a SocialMediaMetrics.
     */
    data: XOR<SocialMediaMetricsCreateInput, SocialMediaMetricsUncheckedCreateInput>
  }

  /**
   * SocialMediaMetrics createMany
   */
  export type SocialMediaMetricsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SocialMediaMetrics.
     */
    data: SocialMediaMetricsCreateManyInput | SocialMediaMetricsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SocialMediaMetrics createManyAndReturn
   */
  export type SocialMediaMetricsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * The data used to create many SocialMediaMetrics.
     */
    data: SocialMediaMetricsCreateManyInput | SocialMediaMetricsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SocialMediaMetrics update
   */
  export type SocialMediaMetricsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * The data needed to update a SocialMediaMetrics.
     */
    data: XOR<SocialMediaMetricsUpdateInput, SocialMediaMetricsUncheckedUpdateInput>
    /**
     * Choose, which SocialMediaMetrics to update.
     */
    where: SocialMediaMetricsWhereUniqueInput
  }

  /**
   * SocialMediaMetrics updateMany
   */
  export type SocialMediaMetricsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SocialMediaMetrics.
     */
    data: XOR<SocialMediaMetricsUpdateManyMutationInput, SocialMediaMetricsUncheckedUpdateManyInput>
    /**
     * Filter which SocialMediaMetrics to update
     */
    where?: SocialMediaMetricsWhereInput
    /**
     * Limit how many SocialMediaMetrics to update.
     */
    limit?: number
  }

  /**
   * SocialMediaMetrics updateManyAndReturn
   */
  export type SocialMediaMetricsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * The data used to update SocialMediaMetrics.
     */
    data: XOR<SocialMediaMetricsUpdateManyMutationInput, SocialMediaMetricsUncheckedUpdateManyInput>
    /**
     * Filter which SocialMediaMetrics to update
     */
    where?: SocialMediaMetricsWhereInput
    /**
     * Limit how many SocialMediaMetrics to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SocialMediaMetrics upsert
   */
  export type SocialMediaMetricsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * The filter to search for the SocialMediaMetrics to update in case it exists.
     */
    where: SocialMediaMetricsWhereUniqueInput
    /**
     * In case the SocialMediaMetrics found by the `where` argument doesn't exist, create a new SocialMediaMetrics with this data.
     */
    create: XOR<SocialMediaMetricsCreateInput, SocialMediaMetricsUncheckedCreateInput>
    /**
     * In case the SocialMediaMetrics was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SocialMediaMetricsUpdateInput, SocialMediaMetricsUncheckedUpdateInput>
  }

  /**
   * SocialMediaMetrics delete
   */
  export type SocialMediaMetricsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
    /**
     * Filter which SocialMediaMetrics to delete.
     */
    where: SocialMediaMetricsWhereUniqueInput
  }

  /**
   * SocialMediaMetrics deleteMany
   */
  export type SocialMediaMetricsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SocialMediaMetrics to delete
     */
    where?: SocialMediaMetricsWhereInput
    /**
     * Limit how many SocialMediaMetrics to delete.
     */
    limit?: number
  }

  /**
   * SocialMediaMetrics without action
   */
  export type SocialMediaMetricsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SocialMediaMetrics
     */
    select?: SocialMediaMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SocialMediaMetrics
     */
    omit?: SocialMediaMetricsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SocialMediaMetricsInclude<ExtArgs> | null
  }


  /**
   * Model DatabaseReport
   */

  export type AggregateDatabaseReport = {
    _count: DatabaseReportCountAggregateOutputType | null
    _min: DatabaseReportMinAggregateOutputType | null
    _max: DatabaseReportMaxAggregateOutputType | null
  }

  export type DatabaseReportMinAggregateOutputType = {
    id: string | null
    reportDate: Date | null
  }

  export type DatabaseReportMaxAggregateOutputType = {
    id: string | null
    reportDate: Date | null
  }

  export type DatabaseReportCountAggregateOutputType = {
    id: number
    reportDate: number
    _all: number
  }


  export type DatabaseReportMinAggregateInputType = {
    id?: true
    reportDate?: true
  }

  export type DatabaseReportMaxAggregateInputType = {
    id?: true
    reportDate?: true
  }

  export type DatabaseReportCountAggregateInputType = {
    id?: true
    reportDate?: true
    _all?: true
  }

  export type DatabaseReportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatabaseReport to aggregate.
     */
    where?: DatabaseReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatabaseReports to fetch.
     */
    orderBy?: DatabaseReportOrderByWithRelationInput | DatabaseReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DatabaseReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatabaseReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatabaseReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DatabaseReports
    **/
    _count?: true | DatabaseReportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DatabaseReportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DatabaseReportMaxAggregateInputType
  }

  export type GetDatabaseReportAggregateType<T extends DatabaseReportAggregateArgs> = {
        [P in keyof T & keyof AggregateDatabaseReport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDatabaseReport[P]>
      : GetScalarType<T[P], AggregateDatabaseReport[P]>
  }




  export type DatabaseReportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DatabaseReportWhereInput
    orderBy?: DatabaseReportOrderByWithAggregationInput | DatabaseReportOrderByWithAggregationInput[]
    by: DatabaseReportScalarFieldEnum[] | DatabaseReportScalarFieldEnum
    having?: DatabaseReportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DatabaseReportCountAggregateInputType | true
    _min?: DatabaseReportMinAggregateInputType
    _max?: DatabaseReportMaxAggregateInputType
  }

  export type DatabaseReportGroupByOutputType = {
    id: string
    reportDate: Date
    _count: DatabaseReportCountAggregateOutputType | null
    _min: DatabaseReportMinAggregateOutputType | null
    _max: DatabaseReportMaxAggregateOutputType | null
  }

  type GetDatabaseReportGroupByPayload<T extends DatabaseReportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DatabaseReportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DatabaseReportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DatabaseReportGroupByOutputType[P]>
            : GetScalarType<T[P], DatabaseReportGroupByOutputType[P]>
        }
      >
    >


  export type DatabaseReportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reportDate?: boolean
    counts?: boolean | DatabaseReport$countsArgs<ExtArgs>
    _count?: boolean | DatabaseReportCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["databaseReport"]>

  export type DatabaseReportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reportDate?: boolean
  }, ExtArgs["result"]["databaseReport"]>

  export type DatabaseReportSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reportDate?: boolean
  }, ExtArgs["result"]["databaseReport"]>

  export type DatabaseReportSelectScalar = {
    id?: boolean
    reportDate?: boolean
  }

  export type DatabaseReportOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "reportDate", ExtArgs["result"]["databaseReport"]>
  export type DatabaseReportInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    counts?: boolean | DatabaseReport$countsArgs<ExtArgs>
    _count?: boolean | DatabaseReportCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DatabaseReportIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DatabaseReportIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DatabaseReportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DatabaseReport"
    objects: {
      counts: Prisma.$DatabaseReportCountPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      reportDate: Date
    }, ExtArgs["result"]["databaseReport"]>
    composites: {}
  }

  type DatabaseReportGetPayload<S extends boolean | null | undefined | DatabaseReportDefaultArgs> = $Result.GetResult<Prisma.$DatabaseReportPayload, S>

  type DatabaseReportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DatabaseReportFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DatabaseReportCountAggregateInputType | true
    }

  export interface DatabaseReportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DatabaseReport'], meta: { name: 'DatabaseReport' } }
    /**
     * Find zero or one DatabaseReport that matches the filter.
     * @param {DatabaseReportFindUniqueArgs} args - Arguments to find a DatabaseReport
     * @example
     * // Get one DatabaseReport
     * const databaseReport = await prisma.databaseReport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DatabaseReportFindUniqueArgs>(args: SelectSubset<T, DatabaseReportFindUniqueArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DatabaseReport that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DatabaseReportFindUniqueOrThrowArgs} args - Arguments to find a DatabaseReport
     * @example
     * // Get one DatabaseReport
     * const databaseReport = await prisma.databaseReport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DatabaseReportFindUniqueOrThrowArgs>(args: SelectSubset<T, DatabaseReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatabaseReport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportFindFirstArgs} args - Arguments to find a DatabaseReport
     * @example
     * // Get one DatabaseReport
     * const databaseReport = await prisma.databaseReport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DatabaseReportFindFirstArgs>(args?: SelectSubset<T, DatabaseReportFindFirstArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatabaseReport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportFindFirstOrThrowArgs} args - Arguments to find a DatabaseReport
     * @example
     * // Get one DatabaseReport
     * const databaseReport = await prisma.databaseReport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DatabaseReportFindFirstOrThrowArgs>(args?: SelectSubset<T, DatabaseReportFindFirstOrThrowArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DatabaseReports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DatabaseReports
     * const databaseReports = await prisma.databaseReport.findMany()
     * 
     * // Get first 10 DatabaseReports
     * const databaseReports = await prisma.databaseReport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const databaseReportWithIdOnly = await prisma.databaseReport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DatabaseReportFindManyArgs>(args?: SelectSubset<T, DatabaseReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DatabaseReport.
     * @param {DatabaseReportCreateArgs} args - Arguments to create a DatabaseReport.
     * @example
     * // Create one DatabaseReport
     * const DatabaseReport = await prisma.databaseReport.create({
     *   data: {
     *     // ... data to create a DatabaseReport
     *   }
     * })
     * 
     */
    create<T extends DatabaseReportCreateArgs>(args: SelectSubset<T, DatabaseReportCreateArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DatabaseReports.
     * @param {DatabaseReportCreateManyArgs} args - Arguments to create many DatabaseReports.
     * @example
     * // Create many DatabaseReports
     * const databaseReport = await prisma.databaseReport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DatabaseReportCreateManyArgs>(args?: SelectSubset<T, DatabaseReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DatabaseReports and returns the data saved in the database.
     * @param {DatabaseReportCreateManyAndReturnArgs} args - Arguments to create many DatabaseReports.
     * @example
     * // Create many DatabaseReports
     * const databaseReport = await prisma.databaseReport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DatabaseReports and only return the `id`
     * const databaseReportWithIdOnly = await prisma.databaseReport.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DatabaseReportCreateManyAndReturnArgs>(args?: SelectSubset<T, DatabaseReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DatabaseReport.
     * @param {DatabaseReportDeleteArgs} args - Arguments to delete one DatabaseReport.
     * @example
     * // Delete one DatabaseReport
     * const DatabaseReport = await prisma.databaseReport.delete({
     *   where: {
     *     // ... filter to delete one DatabaseReport
     *   }
     * })
     * 
     */
    delete<T extends DatabaseReportDeleteArgs>(args: SelectSubset<T, DatabaseReportDeleteArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DatabaseReport.
     * @param {DatabaseReportUpdateArgs} args - Arguments to update one DatabaseReport.
     * @example
     * // Update one DatabaseReport
     * const databaseReport = await prisma.databaseReport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DatabaseReportUpdateArgs>(args: SelectSubset<T, DatabaseReportUpdateArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DatabaseReports.
     * @param {DatabaseReportDeleteManyArgs} args - Arguments to filter DatabaseReports to delete.
     * @example
     * // Delete a few DatabaseReports
     * const { count } = await prisma.databaseReport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DatabaseReportDeleteManyArgs>(args?: SelectSubset<T, DatabaseReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatabaseReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DatabaseReports
     * const databaseReport = await prisma.databaseReport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DatabaseReportUpdateManyArgs>(args: SelectSubset<T, DatabaseReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatabaseReports and returns the data updated in the database.
     * @param {DatabaseReportUpdateManyAndReturnArgs} args - Arguments to update many DatabaseReports.
     * @example
     * // Update many DatabaseReports
     * const databaseReport = await prisma.databaseReport.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DatabaseReports and only return the `id`
     * const databaseReportWithIdOnly = await prisma.databaseReport.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DatabaseReportUpdateManyAndReturnArgs>(args: SelectSubset<T, DatabaseReportUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DatabaseReport.
     * @param {DatabaseReportUpsertArgs} args - Arguments to update or create a DatabaseReport.
     * @example
     * // Update or create a DatabaseReport
     * const databaseReport = await prisma.databaseReport.upsert({
     *   create: {
     *     // ... data to create a DatabaseReport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DatabaseReport we want to update
     *   }
     * })
     */
    upsert<T extends DatabaseReportUpsertArgs>(args: SelectSubset<T, DatabaseReportUpsertArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DatabaseReports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportCountArgs} args - Arguments to filter DatabaseReports to count.
     * @example
     * // Count the number of DatabaseReports
     * const count = await prisma.databaseReport.count({
     *   where: {
     *     // ... the filter for the DatabaseReports we want to count
     *   }
     * })
    **/
    count<T extends DatabaseReportCountArgs>(
      args?: Subset<T, DatabaseReportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DatabaseReportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DatabaseReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DatabaseReportAggregateArgs>(args: Subset<T, DatabaseReportAggregateArgs>): Prisma.PrismaPromise<GetDatabaseReportAggregateType<T>>

    /**
     * Group by DatabaseReport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DatabaseReportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DatabaseReportGroupByArgs['orderBy'] }
        : { orderBy?: DatabaseReportGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DatabaseReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDatabaseReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DatabaseReport model
   */
  readonly fields: DatabaseReportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DatabaseReport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DatabaseReportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    counts<T extends DatabaseReport$countsArgs<ExtArgs> = {}>(args?: Subset<T, DatabaseReport$countsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DatabaseReport model
   */
  interface DatabaseReportFieldRefs {
    readonly id: FieldRef<"DatabaseReport", 'String'>
    readonly reportDate: FieldRef<"DatabaseReport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DatabaseReport findUnique
   */
  export type DatabaseReportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReport to fetch.
     */
    where: DatabaseReportWhereUniqueInput
  }

  /**
   * DatabaseReport findUniqueOrThrow
   */
  export type DatabaseReportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReport to fetch.
     */
    where: DatabaseReportWhereUniqueInput
  }

  /**
   * DatabaseReport findFirst
   */
  export type DatabaseReportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReport to fetch.
     */
    where?: DatabaseReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatabaseReports to fetch.
     */
    orderBy?: DatabaseReportOrderByWithRelationInput | DatabaseReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatabaseReports.
     */
    cursor?: DatabaseReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatabaseReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatabaseReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatabaseReports.
     */
    distinct?: DatabaseReportScalarFieldEnum | DatabaseReportScalarFieldEnum[]
  }

  /**
   * DatabaseReport findFirstOrThrow
   */
  export type DatabaseReportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReport to fetch.
     */
    where?: DatabaseReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatabaseReports to fetch.
     */
    orderBy?: DatabaseReportOrderByWithRelationInput | DatabaseReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatabaseReports.
     */
    cursor?: DatabaseReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatabaseReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatabaseReports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatabaseReports.
     */
    distinct?: DatabaseReportScalarFieldEnum | DatabaseReportScalarFieldEnum[]
  }

  /**
   * DatabaseReport findMany
   */
  export type DatabaseReportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReports to fetch.
     */
    where?: DatabaseReportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatabaseReports to fetch.
     */
    orderBy?: DatabaseReportOrderByWithRelationInput | DatabaseReportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DatabaseReports.
     */
    cursor?: DatabaseReportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatabaseReports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatabaseReports.
     */
    skip?: number
    distinct?: DatabaseReportScalarFieldEnum | DatabaseReportScalarFieldEnum[]
  }

  /**
   * DatabaseReport create
   */
  export type DatabaseReportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * The data needed to create a DatabaseReport.
     */
    data: XOR<DatabaseReportCreateInput, DatabaseReportUncheckedCreateInput>
  }

  /**
   * DatabaseReport createMany
   */
  export type DatabaseReportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DatabaseReports.
     */
    data: DatabaseReportCreateManyInput | DatabaseReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatabaseReport createManyAndReturn
   */
  export type DatabaseReportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * The data used to create many DatabaseReports.
     */
    data: DatabaseReportCreateManyInput | DatabaseReportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatabaseReport update
   */
  export type DatabaseReportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * The data needed to update a DatabaseReport.
     */
    data: XOR<DatabaseReportUpdateInput, DatabaseReportUncheckedUpdateInput>
    /**
     * Choose, which DatabaseReport to update.
     */
    where: DatabaseReportWhereUniqueInput
  }

  /**
   * DatabaseReport updateMany
   */
  export type DatabaseReportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DatabaseReports.
     */
    data: XOR<DatabaseReportUpdateManyMutationInput, DatabaseReportUncheckedUpdateManyInput>
    /**
     * Filter which DatabaseReports to update
     */
    where?: DatabaseReportWhereInput
    /**
     * Limit how many DatabaseReports to update.
     */
    limit?: number
  }

  /**
   * DatabaseReport updateManyAndReturn
   */
  export type DatabaseReportUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * The data used to update DatabaseReports.
     */
    data: XOR<DatabaseReportUpdateManyMutationInput, DatabaseReportUncheckedUpdateManyInput>
    /**
     * Filter which DatabaseReports to update
     */
    where?: DatabaseReportWhereInput
    /**
     * Limit how many DatabaseReports to update.
     */
    limit?: number
  }

  /**
   * DatabaseReport upsert
   */
  export type DatabaseReportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * The filter to search for the DatabaseReport to update in case it exists.
     */
    where: DatabaseReportWhereUniqueInput
    /**
     * In case the DatabaseReport found by the `where` argument doesn't exist, create a new DatabaseReport with this data.
     */
    create: XOR<DatabaseReportCreateInput, DatabaseReportUncheckedCreateInput>
    /**
     * In case the DatabaseReport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DatabaseReportUpdateInput, DatabaseReportUncheckedUpdateInput>
  }

  /**
   * DatabaseReport delete
   */
  export type DatabaseReportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
    /**
     * Filter which DatabaseReport to delete.
     */
    where: DatabaseReportWhereUniqueInput
  }

  /**
   * DatabaseReport deleteMany
   */
  export type DatabaseReportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatabaseReports to delete
     */
    where?: DatabaseReportWhereInput
    /**
     * Limit how many DatabaseReports to delete.
     */
    limit?: number
  }

  /**
   * DatabaseReport.counts
   */
  export type DatabaseReport$countsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    where?: DatabaseReportCountWhereInput
    orderBy?: DatabaseReportCountOrderByWithRelationInput | DatabaseReportCountOrderByWithRelationInput[]
    cursor?: DatabaseReportCountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DatabaseReportCountScalarFieldEnum | DatabaseReportCountScalarFieldEnum[]
  }

  /**
   * DatabaseReport without action
   */
  export type DatabaseReportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReport
     */
    select?: DatabaseReportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReport
     */
    omit?: DatabaseReportOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportInclude<ExtArgs> | null
  }


  /**
   * Model DatabaseReportCount
   */

  export type AggregateDatabaseReportCount = {
    _count: DatabaseReportCountCountAggregateOutputType | null
    _avg: DatabaseReportCountAvgAggregateOutputType | null
    _sum: DatabaseReportCountSumAggregateOutputType | null
    _min: DatabaseReportCountMinAggregateOutputType | null
    _max: DatabaseReportCountMaxAggregateOutputType | null
  }

  export type DatabaseReportCountAvgAggregateOutputType = {
    value: number | null
  }

  export type DatabaseReportCountSumAggregateOutputType = {
    value: number | null
  }

  export type DatabaseReportCountMinAggregateOutputType = {
    id: string | null
    reportId: string | null
    count: $Enums.Count | null
    value: number | null
  }

  export type DatabaseReportCountMaxAggregateOutputType = {
    id: string | null
    reportId: string | null
    count: $Enums.Count | null
    value: number | null
  }

  export type DatabaseReportCountCountAggregateOutputType = {
    id: number
    reportId: number
    count: number
    value: number
    _all: number
  }


  export type DatabaseReportCountAvgAggregateInputType = {
    value?: true
  }

  export type DatabaseReportCountSumAggregateInputType = {
    value?: true
  }

  export type DatabaseReportCountMinAggregateInputType = {
    id?: true
    reportId?: true
    count?: true
    value?: true
  }

  export type DatabaseReportCountMaxAggregateInputType = {
    id?: true
    reportId?: true
    count?: true
    value?: true
  }

  export type DatabaseReportCountCountAggregateInputType = {
    id?: true
    reportId?: true
    count?: true
    value?: true
    _all?: true
  }

  export type DatabaseReportCountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatabaseReportCount to aggregate.
     */
    where?: DatabaseReportCountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatabaseReportCounts to fetch.
     */
    orderBy?: DatabaseReportCountOrderByWithRelationInput | DatabaseReportCountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DatabaseReportCountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatabaseReportCounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatabaseReportCounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DatabaseReportCounts
    **/
    _count?: true | DatabaseReportCountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DatabaseReportCountAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DatabaseReportCountSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DatabaseReportCountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DatabaseReportCountMaxAggregateInputType
  }

  export type GetDatabaseReportCountAggregateType<T extends DatabaseReportCountAggregateArgs> = {
        [P in keyof T & keyof AggregateDatabaseReportCount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDatabaseReportCount[P]>
      : GetScalarType<T[P], AggregateDatabaseReportCount[P]>
  }




  export type DatabaseReportCountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DatabaseReportCountWhereInput
    orderBy?: DatabaseReportCountOrderByWithAggregationInput | DatabaseReportCountOrderByWithAggregationInput[]
    by: DatabaseReportCountScalarFieldEnum[] | DatabaseReportCountScalarFieldEnum
    having?: DatabaseReportCountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DatabaseReportCountCountAggregateInputType | true
    _avg?: DatabaseReportCountAvgAggregateInputType
    _sum?: DatabaseReportCountSumAggregateInputType
    _min?: DatabaseReportCountMinAggregateInputType
    _max?: DatabaseReportCountMaxAggregateInputType
  }

  export type DatabaseReportCountGroupByOutputType = {
    id: string
    reportId: string
    count: $Enums.Count
    value: number
    _count: DatabaseReportCountCountAggregateOutputType | null
    _avg: DatabaseReportCountAvgAggregateOutputType | null
    _sum: DatabaseReportCountSumAggregateOutputType | null
    _min: DatabaseReportCountMinAggregateOutputType | null
    _max: DatabaseReportCountMaxAggregateOutputType | null
  }

  type GetDatabaseReportCountGroupByPayload<T extends DatabaseReportCountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DatabaseReportCountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DatabaseReportCountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DatabaseReportCountGroupByOutputType[P]>
            : GetScalarType<T[P], DatabaseReportCountGroupByOutputType[P]>
        }
      >
    >


  export type DatabaseReportCountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reportId?: boolean
    count?: boolean
    value?: boolean
    report?: boolean | DatabaseReportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["databaseReportCount"]>

  export type DatabaseReportCountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reportId?: boolean
    count?: boolean
    value?: boolean
    report?: boolean | DatabaseReportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["databaseReportCount"]>

  export type DatabaseReportCountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    reportId?: boolean
    count?: boolean
    value?: boolean
    report?: boolean | DatabaseReportDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["databaseReportCount"]>

  export type DatabaseReportCountSelectScalar = {
    id?: boolean
    reportId?: boolean
    count?: boolean
    value?: boolean
  }

  export type DatabaseReportCountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "reportId" | "count" | "value", ExtArgs["result"]["databaseReportCount"]>
  export type DatabaseReportCountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | DatabaseReportDefaultArgs<ExtArgs>
  }
  export type DatabaseReportCountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | DatabaseReportDefaultArgs<ExtArgs>
  }
  export type DatabaseReportCountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    report?: boolean | DatabaseReportDefaultArgs<ExtArgs>
  }

  export type $DatabaseReportCountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DatabaseReportCount"
    objects: {
      report: Prisma.$DatabaseReportPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      reportId: string
      count: $Enums.Count
      value: number
    }, ExtArgs["result"]["databaseReportCount"]>
    composites: {}
  }

  type DatabaseReportCountGetPayload<S extends boolean | null | undefined | DatabaseReportCountDefaultArgs> = $Result.GetResult<Prisma.$DatabaseReportCountPayload, S>

  type DatabaseReportCountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DatabaseReportCountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DatabaseReportCountCountAggregateInputType | true
    }

  export interface DatabaseReportCountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DatabaseReportCount'], meta: { name: 'DatabaseReportCount' } }
    /**
     * Find zero or one DatabaseReportCount that matches the filter.
     * @param {DatabaseReportCountFindUniqueArgs} args - Arguments to find a DatabaseReportCount
     * @example
     * // Get one DatabaseReportCount
     * const databaseReportCount = await prisma.databaseReportCount.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DatabaseReportCountFindUniqueArgs>(args: SelectSubset<T, DatabaseReportCountFindUniqueArgs<ExtArgs>>): Prisma__DatabaseReportCountClient<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DatabaseReportCount that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DatabaseReportCountFindUniqueOrThrowArgs} args - Arguments to find a DatabaseReportCount
     * @example
     * // Get one DatabaseReportCount
     * const databaseReportCount = await prisma.databaseReportCount.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DatabaseReportCountFindUniqueOrThrowArgs>(args: SelectSubset<T, DatabaseReportCountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DatabaseReportCountClient<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatabaseReportCount that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportCountFindFirstArgs} args - Arguments to find a DatabaseReportCount
     * @example
     * // Get one DatabaseReportCount
     * const databaseReportCount = await prisma.databaseReportCount.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DatabaseReportCountFindFirstArgs>(args?: SelectSubset<T, DatabaseReportCountFindFirstArgs<ExtArgs>>): Prisma__DatabaseReportCountClient<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatabaseReportCount that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportCountFindFirstOrThrowArgs} args - Arguments to find a DatabaseReportCount
     * @example
     * // Get one DatabaseReportCount
     * const databaseReportCount = await prisma.databaseReportCount.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DatabaseReportCountFindFirstOrThrowArgs>(args?: SelectSubset<T, DatabaseReportCountFindFirstOrThrowArgs<ExtArgs>>): Prisma__DatabaseReportCountClient<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DatabaseReportCounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportCountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DatabaseReportCounts
     * const databaseReportCounts = await prisma.databaseReportCount.findMany()
     * 
     * // Get first 10 DatabaseReportCounts
     * const databaseReportCounts = await prisma.databaseReportCount.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const databaseReportCountWithIdOnly = await prisma.databaseReportCount.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DatabaseReportCountFindManyArgs>(args?: SelectSubset<T, DatabaseReportCountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DatabaseReportCount.
     * @param {DatabaseReportCountCreateArgs} args - Arguments to create a DatabaseReportCount.
     * @example
     * // Create one DatabaseReportCount
     * const DatabaseReportCount = await prisma.databaseReportCount.create({
     *   data: {
     *     // ... data to create a DatabaseReportCount
     *   }
     * })
     * 
     */
    create<T extends DatabaseReportCountCreateArgs>(args: SelectSubset<T, DatabaseReportCountCreateArgs<ExtArgs>>): Prisma__DatabaseReportCountClient<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DatabaseReportCounts.
     * @param {DatabaseReportCountCreateManyArgs} args - Arguments to create many DatabaseReportCounts.
     * @example
     * // Create many DatabaseReportCounts
     * const databaseReportCount = await prisma.databaseReportCount.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DatabaseReportCountCreateManyArgs>(args?: SelectSubset<T, DatabaseReportCountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DatabaseReportCounts and returns the data saved in the database.
     * @param {DatabaseReportCountCreateManyAndReturnArgs} args - Arguments to create many DatabaseReportCounts.
     * @example
     * // Create many DatabaseReportCounts
     * const databaseReportCount = await prisma.databaseReportCount.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DatabaseReportCounts and only return the `id`
     * const databaseReportCountWithIdOnly = await prisma.databaseReportCount.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DatabaseReportCountCreateManyAndReturnArgs>(args?: SelectSubset<T, DatabaseReportCountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DatabaseReportCount.
     * @param {DatabaseReportCountDeleteArgs} args - Arguments to delete one DatabaseReportCount.
     * @example
     * // Delete one DatabaseReportCount
     * const DatabaseReportCount = await prisma.databaseReportCount.delete({
     *   where: {
     *     // ... filter to delete one DatabaseReportCount
     *   }
     * })
     * 
     */
    delete<T extends DatabaseReportCountDeleteArgs>(args: SelectSubset<T, DatabaseReportCountDeleteArgs<ExtArgs>>): Prisma__DatabaseReportCountClient<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DatabaseReportCount.
     * @param {DatabaseReportCountUpdateArgs} args - Arguments to update one DatabaseReportCount.
     * @example
     * // Update one DatabaseReportCount
     * const databaseReportCount = await prisma.databaseReportCount.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DatabaseReportCountUpdateArgs>(args: SelectSubset<T, DatabaseReportCountUpdateArgs<ExtArgs>>): Prisma__DatabaseReportCountClient<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DatabaseReportCounts.
     * @param {DatabaseReportCountDeleteManyArgs} args - Arguments to filter DatabaseReportCounts to delete.
     * @example
     * // Delete a few DatabaseReportCounts
     * const { count } = await prisma.databaseReportCount.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DatabaseReportCountDeleteManyArgs>(args?: SelectSubset<T, DatabaseReportCountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatabaseReportCounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportCountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DatabaseReportCounts
     * const databaseReportCount = await prisma.databaseReportCount.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DatabaseReportCountUpdateManyArgs>(args: SelectSubset<T, DatabaseReportCountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatabaseReportCounts and returns the data updated in the database.
     * @param {DatabaseReportCountUpdateManyAndReturnArgs} args - Arguments to update many DatabaseReportCounts.
     * @example
     * // Update many DatabaseReportCounts
     * const databaseReportCount = await prisma.databaseReportCount.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DatabaseReportCounts and only return the `id`
     * const databaseReportCountWithIdOnly = await prisma.databaseReportCount.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DatabaseReportCountUpdateManyAndReturnArgs>(args: SelectSubset<T, DatabaseReportCountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DatabaseReportCount.
     * @param {DatabaseReportCountUpsertArgs} args - Arguments to update or create a DatabaseReportCount.
     * @example
     * // Update or create a DatabaseReportCount
     * const databaseReportCount = await prisma.databaseReportCount.upsert({
     *   create: {
     *     // ... data to create a DatabaseReportCount
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DatabaseReportCount we want to update
     *   }
     * })
     */
    upsert<T extends DatabaseReportCountUpsertArgs>(args: SelectSubset<T, DatabaseReportCountUpsertArgs<ExtArgs>>): Prisma__DatabaseReportCountClient<$Result.GetResult<Prisma.$DatabaseReportCountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DatabaseReportCounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportCountCountArgs} args - Arguments to filter DatabaseReportCounts to count.
     * @example
     * // Count the number of DatabaseReportCounts
     * const count = await prisma.databaseReportCount.count({
     *   where: {
     *     // ... the filter for the DatabaseReportCounts we want to count
     *   }
     * })
    **/
    count<T extends DatabaseReportCountCountArgs>(
      args?: Subset<T, DatabaseReportCountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DatabaseReportCountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DatabaseReportCount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportCountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DatabaseReportCountAggregateArgs>(args: Subset<T, DatabaseReportCountAggregateArgs>): Prisma.PrismaPromise<GetDatabaseReportCountAggregateType<T>>

    /**
     * Group by DatabaseReportCount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatabaseReportCountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DatabaseReportCountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DatabaseReportCountGroupByArgs['orderBy'] }
        : { orderBy?: DatabaseReportCountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DatabaseReportCountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDatabaseReportCountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DatabaseReportCount model
   */
  readonly fields: DatabaseReportCountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DatabaseReportCount.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DatabaseReportCountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    report<T extends DatabaseReportDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DatabaseReportDefaultArgs<ExtArgs>>): Prisma__DatabaseReportClient<$Result.GetResult<Prisma.$DatabaseReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DatabaseReportCount model
   */
  interface DatabaseReportCountFieldRefs {
    readonly id: FieldRef<"DatabaseReportCount", 'String'>
    readonly reportId: FieldRef<"DatabaseReportCount", 'String'>
    readonly count: FieldRef<"DatabaseReportCount", 'Count'>
    readonly value: FieldRef<"DatabaseReportCount", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * DatabaseReportCount findUnique
   */
  export type DatabaseReportCountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReportCount to fetch.
     */
    where: DatabaseReportCountWhereUniqueInput
  }

  /**
   * DatabaseReportCount findUniqueOrThrow
   */
  export type DatabaseReportCountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReportCount to fetch.
     */
    where: DatabaseReportCountWhereUniqueInput
  }

  /**
   * DatabaseReportCount findFirst
   */
  export type DatabaseReportCountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReportCount to fetch.
     */
    where?: DatabaseReportCountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatabaseReportCounts to fetch.
     */
    orderBy?: DatabaseReportCountOrderByWithRelationInput | DatabaseReportCountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatabaseReportCounts.
     */
    cursor?: DatabaseReportCountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatabaseReportCounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatabaseReportCounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatabaseReportCounts.
     */
    distinct?: DatabaseReportCountScalarFieldEnum | DatabaseReportCountScalarFieldEnum[]
  }

  /**
   * DatabaseReportCount findFirstOrThrow
   */
  export type DatabaseReportCountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReportCount to fetch.
     */
    where?: DatabaseReportCountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatabaseReportCounts to fetch.
     */
    orderBy?: DatabaseReportCountOrderByWithRelationInput | DatabaseReportCountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatabaseReportCounts.
     */
    cursor?: DatabaseReportCountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatabaseReportCounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatabaseReportCounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatabaseReportCounts.
     */
    distinct?: DatabaseReportCountScalarFieldEnum | DatabaseReportCountScalarFieldEnum[]
  }

  /**
   * DatabaseReportCount findMany
   */
  export type DatabaseReportCountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * Filter, which DatabaseReportCounts to fetch.
     */
    where?: DatabaseReportCountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatabaseReportCounts to fetch.
     */
    orderBy?: DatabaseReportCountOrderByWithRelationInput | DatabaseReportCountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DatabaseReportCounts.
     */
    cursor?: DatabaseReportCountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatabaseReportCounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatabaseReportCounts.
     */
    skip?: number
    distinct?: DatabaseReportCountScalarFieldEnum | DatabaseReportCountScalarFieldEnum[]
  }

  /**
   * DatabaseReportCount create
   */
  export type DatabaseReportCountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * The data needed to create a DatabaseReportCount.
     */
    data: XOR<DatabaseReportCountCreateInput, DatabaseReportCountUncheckedCreateInput>
  }

  /**
   * DatabaseReportCount createMany
   */
  export type DatabaseReportCountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DatabaseReportCounts.
     */
    data: DatabaseReportCountCreateManyInput | DatabaseReportCountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatabaseReportCount createManyAndReturn
   */
  export type DatabaseReportCountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * The data used to create many DatabaseReportCounts.
     */
    data: DatabaseReportCountCreateManyInput | DatabaseReportCountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DatabaseReportCount update
   */
  export type DatabaseReportCountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * The data needed to update a DatabaseReportCount.
     */
    data: XOR<DatabaseReportCountUpdateInput, DatabaseReportCountUncheckedUpdateInput>
    /**
     * Choose, which DatabaseReportCount to update.
     */
    where: DatabaseReportCountWhereUniqueInput
  }

  /**
   * DatabaseReportCount updateMany
   */
  export type DatabaseReportCountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DatabaseReportCounts.
     */
    data: XOR<DatabaseReportCountUpdateManyMutationInput, DatabaseReportCountUncheckedUpdateManyInput>
    /**
     * Filter which DatabaseReportCounts to update
     */
    where?: DatabaseReportCountWhereInput
    /**
     * Limit how many DatabaseReportCounts to update.
     */
    limit?: number
  }

  /**
   * DatabaseReportCount updateManyAndReturn
   */
  export type DatabaseReportCountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * The data used to update DatabaseReportCounts.
     */
    data: XOR<DatabaseReportCountUpdateManyMutationInput, DatabaseReportCountUncheckedUpdateManyInput>
    /**
     * Filter which DatabaseReportCounts to update
     */
    where?: DatabaseReportCountWhereInput
    /**
     * Limit how many DatabaseReportCounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DatabaseReportCount upsert
   */
  export type DatabaseReportCountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * The filter to search for the DatabaseReportCount to update in case it exists.
     */
    where: DatabaseReportCountWhereUniqueInput
    /**
     * In case the DatabaseReportCount found by the `where` argument doesn't exist, create a new DatabaseReportCount with this data.
     */
    create: XOR<DatabaseReportCountCreateInput, DatabaseReportCountUncheckedCreateInput>
    /**
     * In case the DatabaseReportCount was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DatabaseReportCountUpdateInput, DatabaseReportCountUncheckedUpdateInput>
  }

  /**
   * DatabaseReportCount delete
   */
  export type DatabaseReportCountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
    /**
     * Filter which DatabaseReportCount to delete.
     */
    where: DatabaseReportCountWhereUniqueInput
  }

  /**
   * DatabaseReportCount deleteMany
   */
  export type DatabaseReportCountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatabaseReportCounts to delete
     */
    where?: DatabaseReportCountWhereInput
    /**
     * Limit how many DatabaseReportCounts to delete.
     */
    limit?: number
  }

  /**
   * DatabaseReportCount without action
   */
  export type DatabaseReportCountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatabaseReportCount
     */
    select?: DatabaseReportCountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatabaseReportCount
     */
    omit?: DatabaseReportCountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DatabaseReportCountInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SocialMediaScalarFieldEnum: {
    id: 'id',
    provider: 'provider',
    userId: 'userId',
    username: 'username',
    displayName: 'displayName',
    profileUrl: 'profileUrl',
    email: 'email'
  };

  export type SocialMediaScalarFieldEnum = (typeof SocialMediaScalarFieldEnum)[keyof typeof SocialMediaScalarFieldEnum]


  export const SocialMediaMetricsScalarFieldEnum: {
    id: 'id',
    socialMediaId: 'socialMediaId',
    metricName: 'metricName',
    metricValue: 'metricValue',
    lastSynced: 'lastSynced'
  };

  export type SocialMediaMetricsScalarFieldEnum = (typeof SocialMediaMetricsScalarFieldEnum)[keyof typeof SocialMediaMetricsScalarFieldEnum]


  export const DatabaseReportScalarFieldEnum: {
    id: 'id',
    reportDate: 'reportDate'
  };

  export type DatabaseReportScalarFieldEnum = (typeof DatabaseReportScalarFieldEnum)[keyof typeof DatabaseReportScalarFieldEnum]


  export const DatabaseReportCountScalarFieldEnum: {
    id: 'id',
    reportId: 'reportId',
    count: 'count',
    value: 'value'
  };

  export type DatabaseReportCountScalarFieldEnum = (typeof DatabaseReportCountScalarFieldEnum)[keyof typeof DatabaseReportCountScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Provider'
   */
  export type EnumProviderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Provider'>
    


  /**
   * Reference to a field of type 'Provider[]'
   */
  export type ListEnumProviderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Provider[]'>
    


  /**
   * Reference to a field of type 'Metric'
   */
  export type EnumMetricFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Metric'>
    


  /**
   * Reference to a field of type 'Metric[]'
   */
  export type ListEnumMetricFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Metric[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Count'
   */
  export type EnumCountFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Count'>
    


  /**
   * Reference to a field of type 'Count[]'
   */
  export type ListEnumCountFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Count[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type SocialMediaWhereInput = {
    AND?: SocialMediaWhereInput | SocialMediaWhereInput[]
    OR?: SocialMediaWhereInput[]
    NOT?: SocialMediaWhereInput | SocialMediaWhereInput[]
    id?: StringFilter<"SocialMedia"> | string
    provider?: EnumProviderFilter<"SocialMedia"> | $Enums.Provider
    userId?: StringFilter<"SocialMedia"> | string
    username?: StringFilter<"SocialMedia"> | string
    displayName?: StringNullableFilter<"SocialMedia"> | string | null
    profileUrl?: StringNullableFilter<"SocialMedia"> | string | null
    email?: StringNullableFilter<"SocialMedia"> | string | null
    metrics?: SocialMediaMetricsListRelationFilter
  }

  export type SocialMediaOrderByWithRelationInput = {
    id?: SortOrder
    provider?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    displayName?: SortOrderInput | SortOrder
    profileUrl?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    metrics?: SocialMediaMetricsOrderByRelationAggregateInput
  }

  export type SocialMediaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SocialMediaWhereInput | SocialMediaWhereInput[]
    OR?: SocialMediaWhereInput[]
    NOT?: SocialMediaWhereInput | SocialMediaWhereInput[]
    provider?: EnumProviderFilter<"SocialMedia"> | $Enums.Provider
    userId?: StringFilter<"SocialMedia"> | string
    username?: StringFilter<"SocialMedia"> | string
    displayName?: StringNullableFilter<"SocialMedia"> | string | null
    profileUrl?: StringNullableFilter<"SocialMedia"> | string | null
    email?: StringNullableFilter<"SocialMedia"> | string | null
    metrics?: SocialMediaMetricsListRelationFilter
  }, "id">

  export type SocialMediaOrderByWithAggregationInput = {
    id?: SortOrder
    provider?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    displayName?: SortOrderInput | SortOrder
    profileUrl?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    _count?: SocialMediaCountOrderByAggregateInput
    _max?: SocialMediaMaxOrderByAggregateInput
    _min?: SocialMediaMinOrderByAggregateInput
  }

  export type SocialMediaScalarWhereWithAggregatesInput = {
    AND?: SocialMediaScalarWhereWithAggregatesInput | SocialMediaScalarWhereWithAggregatesInput[]
    OR?: SocialMediaScalarWhereWithAggregatesInput[]
    NOT?: SocialMediaScalarWhereWithAggregatesInput | SocialMediaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SocialMedia"> | string
    provider?: EnumProviderWithAggregatesFilter<"SocialMedia"> | $Enums.Provider
    userId?: StringWithAggregatesFilter<"SocialMedia"> | string
    username?: StringWithAggregatesFilter<"SocialMedia"> | string
    displayName?: StringNullableWithAggregatesFilter<"SocialMedia"> | string | null
    profileUrl?: StringNullableWithAggregatesFilter<"SocialMedia"> | string | null
    email?: StringNullableWithAggregatesFilter<"SocialMedia"> | string | null
  }

  export type SocialMediaMetricsWhereInput = {
    AND?: SocialMediaMetricsWhereInput | SocialMediaMetricsWhereInput[]
    OR?: SocialMediaMetricsWhereInput[]
    NOT?: SocialMediaMetricsWhereInput | SocialMediaMetricsWhereInput[]
    id?: StringFilter<"SocialMediaMetrics"> | string
    socialMediaId?: StringFilter<"SocialMediaMetrics"> | string
    metricName?: EnumMetricFilter<"SocialMediaMetrics"> | $Enums.Metric
    metricValue?: IntFilter<"SocialMediaMetrics"> | number
    lastSynced?: DateTimeNullableFilter<"SocialMediaMetrics"> | Date | string | null
    socialMedia?: XOR<SocialMediaScalarRelationFilter, SocialMediaWhereInput>
  }

  export type SocialMediaMetricsOrderByWithRelationInput = {
    id?: SortOrder
    socialMediaId?: SortOrder
    metricName?: SortOrder
    metricValue?: SortOrder
    lastSynced?: SortOrderInput | SortOrder
    socialMedia?: SocialMediaOrderByWithRelationInput
  }

  export type SocialMediaMetricsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SocialMediaMetricsWhereInput | SocialMediaMetricsWhereInput[]
    OR?: SocialMediaMetricsWhereInput[]
    NOT?: SocialMediaMetricsWhereInput | SocialMediaMetricsWhereInput[]
    socialMediaId?: StringFilter<"SocialMediaMetrics"> | string
    metricName?: EnumMetricFilter<"SocialMediaMetrics"> | $Enums.Metric
    metricValue?: IntFilter<"SocialMediaMetrics"> | number
    lastSynced?: DateTimeNullableFilter<"SocialMediaMetrics"> | Date | string | null
    socialMedia?: XOR<SocialMediaScalarRelationFilter, SocialMediaWhereInput>
  }, "id">

  export type SocialMediaMetricsOrderByWithAggregationInput = {
    id?: SortOrder
    socialMediaId?: SortOrder
    metricName?: SortOrder
    metricValue?: SortOrder
    lastSynced?: SortOrderInput | SortOrder
    _count?: SocialMediaMetricsCountOrderByAggregateInput
    _avg?: SocialMediaMetricsAvgOrderByAggregateInput
    _max?: SocialMediaMetricsMaxOrderByAggregateInput
    _min?: SocialMediaMetricsMinOrderByAggregateInput
    _sum?: SocialMediaMetricsSumOrderByAggregateInput
  }

  export type SocialMediaMetricsScalarWhereWithAggregatesInput = {
    AND?: SocialMediaMetricsScalarWhereWithAggregatesInput | SocialMediaMetricsScalarWhereWithAggregatesInput[]
    OR?: SocialMediaMetricsScalarWhereWithAggregatesInput[]
    NOT?: SocialMediaMetricsScalarWhereWithAggregatesInput | SocialMediaMetricsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SocialMediaMetrics"> | string
    socialMediaId?: StringWithAggregatesFilter<"SocialMediaMetrics"> | string
    metricName?: EnumMetricWithAggregatesFilter<"SocialMediaMetrics"> | $Enums.Metric
    metricValue?: IntWithAggregatesFilter<"SocialMediaMetrics"> | number
    lastSynced?: DateTimeNullableWithAggregatesFilter<"SocialMediaMetrics"> | Date | string | null
  }

  export type DatabaseReportWhereInput = {
    AND?: DatabaseReportWhereInput | DatabaseReportWhereInput[]
    OR?: DatabaseReportWhereInput[]
    NOT?: DatabaseReportWhereInput | DatabaseReportWhereInput[]
    id?: StringFilter<"DatabaseReport"> | string
    reportDate?: DateTimeFilter<"DatabaseReport"> | Date | string
    counts?: DatabaseReportCountListRelationFilter
  }

  export type DatabaseReportOrderByWithRelationInput = {
    id?: SortOrder
    reportDate?: SortOrder
    counts?: DatabaseReportCountOrderByRelationAggregateInput
  }

  export type DatabaseReportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DatabaseReportWhereInput | DatabaseReportWhereInput[]
    OR?: DatabaseReportWhereInput[]
    NOT?: DatabaseReportWhereInput | DatabaseReportWhereInput[]
    reportDate?: DateTimeFilter<"DatabaseReport"> | Date | string
    counts?: DatabaseReportCountListRelationFilter
  }, "id">

  export type DatabaseReportOrderByWithAggregationInput = {
    id?: SortOrder
    reportDate?: SortOrder
    _count?: DatabaseReportCountOrderByAggregateInput
    _max?: DatabaseReportMaxOrderByAggregateInput
    _min?: DatabaseReportMinOrderByAggregateInput
  }

  export type DatabaseReportScalarWhereWithAggregatesInput = {
    AND?: DatabaseReportScalarWhereWithAggregatesInput | DatabaseReportScalarWhereWithAggregatesInput[]
    OR?: DatabaseReportScalarWhereWithAggregatesInput[]
    NOT?: DatabaseReportScalarWhereWithAggregatesInput | DatabaseReportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DatabaseReport"> | string
    reportDate?: DateTimeWithAggregatesFilter<"DatabaseReport"> | Date | string
  }

  export type DatabaseReportCountWhereInput = {
    AND?: DatabaseReportCountWhereInput | DatabaseReportCountWhereInput[]
    OR?: DatabaseReportCountWhereInput[]
    NOT?: DatabaseReportCountWhereInput | DatabaseReportCountWhereInput[]
    id?: StringFilter<"DatabaseReportCount"> | string
    reportId?: StringFilter<"DatabaseReportCount"> | string
    count?: EnumCountFilter<"DatabaseReportCount"> | $Enums.Count
    value?: IntFilter<"DatabaseReportCount"> | number
    report?: XOR<DatabaseReportScalarRelationFilter, DatabaseReportWhereInput>
  }

  export type DatabaseReportCountOrderByWithRelationInput = {
    id?: SortOrder
    reportId?: SortOrder
    count?: SortOrder
    value?: SortOrder
    report?: DatabaseReportOrderByWithRelationInput
  }

  export type DatabaseReportCountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    reportId_count?: DatabaseReportCountReportIdCountCompoundUniqueInput
    AND?: DatabaseReportCountWhereInput | DatabaseReportCountWhereInput[]
    OR?: DatabaseReportCountWhereInput[]
    NOT?: DatabaseReportCountWhereInput | DatabaseReportCountWhereInput[]
    reportId?: StringFilter<"DatabaseReportCount"> | string
    count?: EnumCountFilter<"DatabaseReportCount"> | $Enums.Count
    value?: IntFilter<"DatabaseReportCount"> | number
    report?: XOR<DatabaseReportScalarRelationFilter, DatabaseReportWhereInput>
  }, "id" | "reportId_count">

  export type DatabaseReportCountOrderByWithAggregationInput = {
    id?: SortOrder
    reportId?: SortOrder
    count?: SortOrder
    value?: SortOrder
    _count?: DatabaseReportCountCountOrderByAggregateInput
    _avg?: DatabaseReportCountAvgOrderByAggregateInput
    _max?: DatabaseReportCountMaxOrderByAggregateInput
    _min?: DatabaseReportCountMinOrderByAggregateInput
    _sum?: DatabaseReportCountSumOrderByAggregateInput
  }

  export type DatabaseReportCountScalarWhereWithAggregatesInput = {
    AND?: DatabaseReportCountScalarWhereWithAggregatesInput | DatabaseReportCountScalarWhereWithAggregatesInput[]
    OR?: DatabaseReportCountScalarWhereWithAggregatesInput[]
    NOT?: DatabaseReportCountScalarWhereWithAggregatesInput | DatabaseReportCountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DatabaseReportCount"> | string
    reportId?: StringWithAggregatesFilter<"DatabaseReportCount"> | string
    count?: EnumCountWithAggregatesFilter<"DatabaseReportCount"> | $Enums.Count
    value?: IntWithAggregatesFilter<"DatabaseReportCount"> | number
  }

  export type SocialMediaCreateInput = {
    id?: string
    provider: $Enums.Provider
    userId: string
    username: string
    displayName?: string | null
    profileUrl?: string | null
    email?: string | null
    metrics?: SocialMediaMetricsCreateNestedManyWithoutSocialMediaInput
  }

  export type SocialMediaUncheckedCreateInput = {
    id?: string
    provider: $Enums.Provider
    userId: string
    username: string
    displayName?: string | null
    profileUrl?: string | null
    email?: string | null
    metrics?: SocialMediaMetricsUncheckedCreateNestedManyWithoutSocialMediaInput
  }

  export type SocialMediaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: EnumProviderFieldUpdateOperationsInput | $Enums.Provider
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    profileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    metrics?: SocialMediaMetricsUpdateManyWithoutSocialMediaNestedInput
  }

  export type SocialMediaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: EnumProviderFieldUpdateOperationsInput | $Enums.Provider
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    profileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    metrics?: SocialMediaMetricsUncheckedUpdateManyWithoutSocialMediaNestedInput
  }

  export type SocialMediaCreateManyInput = {
    id?: string
    provider: $Enums.Provider
    userId: string
    username: string
    displayName?: string | null
    profileUrl?: string | null
    email?: string | null
  }

  export type SocialMediaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: EnumProviderFieldUpdateOperationsInput | $Enums.Provider
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    profileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SocialMediaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: EnumProviderFieldUpdateOperationsInput | $Enums.Provider
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    profileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SocialMediaMetricsCreateInput = {
    id?: string
    metricName: $Enums.Metric
    metricValue: number
    lastSynced?: Date | string | null
    socialMedia: SocialMediaCreateNestedOneWithoutMetricsInput
  }

  export type SocialMediaMetricsUncheckedCreateInput = {
    id?: string
    socialMediaId: string
    metricName: $Enums.Metric
    metricValue: number
    lastSynced?: Date | string | null
  }

  export type SocialMediaMetricsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricName?: EnumMetricFieldUpdateOperationsInput | $Enums.Metric
    metricValue?: IntFieldUpdateOperationsInput | number
    lastSynced?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    socialMedia?: SocialMediaUpdateOneRequiredWithoutMetricsNestedInput
  }

  export type SocialMediaMetricsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    socialMediaId?: StringFieldUpdateOperationsInput | string
    metricName?: EnumMetricFieldUpdateOperationsInput | $Enums.Metric
    metricValue?: IntFieldUpdateOperationsInput | number
    lastSynced?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SocialMediaMetricsCreateManyInput = {
    id?: string
    socialMediaId: string
    metricName: $Enums.Metric
    metricValue: number
    lastSynced?: Date | string | null
  }

  export type SocialMediaMetricsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricName?: EnumMetricFieldUpdateOperationsInput | $Enums.Metric
    metricValue?: IntFieldUpdateOperationsInput | number
    lastSynced?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SocialMediaMetricsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    socialMediaId?: StringFieldUpdateOperationsInput | string
    metricName?: EnumMetricFieldUpdateOperationsInput | $Enums.Metric
    metricValue?: IntFieldUpdateOperationsInput | number
    lastSynced?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DatabaseReportCreateInput = {
    id?: string
    reportDate: Date | string
    counts?: DatabaseReportCountCreateNestedManyWithoutReportInput
  }

  export type DatabaseReportUncheckedCreateInput = {
    id?: string
    reportDate: Date | string
    counts?: DatabaseReportCountUncheckedCreateNestedManyWithoutReportInput
  }

  export type DatabaseReportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
    counts?: DatabaseReportCountUpdateManyWithoutReportNestedInput
  }

  export type DatabaseReportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
    counts?: DatabaseReportCountUncheckedUpdateManyWithoutReportNestedInput
  }

  export type DatabaseReportCreateManyInput = {
    id?: string
    reportDate: Date | string
  }

  export type DatabaseReportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatabaseReportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatabaseReportCountCreateInput = {
    id?: string
    count: $Enums.Count
    value?: number
    report: DatabaseReportCreateNestedOneWithoutCountsInput
  }

  export type DatabaseReportCountUncheckedCreateInput = {
    id?: string
    reportId: string
    count: $Enums.Count
    value?: number
  }

  export type DatabaseReportCountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    count?: EnumCountFieldUpdateOperationsInput | $Enums.Count
    value?: IntFieldUpdateOperationsInput | number
    report?: DatabaseReportUpdateOneRequiredWithoutCountsNestedInput
  }

  export type DatabaseReportCountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportId?: StringFieldUpdateOperationsInput | string
    count?: EnumCountFieldUpdateOperationsInput | $Enums.Count
    value?: IntFieldUpdateOperationsInput | number
  }

  export type DatabaseReportCountCreateManyInput = {
    id?: string
    reportId: string
    count: $Enums.Count
    value?: number
  }

  export type DatabaseReportCountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    count?: EnumCountFieldUpdateOperationsInput | $Enums.Count
    value?: IntFieldUpdateOperationsInput | number
  }

  export type DatabaseReportCountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportId?: StringFieldUpdateOperationsInput | string
    count?: EnumCountFieldUpdateOperationsInput | $Enums.Count
    value?: IntFieldUpdateOperationsInput | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumProviderFilter<$PrismaModel = never> = {
    equals?: $Enums.Provider | EnumProviderFieldRefInput<$PrismaModel>
    in?: $Enums.Provider[] | ListEnumProviderFieldRefInput<$PrismaModel>
    notIn?: $Enums.Provider[] | ListEnumProviderFieldRefInput<$PrismaModel>
    not?: NestedEnumProviderFilter<$PrismaModel> | $Enums.Provider
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SocialMediaMetricsListRelationFilter = {
    every?: SocialMediaMetricsWhereInput
    some?: SocialMediaMetricsWhereInput
    none?: SocialMediaMetricsWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SocialMediaMetricsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SocialMediaCountOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    profileUrl?: SortOrder
    email?: SortOrder
  }

  export type SocialMediaMaxOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    profileUrl?: SortOrder
    email?: SortOrder
  }

  export type SocialMediaMinOrderByAggregateInput = {
    id?: SortOrder
    provider?: SortOrder
    userId?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    profileUrl?: SortOrder
    email?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumProviderWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Provider | EnumProviderFieldRefInput<$PrismaModel>
    in?: $Enums.Provider[] | ListEnumProviderFieldRefInput<$PrismaModel>
    notIn?: $Enums.Provider[] | ListEnumProviderFieldRefInput<$PrismaModel>
    not?: NestedEnumProviderWithAggregatesFilter<$PrismaModel> | $Enums.Provider
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProviderFilter<$PrismaModel>
    _max?: NestedEnumProviderFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumMetricFilter<$PrismaModel = never> = {
    equals?: $Enums.Metric | EnumMetricFieldRefInput<$PrismaModel>
    in?: $Enums.Metric[] | ListEnumMetricFieldRefInput<$PrismaModel>
    notIn?: $Enums.Metric[] | ListEnumMetricFieldRefInput<$PrismaModel>
    not?: NestedEnumMetricFilter<$PrismaModel> | $Enums.Metric
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SocialMediaScalarRelationFilter = {
    is?: SocialMediaWhereInput
    isNot?: SocialMediaWhereInput
  }

  export type SocialMediaMetricsCountOrderByAggregateInput = {
    id?: SortOrder
    socialMediaId?: SortOrder
    metricName?: SortOrder
    metricValue?: SortOrder
    lastSynced?: SortOrder
  }

  export type SocialMediaMetricsAvgOrderByAggregateInput = {
    metricValue?: SortOrder
  }

  export type SocialMediaMetricsMaxOrderByAggregateInput = {
    id?: SortOrder
    socialMediaId?: SortOrder
    metricName?: SortOrder
    metricValue?: SortOrder
    lastSynced?: SortOrder
  }

  export type SocialMediaMetricsMinOrderByAggregateInput = {
    id?: SortOrder
    socialMediaId?: SortOrder
    metricName?: SortOrder
    metricValue?: SortOrder
    lastSynced?: SortOrder
  }

  export type SocialMediaMetricsSumOrderByAggregateInput = {
    metricValue?: SortOrder
  }

  export type EnumMetricWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Metric | EnumMetricFieldRefInput<$PrismaModel>
    in?: $Enums.Metric[] | ListEnumMetricFieldRefInput<$PrismaModel>
    notIn?: $Enums.Metric[] | ListEnumMetricFieldRefInput<$PrismaModel>
    not?: NestedEnumMetricWithAggregatesFilter<$PrismaModel> | $Enums.Metric
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMetricFilter<$PrismaModel>
    _max?: NestedEnumMetricFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DatabaseReportCountListRelationFilter = {
    every?: DatabaseReportCountWhereInput
    some?: DatabaseReportCountWhereInput
    none?: DatabaseReportCountWhereInput
  }

  export type DatabaseReportCountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DatabaseReportCountOrderByAggregateInput = {
    id?: SortOrder
    reportDate?: SortOrder
  }

  export type DatabaseReportMaxOrderByAggregateInput = {
    id?: SortOrder
    reportDate?: SortOrder
  }

  export type DatabaseReportMinOrderByAggregateInput = {
    id?: SortOrder
    reportDate?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumCountFilter<$PrismaModel = never> = {
    equals?: $Enums.Count | EnumCountFieldRefInput<$PrismaModel>
    in?: $Enums.Count[] | ListEnumCountFieldRefInput<$PrismaModel>
    notIn?: $Enums.Count[] | ListEnumCountFieldRefInput<$PrismaModel>
    not?: NestedEnumCountFilter<$PrismaModel> | $Enums.Count
  }

  export type DatabaseReportScalarRelationFilter = {
    is?: DatabaseReportWhereInput
    isNot?: DatabaseReportWhereInput
  }

  export type DatabaseReportCountReportIdCountCompoundUniqueInput = {
    reportId: string
    count: $Enums.Count
  }

  export type DatabaseReportCountCountOrderByAggregateInput = {
    id?: SortOrder
    reportId?: SortOrder
    count?: SortOrder
    value?: SortOrder
  }

  export type DatabaseReportCountAvgOrderByAggregateInput = {
    value?: SortOrder
  }

  export type DatabaseReportCountMaxOrderByAggregateInput = {
    id?: SortOrder
    reportId?: SortOrder
    count?: SortOrder
    value?: SortOrder
  }

  export type DatabaseReportCountMinOrderByAggregateInput = {
    id?: SortOrder
    reportId?: SortOrder
    count?: SortOrder
    value?: SortOrder
  }

  export type DatabaseReportCountSumOrderByAggregateInput = {
    value?: SortOrder
  }

  export type EnumCountWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Count | EnumCountFieldRefInput<$PrismaModel>
    in?: $Enums.Count[] | ListEnumCountFieldRefInput<$PrismaModel>
    notIn?: $Enums.Count[] | ListEnumCountFieldRefInput<$PrismaModel>
    not?: NestedEnumCountWithAggregatesFilter<$PrismaModel> | $Enums.Count
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCountFilter<$PrismaModel>
    _max?: NestedEnumCountFilter<$PrismaModel>
  }

  export type SocialMediaMetricsCreateNestedManyWithoutSocialMediaInput = {
    create?: XOR<SocialMediaMetricsCreateWithoutSocialMediaInput, SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput> | SocialMediaMetricsCreateWithoutSocialMediaInput[] | SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput[]
    connectOrCreate?: SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput | SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput[]
    createMany?: SocialMediaMetricsCreateManySocialMediaInputEnvelope
    connect?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
  }

  export type SocialMediaMetricsUncheckedCreateNestedManyWithoutSocialMediaInput = {
    create?: XOR<SocialMediaMetricsCreateWithoutSocialMediaInput, SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput> | SocialMediaMetricsCreateWithoutSocialMediaInput[] | SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput[]
    connectOrCreate?: SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput | SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput[]
    createMany?: SocialMediaMetricsCreateManySocialMediaInputEnvelope
    connect?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumProviderFieldUpdateOperationsInput = {
    set?: $Enums.Provider
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type SocialMediaMetricsUpdateManyWithoutSocialMediaNestedInput = {
    create?: XOR<SocialMediaMetricsCreateWithoutSocialMediaInput, SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput> | SocialMediaMetricsCreateWithoutSocialMediaInput[] | SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput[]
    connectOrCreate?: SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput | SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput[]
    upsert?: SocialMediaMetricsUpsertWithWhereUniqueWithoutSocialMediaInput | SocialMediaMetricsUpsertWithWhereUniqueWithoutSocialMediaInput[]
    createMany?: SocialMediaMetricsCreateManySocialMediaInputEnvelope
    set?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
    disconnect?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
    delete?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
    connect?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
    update?: SocialMediaMetricsUpdateWithWhereUniqueWithoutSocialMediaInput | SocialMediaMetricsUpdateWithWhereUniqueWithoutSocialMediaInput[]
    updateMany?: SocialMediaMetricsUpdateManyWithWhereWithoutSocialMediaInput | SocialMediaMetricsUpdateManyWithWhereWithoutSocialMediaInput[]
    deleteMany?: SocialMediaMetricsScalarWhereInput | SocialMediaMetricsScalarWhereInput[]
  }

  export type SocialMediaMetricsUncheckedUpdateManyWithoutSocialMediaNestedInput = {
    create?: XOR<SocialMediaMetricsCreateWithoutSocialMediaInput, SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput> | SocialMediaMetricsCreateWithoutSocialMediaInput[] | SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput[]
    connectOrCreate?: SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput | SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput[]
    upsert?: SocialMediaMetricsUpsertWithWhereUniqueWithoutSocialMediaInput | SocialMediaMetricsUpsertWithWhereUniqueWithoutSocialMediaInput[]
    createMany?: SocialMediaMetricsCreateManySocialMediaInputEnvelope
    set?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
    disconnect?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
    delete?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
    connect?: SocialMediaMetricsWhereUniqueInput | SocialMediaMetricsWhereUniqueInput[]
    update?: SocialMediaMetricsUpdateWithWhereUniqueWithoutSocialMediaInput | SocialMediaMetricsUpdateWithWhereUniqueWithoutSocialMediaInput[]
    updateMany?: SocialMediaMetricsUpdateManyWithWhereWithoutSocialMediaInput | SocialMediaMetricsUpdateManyWithWhereWithoutSocialMediaInput[]
    deleteMany?: SocialMediaMetricsScalarWhereInput | SocialMediaMetricsScalarWhereInput[]
  }

  export type SocialMediaCreateNestedOneWithoutMetricsInput = {
    create?: XOR<SocialMediaCreateWithoutMetricsInput, SocialMediaUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: SocialMediaCreateOrConnectWithoutMetricsInput
    connect?: SocialMediaWhereUniqueInput
  }

  export type EnumMetricFieldUpdateOperationsInput = {
    set?: $Enums.Metric
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type SocialMediaUpdateOneRequiredWithoutMetricsNestedInput = {
    create?: XOR<SocialMediaCreateWithoutMetricsInput, SocialMediaUncheckedCreateWithoutMetricsInput>
    connectOrCreate?: SocialMediaCreateOrConnectWithoutMetricsInput
    upsert?: SocialMediaUpsertWithoutMetricsInput
    connect?: SocialMediaWhereUniqueInput
    update?: XOR<XOR<SocialMediaUpdateToOneWithWhereWithoutMetricsInput, SocialMediaUpdateWithoutMetricsInput>, SocialMediaUncheckedUpdateWithoutMetricsInput>
  }

  export type DatabaseReportCountCreateNestedManyWithoutReportInput = {
    create?: XOR<DatabaseReportCountCreateWithoutReportInput, DatabaseReportCountUncheckedCreateWithoutReportInput> | DatabaseReportCountCreateWithoutReportInput[] | DatabaseReportCountUncheckedCreateWithoutReportInput[]
    connectOrCreate?: DatabaseReportCountCreateOrConnectWithoutReportInput | DatabaseReportCountCreateOrConnectWithoutReportInput[]
    createMany?: DatabaseReportCountCreateManyReportInputEnvelope
    connect?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
  }

  export type DatabaseReportCountUncheckedCreateNestedManyWithoutReportInput = {
    create?: XOR<DatabaseReportCountCreateWithoutReportInput, DatabaseReportCountUncheckedCreateWithoutReportInput> | DatabaseReportCountCreateWithoutReportInput[] | DatabaseReportCountUncheckedCreateWithoutReportInput[]
    connectOrCreate?: DatabaseReportCountCreateOrConnectWithoutReportInput | DatabaseReportCountCreateOrConnectWithoutReportInput[]
    createMany?: DatabaseReportCountCreateManyReportInputEnvelope
    connect?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type DatabaseReportCountUpdateManyWithoutReportNestedInput = {
    create?: XOR<DatabaseReportCountCreateWithoutReportInput, DatabaseReportCountUncheckedCreateWithoutReportInput> | DatabaseReportCountCreateWithoutReportInput[] | DatabaseReportCountUncheckedCreateWithoutReportInput[]
    connectOrCreate?: DatabaseReportCountCreateOrConnectWithoutReportInput | DatabaseReportCountCreateOrConnectWithoutReportInput[]
    upsert?: DatabaseReportCountUpsertWithWhereUniqueWithoutReportInput | DatabaseReportCountUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: DatabaseReportCountCreateManyReportInputEnvelope
    set?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
    disconnect?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
    delete?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
    connect?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
    update?: DatabaseReportCountUpdateWithWhereUniqueWithoutReportInput | DatabaseReportCountUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: DatabaseReportCountUpdateManyWithWhereWithoutReportInput | DatabaseReportCountUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: DatabaseReportCountScalarWhereInput | DatabaseReportCountScalarWhereInput[]
  }

  export type DatabaseReportCountUncheckedUpdateManyWithoutReportNestedInput = {
    create?: XOR<DatabaseReportCountCreateWithoutReportInput, DatabaseReportCountUncheckedCreateWithoutReportInput> | DatabaseReportCountCreateWithoutReportInput[] | DatabaseReportCountUncheckedCreateWithoutReportInput[]
    connectOrCreate?: DatabaseReportCountCreateOrConnectWithoutReportInput | DatabaseReportCountCreateOrConnectWithoutReportInput[]
    upsert?: DatabaseReportCountUpsertWithWhereUniqueWithoutReportInput | DatabaseReportCountUpsertWithWhereUniqueWithoutReportInput[]
    createMany?: DatabaseReportCountCreateManyReportInputEnvelope
    set?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
    disconnect?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
    delete?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
    connect?: DatabaseReportCountWhereUniqueInput | DatabaseReportCountWhereUniqueInput[]
    update?: DatabaseReportCountUpdateWithWhereUniqueWithoutReportInput | DatabaseReportCountUpdateWithWhereUniqueWithoutReportInput[]
    updateMany?: DatabaseReportCountUpdateManyWithWhereWithoutReportInput | DatabaseReportCountUpdateManyWithWhereWithoutReportInput[]
    deleteMany?: DatabaseReportCountScalarWhereInput | DatabaseReportCountScalarWhereInput[]
  }

  export type DatabaseReportCreateNestedOneWithoutCountsInput = {
    create?: XOR<DatabaseReportCreateWithoutCountsInput, DatabaseReportUncheckedCreateWithoutCountsInput>
    connectOrCreate?: DatabaseReportCreateOrConnectWithoutCountsInput
    connect?: DatabaseReportWhereUniqueInput
  }

  export type EnumCountFieldUpdateOperationsInput = {
    set?: $Enums.Count
  }

  export type DatabaseReportUpdateOneRequiredWithoutCountsNestedInput = {
    create?: XOR<DatabaseReportCreateWithoutCountsInput, DatabaseReportUncheckedCreateWithoutCountsInput>
    connectOrCreate?: DatabaseReportCreateOrConnectWithoutCountsInput
    upsert?: DatabaseReportUpsertWithoutCountsInput
    connect?: DatabaseReportWhereUniqueInput
    update?: XOR<XOR<DatabaseReportUpdateToOneWithWhereWithoutCountsInput, DatabaseReportUpdateWithoutCountsInput>, DatabaseReportUncheckedUpdateWithoutCountsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumProviderFilter<$PrismaModel = never> = {
    equals?: $Enums.Provider | EnumProviderFieldRefInput<$PrismaModel>
    in?: $Enums.Provider[] | ListEnumProviderFieldRefInput<$PrismaModel>
    notIn?: $Enums.Provider[] | ListEnumProviderFieldRefInput<$PrismaModel>
    not?: NestedEnumProviderFilter<$PrismaModel> | $Enums.Provider
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumProviderWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Provider | EnumProviderFieldRefInput<$PrismaModel>
    in?: $Enums.Provider[] | ListEnumProviderFieldRefInput<$PrismaModel>
    notIn?: $Enums.Provider[] | ListEnumProviderFieldRefInput<$PrismaModel>
    not?: NestedEnumProviderWithAggregatesFilter<$PrismaModel> | $Enums.Provider
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProviderFilter<$PrismaModel>
    _max?: NestedEnumProviderFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumMetricFilter<$PrismaModel = never> = {
    equals?: $Enums.Metric | EnumMetricFieldRefInput<$PrismaModel>
    in?: $Enums.Metric[] | ListEnumMetricFieldRefInput<$PrismaModel>
    notIn?: $Enums.Metric[] | ListEnumMetricFieldRefInput<$PrismaModel>
    not?: NestedEnumMetricFilter<$PrismaModel> | $Enums.Metric
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumMetricWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Metric | EnumMetricFieldRefInput<$PrismaModel>
    in?: $Enums.Metric[] | ListEnumMetricFieldRefInput<$PrismaModel>
    notIn?: $Enums.Metric[] | ListEnumMetricFieldRefInput<$PrismaModel>
    not?: NestedEnumMetricWithAggregatesFilter<$PrismaModel> | $Enums.Metric
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMetricFilter<$PrismaModel>
    _max?: NestedEnumMetricFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumCountFilter<$PrismaModel = never> = {
    equals?: $Enums.Count | EnumCountFieldRefInput<$PrismaModel>
    in?: $Enums.Count[] | ListEnumCountFieldRefInput<$PrismaModel>
    notIn?: $Enums.Count[] | ListEnumCountFieldRefInput<$PrismaModel>
    not?: NestedEnumCountFilter<$PrismaModel> | $Enums.Count
  }

  export type NestedEnumCountWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Count | EnumCountFieldRefInput<$PrismaModel>
    in?: $Enums.Count[] | ListEnumCountFieldRefInput<$PrismaModel>
    notIn?: $Enums.Count[] | ListEnumCountFieldRefInput<$PrismaModel>
    not?: NestedEnumCountWithAggregatesFilter<$PrismaModel> | $Enums.Count
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCountFilter<$PrismaModel>
    _max?: NestedEnumCountFilter<$PrismaModel>
  }

  export type SocialMediaMetricsCreateWithoutSocialMediaInput = {
    id?: string
    metricName: $Enums.Metric
    metricValue: number
    lastSynced?: Date | string | null
  }

  export type SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput = {
    id?: string
    metricName: $Enums.Metric
    metricValue: number
    lastSynced?: Date | string | null
  }

  export type SocialMediaMetricsCreateOrConnectWithoutSocialMediaInput = {
    where: SocialMediaMetricsWhereUniqueInput
    create: XOR<SocialMediaMetricsCreateWithoutSocialMediaInput, SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput>
  }

  export type SocialMediaMetricsCreateManySocialMediaInputEnvelope = {
    data: SocialMediaMetricsCreateManySocialMediaInput | SocialMediaMetricsCreateManySocialMediaInput[]
    skipDuplicates?: boolean
  }

  export type SocialMediaMetricsUpsertWithWhereUniqueWithoutSocialMediaInput = {
    where: SocialMediaMetricsWhereUniqueInput
    update: XOR<SocialMediaMetricsUpdateWithoutSocialMediaInput, SocialMediaMetricsUncheckedUpdateWithoutSocialMediaInput>
    create: XOR<SocialMediaMetricsCreateWithoutSocialMediaInput, SocialMediaMetricsUncheckedCreateWithoutSocialMediaInput>
  }

  export type SocialMediaMetricsUpdateWithWhereUniqueWithoutSocialMediaInput = {
    where: SocialMediaMetricsWhereUniqueInput
    data: XOR<SocialMediaMetricsUpdateWithoutSocialMediaInput, SocialMediaMetricsUncheckedUpdateWithoutSocialMediaInput>
  }

  export type SocialMediaMetricsUpdateManyWithWhereWithoutSocialMediaInput = {
    where: SocialMediaMetricsScalarWhereInput
    data: XOR<SocialMediaMetricsUpdateManyMutationInput, SocialMediaMetricsUncheckedUpdateManyWithoutSocialMediaInput>
  }

  export type SocialMediaMetricsScalarWhereInput = {
    AND?: SocialMediaMetricsScalarWhereInput | SocialMediaMetricsScalarWhereInput[]
    OR?: SocialMediaMetricsScalarWhereInput[]
    NOT?: SocialMediaMetricsScalarWhereInput | SocialMediaMetricsScalarWhereInput[]
    id?: StringFilter<"SocialMediaMetrics"> | string
    socialMediaId?: StringFilter<"SocialMediaMetrics"> | string
    metricName?: EnumMetricFilter<"SocialMediaMetrics"> | $Enums.Metric
    metricValue?: IntFilter<"SocialMediaMetrics"> | number
    lastSynced?: DateTimeNullableFilter<"SocialMediaMetrics"> | Date | string | null
  }

  export type SocialMediaCreateWithoutMetricsInput = {
    id?: string
    provider: $Enums.Provider
    userId: string
    username: string
    displayName?: string | null
    profileUrl?: string | null
    email?: string | null
  }

  export type SocialMediaUncheckedCreateWithoutMetricsInput = {
    id?: string
    provider: $Enums.Provider
    userId: string
    username: string
    displayName?: string | null
    profileUrl?: string | null
    email?: string | null
  }

  export type SocialMediaCreateOrConnectWithoutMetricsInput = {
    where: SocialMediaWhereUniqueInput
    create: XOR<SocialMediaCreateWithoutMetricsInput, SocialMediaUncheckedCreateWithoutMetricsInput>
  }

  export type SocialMediaUpsertWithoutMetricsInput = {
    update: XOR<SocialMediaUpdateWithoutMetricsInput, SocialMediaUncheckedUpdateWithoutMetricsInput>
    create: XOR<SocialMediaCreateWithoutMetricsInput, SocialMediaUncheckedCreateWithoutMetricsInput>
    where?: SocialMediaWhereInput
  }

  export type SocialMediaUpdateToOneWithWhereWithoutMetricsInput = {
    where?: SocialMediaWhereInput
    data: XOR<SocialMediaUpdateWithoutMetricsInput, SocialMediaUncheckedUpdateWithoutMetricsInput>
  }

  export type SocialMediaUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: EnumProviderFieldUpdateOperationsInput | $Enums.Provider
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    profileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SocialMediaUncheckedUpdateWithoutMetricsInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: EnumProviderFieldUpdateOperationsInput | $Enums.Provider
    userId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    profileUrl?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DatabaseReportCountCreateWithoutReportInput = {
    id?: string
    count: $Enums.Count
    value?: number
  }

  export type DatabaseReportCountUncheckedCreateWithoutReportInput = {
    id?: string
    count: $Enums.Count
    value?: number
  }

  export type DatabaseReportCountCreateOrConnectWithoutReportInput = {
    where: DatabaseReportCountWhereUniqueInput
    create: XOR<DatabaseReportCountCreateWithoutReportInput, DatabaseReportCountUncheckedCreateWithoutReportInput>
  }

  export type DatabaseReportCountCreateManyReportInputEnvelope = {
    data: DatabaseReportCountCreateManyReportInput | DatabaseReportCountCreateManyReportInput[]
    skipDuplicates?: boolean
  }

  export type DatabaseReportCountUpsertWithWhereUniqueWithoutReportInput = {
    where: DatabaseReportCountWhereUniqueInput
    update: XOR<DatabaseReportCountUpdateWithoutReportInput, DatabaseReportCountUncheckedUpdateWithoutReportInput>
    create: XOR<DatabaseReportCountCreateWithoutReportInput, DatabaseReportCountUncheckedCreateWithoutReportInput>
  }

  export type DatabaseReportCountUpdateWithWhereUniqueWithoutReportInput = {
    where: DatabaseReportCountWhereUniqueInput
    data: XOR<DatabaseReportCountUpdateWithoutReportInput, DatabaseReportCountUncheckedUpdateWithoutReportInput>
  }

  export type DatabaseReportCountUpdateManyWithWhereWithoutReportInput = {
    where: DatabaseReportCountScalarWhereInput
    data: XOR<DatabaseReportCountUpdateManyMutationInput, DatabaseReportCountUncheckedUpdateManyWithoutReportInput>
  }

  export type DatabaseReportCountScalarWhereInput = {
    AND?: DatabaseReportCountScalarWhereInput | DatabaseReportCountScalarWhereInput[]
    OR?: DatabaseReportCountScalarWhereInput[]
    NOT?: DatabaseReportCountScalarWhereInput | DatabaseReportCountScalarWhereInput[]
    id?: StringFilter<"DatabaseReportCount"> | string
    reportId?: StringFilter<"DatabaseReportCount"> | string
    count?: EnumCountFilter<"DatabaseReportCount"> | $Enums.Count
    value?: IntFilter<"DatabaseReportCount"> | number
  }

  export type DatabaseReportCreateWithoutCountsInput = {
    id?: string
    reportDate: Date | string
  }

  export type DatabaseReportUncheckedCreateWithoutCountsInput = {
    id?: string
    reportDate: Date | string
  }

  export type DatabaseReportCreateOrConnectWithoutCountsInput = {
    where: DatabaseReportWhereUniqueInput
    create: XOR<DatabaseReportCreateWithoutCountsInput, DatabaseReportUncheckedCreateWithoutCountsInput>
  }

  export type DatabaseReportUpsertWithoutCountsInput = {
    update: XOR<DatabaseReportUpdateWithoutCountsInput, DatabaseReportUncheckedUpdateWithoutCountsInput>
    create: XOR<DatabaseReportCreateWithoutCountsInput, DatabaseReportUncheckedCreateWithoutCountsInput>
    where?: DatabaseReportWhereInput
  }

  export type DatabaseReportUpdateToOneWithWhereWithoutCountsInput = {
    where?: DatabaseReportWhereInput
    data: XOR<DatabaseReportUpdateWithoutCountsInput, DatabaseReportUncheckedUpdateWithoutCountsInput>
  }

  export type DatabaseReportUpdateWithoutCountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatabaseReportUncheckedUpdateWithoutCountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SocialMediaMetricsCreateManySocialMediaInput = {
    id?: string
    metricName: $Enums.Metric
    metricValue: number
    lastSynced?: Date | string | null
  }

  export type SocialMediaMetricsUpdateWithoutSocialMediaInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricName?: EnumMetricFieldUpdateOperationsInput | $Enums.Metric
    metricValue?: IntFieldUpdateOperationsInput | number
    lastSynced?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SocialMediaMetricsUncheckedUpdateWithoutSocialMediaInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricName?: EnumMetricFieldUpdateOperationsInput | $Enums.Metric
    metricValue?: IntFieldUpdateOperationsInput | number
    lastSynced?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SocialMediaMetricsUncheckedUpdateManyWithoutSocialMediaInput = {
    id?: StringFieldUpdateOperationsInput | string
    metricName?: EnumMetricFieldUpdateOperationsInput | $Enums.Metric
    metricValue?: IntFieldUpdateOperationsInput | number
    lastSynced?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DatabaseReportCountCreateManyReportInput = {
    id?: string
    count: $Enums.Count
    value?: number
  }

  export type DatabaseReportCountUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    count?: EnumCountFieldUpdateOperationsInput | $Enums.Count
    value?: IntFieldUpdateOperationsInput | number
  }

  export type DatabaseReportCountUncheckedUpdateWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    count?: EnumCountFieldUpdateOperationsInput | $Enums.Count
    value?: IntFieldUpdateOperationsInput | number
  }

  export type DatabaseReportCountUncheckedUpdateManyWithoutReportInput = {
    id?: StringFieldUpdateOperationsInput | string
    count?: EnumCountFieldUpdateOperationsInput | $Enums.Count
    value?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}