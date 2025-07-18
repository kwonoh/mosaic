# SQL Expressions

SQL expression builders. All SQL expressions are represented in the form of an abstract syntax tree (AST). Helper methods and functions build out this tree.

## column

`column(name)`

Create an expression AST node that references a column by _name_.
Upon string coercion, the column name will be properly quoted.

## cte

`cte(name, query, materialized)`

Create an AST node for a Common Table Expression (CTE) to be used within a SQL `WITH` clause.
The resulting node can be passed as an argument to the `Query.with()` method.
The string-valued _name_ and Query-valued _query_ arguments are required.
The optional boolean-valued _materialized_ argument indicates if the CTE should be materialized during query execution; if unspecified, it is left to the backing database to decide.

## literal

`literal(value)`

Create an expression AST node that references a literal _value_.
Upon string coercion, an appropriate SQL value will be produced.
For example, string literals will be properly quoted and JavaScript `Date` objects that match an exact UTC date will be converted to the SQL Date definitions.
The supported primitive types are: boolean, null, number, string, regexp, and Date (maps to SQL Date or Timestamp depending on the value).

## sql

``sql`...` ``

A template tag for arbitrary SQL expressions that do not require deep analysis.
Creates an expression AST node with only a partially structured form consisting of unstructured text and interpolated values.
Interpolated values may be strings, other SQL expressions (such as [`column` references](#column) or [operators](./operators)), or [`Param`](../core/param) values.

The snippet below creates a dynamic expression that adds a Param value to a column.
Contained column references can be extracted using the `collectColumns` method.
Contained Param values can be extracted using the `collectParams` method.

``` js
const param = Param.value(5);
sql`${column("foo")} + ${param}`
```

SQL expressions may be nested, in which case all nested column dependencies and parameter updates are still extractable via the collection visitors.
