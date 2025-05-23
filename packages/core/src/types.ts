import type { DescribeQuery, ExprNode, Query } from '@uwdata/mosaic-sql';

/** Query type accepted by a coordinator. */
export type QueryType =
  | string
  | Query
  | DescribeQuery;

/** String indicating a JavaScript data type. */
export type JSType =
  | 'number'
  | 'date'
  | 'boolean'
  | 'string'
  | 'array'
  | 'object';

/** String indicating a requested summary statistic. */
export type Stat =
  | 'count'
  | 'nulls'
  | 'max'
  | 'min'
  | 'distinct';

/** A reference to a database column or expression. */
export type FieldRef = string | ExprNode;

/**
 * A request for metadata information about a database column.
 */
export interface FieldInfoRequest {
  table: string;
  column: FieldRef;
  stats?: Stat[];
}

/**
 * A response with metadata information about a database column.
 */
export interface FieldInfo extends Partial<Record<Stat, number>> {
  table: string,
  column: string,
  sqlType: string,
  type: JSType,
  nullable: boolean
}

/** A result row from a DESCRIBE query. */
export interface ColumnDescription {
  column_name: string,
  column_type: string,
  null: 'YES' | 'NO'
}

/**
 * Interface for components that perform selection activation.
 */
export interface Activatable {
  /**
   * Activate the selection that this component publishes to.
   */
  activate(): void;
}

/**
 * Interface for cache implementations.
 */
export interface Cache {
  get(key: string): any;
  set(key: string, value: any): any;
  clear(): void;
}

/**
 * Interface for logger implementations
 */
export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  log(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  group(label?: any): void;
  groupCollapsed(label?: any): void;
  groupEnd(): void;
}
